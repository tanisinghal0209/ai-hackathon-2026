-- =====================================================================
-- AI EPC Intelligence Platform — Database Schema
-- Run this ONCE in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- It creates the pgvector extension and every table used by app/models/core.py
-- =====================================================================

-- 1. Enable pgvector (needed for the embeddings table)
create extension if not exists vector;

-- 2. Projects
create table if not exists projects (
    id text primary key,
    name text not null,
    client_org text,
    location text,
    lifecycle_stage text,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- Seed the default project used by the hackathon demo (backend/app/routers/ingestion.py
-- currently hardcodes project_id = "default-project" for every upload).
insert into projects (id, name)
values ('default-project', 'Default Hackathon Project')
on conflict (id) do nothing;

-- 3. Documents
create table if not exists documents (
    id text primary key,
    project_id text not null references projects(id),
    filename text not null,
    storage_path text not null,
    upload_timestamp timestamp default now(),
    uploader_id text,
    category text,
    processing_status text default 'Pending',
    page_count integer,
    language text default 'en',
    file_size integer,
    checksum text,
    parser_version text
);

-- 4. Pages
create table if not exists pages (
    id text primary key,
    document_id text not null references documents(id),
    page_number integer not null,
    text text not null
);

-- 5. Chunks
create table if not exists chunks (
    id text primary key,
    page_id text not null references pages(id),
    document_id text not null references documents(id),
    text text not null,
    chunk_order integer not null,
    token_count integer,
    section_heading text,
    clause_identifier text,
    semantic_role text,
    engineering_discipline text,
    equipment_category text,
    parser_confidence float default 1.0,
    chunk_version integer default 1,
    parent_chunk_id text references chunks(id),
    previous_chunk_id text,
    next_chunk_id text,
    created_at timestamp default now()
);

-- 6. Engineering entities extracted from chunks
create table if not exists engineering_entities (
    id text primary key,
    chunk_id text not null references chunks(id),
    document_id text not null references documents(id),
    entity_type text not null,
    entity_value text not null,
    canonical_name text,
    created_at timestamp default now()
);

-- 7. Ontology synonym mapping (used by query expansion)
create table if not exists ontology_entries (
    id text primary key,
    canonical_name text not null unique,
    synonyms jsonb default '[]',
    engineering_discipline text,
    equipment_category text,
    measurement_unit text,
    created_at timestamp default now()
);

-- 8. Embeddings (pgvector column — 1536 dims matches text-embedding-3-small)
create table if not exists embeddings (
    id text primary key,
    chunk_id text not null references chunks(id),
    model text not null,
    model_version text,
    pipeline_version text,
    chunk_version integer default 1,
    vector_dimension integer,
    created_at timestamp default now(),
    is_active integer default 1,
    vector vector(1536)
);

-- 9. Citation records (links AI answers back to source chunks)
create table if not exists citation_records (
    id text primary key,
    response_session_id text not null,
    chunk_id text not null references chunks(id),
    document_id text not null references documents(id),
    cited_text text,
    citation_order integer default 0,
    retrieval_score float,
    created_at timestamp default now()
);

create index if not exists idx_citation_records_session on citation_records(response_session_id);

-- 10. Indexes that matter for retrieval speed
create index if not exists idx_chunks_document on chunks(document_id);
create index if not exists idx_documents_project on documents(project_id);

-- Vector similarity index (IVFFlat). Safe to skip if the table is still empty;
-- Supabase will let you re-run this later once you have data.
create index if not exists idx_embeddings_vector
    on embeddings using ivfflat (vector vector_cosine_ops)
    with (lists = 100);

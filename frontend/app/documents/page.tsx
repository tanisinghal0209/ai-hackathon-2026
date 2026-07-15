"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, FileText, Check, Loader, ChevronLeft, ChevronRight, BookOpen, Trash2, AlertCircle } from 'lucide-react';
import { DOCUMENTS, TEAM, PROJECT, getDocById, type DocMeta } from '../../lib/projectData';

const PIPELINE_STEPS = ['Uploading', 'Validation', 'Parsing', 'Chunking', 'Embedding', 'Indexing', 'Ready'];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  indexed:    { label: 'Indexed',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  failed:     { label: 'Failed',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const STAMP_COLORS: Record<string, { border: string; color: string }> = {
  'APPROVED FOR CONSTRUCTION': { border: '#15803d', color: '#15803d' },
  'ISSUED FOR REVIEW':         { border: '#1d4ed8', color: '#1d4ed8' },
  'FOR INFORMATION ONLY':      { border: '#64748b', color: '#64748b' },
  'APPROVED AS NOTED':         { border: '#b45309', color: '#b45309' },
};

const DISCIPLINE_COLORS: Record<string, string> = {
  'Electrical': '#6366f1',
  'Mechanical': '#3b82f6',
  'Civil': '#f59e0b',
  'Commissioning': '#10b981',
  'PMO': '#8b5cf6',
  'Fire & Life Safety': '#ef4444',
};

function formatBytes(bytes?: number) {
  if (!bytes) return '—';
  return bytes > 1000000 ? `${(bytes / 1000000).toFixed(1)} MB` : `${(bytes / 1000).toFixed(0)} KB`;
}

/** Unique cover page for each document based on its metadata */
function CoverPage({ doc }: { doc: DocMeta }) {
  const stampStyle = STAMP_COLORS[doc.stamp] || STAMP_COLORS['FOR INFORMATION ONLY'];
  const disciplineColor = DISCIPLINE_COLORS[doc.discipline] || '#6366f1';
  const preparer = TEAM[doc.prepared_by];
  const checker = TEAM[doc.checked_by];
  const approver = TEAM[doc.approved_by];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', color: '#0f172a' }}>TATA PROJECTS</div>
          <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase' }}>Digital Infrastructure Division</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fca5a5' }}>CONFIDENTIAL</div>
          <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '4px' }}>Doc Ref: {doc.doc_ref}</div>
          <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px' }}>Rev: {doc.rev}</div>
        </div>
      </div>

      {/* Discipline Strip */}
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '4px', height: '32px', background: disciplineColor, borderRadius: '2px' }} />
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: disciplineColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{doc.discipline} — {doc.category}</div>
          <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>{PROJECT.name} ({PROJECT.code})</div>
        </div>
      </div>

      {/* Document Title Block */}
      <div style={{ margin: '20px 0', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Engineering Document</div>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: '8px 0 14px 0' }}>
          {doc.title}
        </h1>
        <p style={{ fontSize: '0.72rem', color: '#475569', lineHeight: 1.6, borderLeft: `3px solid ${disciplineColor}`, paddingLeft: '10px', background: '#f8fafc', padding: '8px 10px', borderRadius: '0 4px 4px 0' }}>
          {doc.abstract}
        </p>
        <div style={{ marginTop: '14px', fontSize: '0.78rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <div><strong>Project:</strong> {PROJECT.name}</div>
          <div><strong>Code:</strong> {PROJECT.code}</div>
          <div><strong>Client:</strong> {PROJECT.client}</div>
          <div><strong>Date:</strong> {doc.date_issued}</div>
        </div>
      </div>

      {/* Stamp & Approval Bottom */}
      <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
          <div style={{ border: `3px double ${stampStyle.border}`, color: stampStyle.color, padding: '5px 10px', borderRadius: '5px', fontWeight: 800, fontSize: '0.65rem', transform: 'rotate(-3deg)', letterSpacing: '0.04em', maxWidth: '160px', textAlign: 'center' }}>
            {doc.stamp}
          </div>
          <div style={{ border: '2px dashed #94a3b8', padding: '5px 10px', borderRadius: '4px', fontSize: '0.55rem', color: '#64748b', textAlign: 'right' }}>
            {doc.controlled_copy}
          </div>
        </div>

        {/* Approval Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem', border: '1px solid #cbd5e1' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '5px', borderRight: '1px solid #cbd5e1', textAlign: 'left' }}>Prepared By</th>
              <th style={{ padding: '5px', borderRight: '1px solid #cbd5e1', textAlign: 'left' }}>Checked By</th>
              <th style={{ padding: '5px', textAlign: 'left' }}>Approved By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '5px', borderRight: '1px solid #cbd5e1' }}>
                {preparer?.name || '—'}<br /><span style={{ color: '#64748b', fontSize: '0.55rem' }}>ID: {preparer?.id}</span>
              </td>
              <td style={{ padding: '5px', borderRight: '1px solid #cbd5e1' }}>
                {checker?.name || '—'}<br /><span style={{ color: '#64748b', fontSize: '0.55rem' }}>ID: {checker?.id}</span>
              </td>
              <td style={{ padding: '5px' }}>
                {approver?.name || '—'}<br /><span style={{ color: '#64748b', fontSize: '0.55rem' }}>ID: {approver?.id}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Inner content pages — unique sections per document */
function ContentPage({ doc, page }: { doc: DocMeta; page: number }) {
  const disciplineColor = DISCIPLINE_COLORS[doc.discipline] || '#6366f1';
  // page 2 = revision history, pages 3+ = sections
  const sectionIndex = page - 3; // 0-indexed sections start at page 3
  const section = doc.sections[sectionIndex >= 0 ? sectionIndex % doc.sections.length : 0];

  if (page === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#1e293b', fontFamily: '"Inter", sans-serif', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '14px' }}>
          <span>{PROJECT.code}</span>
          <span>DOC CONTROL & REVISION HISTORY</span>
          <span>Rev: {doc.rev}</span>
        </div>
        <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '10px' }}>Document Control & Revision History</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.65rem', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['Rev', 'Date', 'Description', 'Prepared', 'Approved'].map(h => (
                <th key={h} style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 700 }}>A</td>
              <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>01 Aug 2025</td>
              <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>Initial Issue for Client Review</td>
              <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{TEAM[doc.prepared_by]?.name.split(' ')[0]}</td>
              <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{TEAM[doc.approved_by]?.name.split(' ')[0]}</td>
            </tr>
            {doc.rev !== 'A' && (
              <tr>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{doc.rev}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{doc.date_issued}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>Client comments incorporated; specifications updated</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{TEAM[doc.prepared_by]?.name.split(' ')[0]}</td>
                <td style={{ padding: '5px', border: '1px solid #cbd5e1' }}>{TEAM[doc.approved_by]?.name.split(' ')[0]}</td>
              </tr>
            )}
          </tbody>
        </table>

        <h4 style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '10px' }}>Electronic Signatures (Aconex Workflow)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { role: 'PREPARED BY', person: TEAM[doc.prepared_by] },
            { role: 'CHECKED BY', person: TEAM[doc.checked_by] },
            { role: 'APPROVED BY', person: TEAM[doc.approved_by] },
          ].map(({ role, person }) => person && (
            <div key={role} style={{ padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '5px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.5rem', color: '#64748b', textTransform: 'uppercase' }}>{role}</div>
              <div style={{ fontSize: '0.9rem', color: disciplineColor, margin: '4px 0', fontStyle: 'italic' }}>{person.name}</div>
              <div style={{ fontSize: '0.5rem', color: '#94a3b8' }}>ID: {person.id} | Hash: {person.hash}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.55rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: 'auto', textAlign: 'center' }}>
          System generated electronic approval block. No physical signatures required.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
      {/* Running Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
        <span>Project: {PROJECT.code}</span>
        <span>Doc: {doc.doc_ref}</span>
        <span>Rev: {doc.rev}</span>
      </div>

      {/* Body */}
      <div style={{ flexGrow: 1, margin: '16px 0', fontSize: '0.78rem', color: '#334155' }}>
        {section && (
          <>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '10px', borderLeft: `4px solid ${disciplineColor}`, paddingLeft: '10px' }}>
              {section.heading}
            </div>
            <p style={{ lineHeight: 1.7, marginBottom: '14px' }}>{section.body}</p>
          </>
        )}

        {/* Requirements Table if this doc has requirements */}
        {doc.related_requirements.length > 0 && sectionIndex === 0 && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>Related Requirements</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {doc.related_requirements.map(req => (
                <span key={req} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: `${disciplineColor}15`, color: disciplineColor, border: `1px solid ${disciplineColor}30`, fontFamily: 'monospace' }}>
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Risk References */}
        {doc.related_risks.length > 0 && sectionIndex === 1 && (
          <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '6px' }}>⚠️ Associated Risk Register Items</div>
            {doc.related_risks.map(rid => (
              <div key={rid} style={{ fontSize: '0.7rem', color: '#b91c1c', fontFamily: 'monospace' }}>{rid}</div>
            ))}
          </div>
        )}
      </div>

      {/* Running Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '0.55rem', color: '#64748b' }}>
        <span>CONFIDENTIAL — INTERNAL USE ONLY</span>
        <span>Page {page} of {doc.page_count}</span>
        <span>© 2025 Tata Projects Limited</span>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocMeta[]>(DOCUMENTS);
  const [selected, setSelected] = useState<DocMeta>(DOCUMENTS[0]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocMeta | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`http://localhost:8000/api/v1/ingestion/${deleteTarget.document_id}`, {
        method: 'DELETE',
      });
      setDocuments(prev => prev.filter(d => d.document_id !== deleteTarget.document_id));
      // If we deleted the currently selected doc, move to the first remaining one
      if (selected?.document_id === deleteTarget.document_id) {
        const remaining = documents.filter(d => d.document_id !== deleteTarget.document_id);
        if (remaining.length > 0) { setSelected(remaining[0]); setPage(1); }
      }
      showToast('success', `🗑️ "${deleteTarget.filename}" deleted`);
    } catch {
      showToast('error', `❌ Failed to delete "${deleteTarget.filename}"`);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const runPipeline = () => {
    setUploading(true);
    setPipelineStep(0);
    let step = 0;
    const durations = [800, 600, 1200, 900, 1500, 1000, 500];
    const advance = () => {
      step++;
      if (step < PIPELINE_STEPS.length) {
        setPipelineStep(step);
        setTimeout(advance, durations[step]);
      } else {
        setUploading(false);
        setPipelineStep(-1);
      }
    };
    setTimeout(advance, durations[0]);
  };

  /** Poll backend until doc reaches 'Indexed' or 'Failed' status, then append to list */
  const pollUntilIndexed = (docId: string, filename: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 60 seconds max
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`http://localhost:8000/api/v1/ingestion/status/${docId}`);
        if (!res.ok) return;
        const data = await res.json();
        const status: string = (data.status || '').toLowerCase();

        if (status === 'indexed' || status === 'completed' || attempts >= MAX_ATTEMPTS) {
          clearInterval(pollRef.current!);
          // Build a lightweight DocMeta-compatible entry for the new upload
          const newDoc: DocMeta = {
            document_id: docId,
            filename: filename,
            title: filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ').toUpperCase(),
            category: 'Specification',
            status: 'indexed',
            page_count: data.page_count || 1,
            file_size: data.file_size || 0,
            rev: 'A',
            discipline: 'PMO',
            prepared_by: 'doc_controller',
            checked_by: 'project_manager',
            approved_by: 'project_manager',
            doc_ref: filename.split('.')[0],
            date_issued: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            ai_chunks: data.chunk_count || 0,
            stamp: 'FOR INFORMATION ONLY',
            controlled_copy: 'USER UPLOADED DOCUMENT',
            abstract: `User-uploaded document: ${filename}. Ingested and indexed by the AI platform.`,
            sections: [
              { heading: '1.0 DOCUMENT CONTENT', body: 'This document was uploaded by the user and processed through the AI ingestion pipeline. Content has been chunked, embedded and indexed into the vector store for semantic search and knowledge copilot retrieval.' }
            ],
            related_requirements: [],
            related_risks: [],
          };
          setDocuments(prev => {
            if (prev.find(d => d.document_id === docId)) return prev; // avoid duplicate
            return [...prev, newDoc];
          });
          setSelected(newDoc);
          setPage(1);
          showToast('success', `✅ "${filename}" indexed successfully`);
        } else if (status === 'failed') {
          clearInterval(pollRef.current!);
          showToast('error', `❌ Ingestion failed for "${filename}"`);
        }
      } catch {
        // network blip — keep polling
      }
    }, 2000);
  };

  const handleUpload = async (file: File) => {
    // Reset file input so the same file can be uploaded again
    if (fileRef.current) fileRef.current.value = '';
    runPipeline();
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/api/v1/ingestion/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        showToast('error', `❌ Upload failed: ${err.detail || res.statusText}`);
        return;
      }
      const data = await res.json();
      const docId: string = data.document_id;
      // Start polling for indexing completion
      pollUntilIndexed(docId, file.name);
    } catch (e: unknown) {
      showToast('error', `❌ Upload error: ${e instanceof Error ? e.message : 'Network error'}`);
    }
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.filename.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const sc = STATUS_CONFIG[selected?.status] || STATUS_CONFIG.indexed;
  const disciplineColor = DISCIPLINE_COLORS[selected?.discipline] || '#6366f1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 112px)', position: 'relative' }}>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'fixed', top: '20px', right: '24px', zIndex: 9999,
              padding: '12px 18px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
              background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
              color: toast.type === 'success' ? '#10b981' : '#ef4444',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxWidth: '360px',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>Document Library</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>
            {documents.length} documents · Unified technical documentation workspace
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
              background: uploading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              border: '1px solid rgba(99,102,241,0.4)', color: 'white', cursor: 'pointer',
              boxShadow: uploading ? 'none' : '0 0 16px rgba(99,102,241,0.3)'
            }}
          >
            <Upload size={13} strokeWidth={2.5} />
            {uploading ? 'Processing...' : 'Upload Document'}
          </motion.button>
          <input ref={fileRef} type="file" accept=".pdf,.csv,.txt" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Upload Pipeline */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', padding: '14px 16px', flexShrink: 0 }}
          >
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600, marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Ingestion Pipeline</span><span>Active</span>
            </div>
            <div style={{ display: 'flex', gap: '0' }}>
              {PIPELINE_STEPS.map((step, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' }}>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', top: '11px', left: '50%', right: '-50%', height: '2px', background: i < pipelineStep ? '#6366f1' : 'rgba(255,255,255,0.06)', zIndex: 0 }} />
                  )}
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', zIndex: 1,
                    background: i < pipelineStep ? '#6366f1' : i === pipelineStep ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${i <= pipelineStep ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: i === pipelineStep ? '0 0 10px rgba(99,102,241,0.5)' : 'none'
                  }}>
                    {i < pipelineStep ? <Check size={12} color="white" /> : i === pipelineStep ? <Loader size={11} color="#a5b4fc" style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: i <= pipelineStep ? '#a5b4fc' : '#4a4a6a', whiteSpace: 'nowrap' }}>{step}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-panel layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 260px', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Document list */}
        <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search + filter */}
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '7px', padding: '6px 10px', marginBottom: '8px' }}>
              <Search size={13} color="#5a5a7a" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#d0d0e0', fontSize: '0.8rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['All', 'Specification', 'Submittal', 'Testing Report', 'NCR', 'Schedule'].map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)} style={{
                  padding: '3px 8px', borderRadius: '5px', fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: catFilter === cat ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  color: catFilter === cat ? '#a5b4fc' : '#5a5a7a'
                }}>{cat}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
            {filtered.map((doc, i) => {
              const s = STATUS_CONFIG[doc.status] || STATUS_CONFIG.indexed;
              const isSelected = selected?.document_id === doc.document_id;
              const dc = DISCIPLINE_COLORS[doc.discipline] || '#6366f1';
              return (
                <motion.div
                  key={doc.document_id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => { setSelected(doc); setPage(1); }}
                  style={{
                    padding: '9px 10px', borderRadius: '8px', marginBottom: '3px', cursor: 'pointer',
                    background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                    transition: 'all 130ms ease',
                    position: 'relative',
                  }}
                  className="doc-list-item"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ width: 3, height: 36, background: dc, borderRadius: '2px', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c0c0d0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</div>
                      <div style={{ fontSize: '0.65rem', color: '#5a5a7a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.discipline}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '999px', background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                        <span style={{ fontSize: '0.6rem', color: '#5a5a7a' }}>{doc.page_count}p</span>
                      </div>
                    </div>
                    {/* Trash button — appears on hover via CSS class */}
                    <motion.button
                      className="doc-delete-btn"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); setDeleteTarget(doc); }}
                      title="Delete document"
                      style={{
                        flexShrink: 0, background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '6px', padding: '4px 5px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 160ms ease, background 160ms ease',
                        alignSelf: 'center',
                      }}
                    >
                      <Trash2 size={12} color="#ef4444" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CENTRE: Document Viewer */}
        <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#a0a0b0', borderRadius: '5px', padding: '3px 6px', cursor: 'pointer' }}>
                <ChevronLeft size={13} />
              </button>
              <span style={{ fontSize: '0.78rem', color: '#a0a0b0' }}>Page {page} of {selected?.page_count || 10}</span>
              <button onClick={() => setPage(p => Math.min(selected?.page_count || 10, p + 1))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#a0a0b0', borderRadius: '5px', padding: '3px 6px', cursor: 'pointer' }}>
                <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#5a5a7a', display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <BookOpen size={12} />
              {selected?.filename}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => setZoom(z => Math.max(60, z - 10))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#a0a0b0', borderRadius: '5px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.85rem' }}>−</button>
              <span style={{ fontSize: '0.72rem', color: '#a0a0b0', minWidth: '36px', textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#a0a0b0', borderRadius: '5px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.85rem' }}>+</button>
            </div>
          </div>

          {/* Page Canvas */}
          <div style={{ flex: 1, overflow: 'auto', background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selected?.document_id}-${page}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                style={{
                  width: `${zoom * 5}px`, minHeight: `${zoom * 7}px`,
                  background: '#fafafa', color: '#333',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                  padding: '40px', fontSize: '0.875rem', lineHeight: 1.7,
                  borderRadius: '4px', position: 'relative'
                }}
              >
                {selected && (
                  page === 1
                    ? <CoverPage doc={selected} />
                    : <ContentPage doc={selected} page={page} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Metadata + Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          {/* Metadata */}
          <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Metadata</div>
            {[
              ['Discipline', selected?.discipline],
              ['Category', selected?.category],
              ['Revision', selected?.rev],
              ['Pages', selected?.page_count],
              ['Size', formatBytes(selected?.file_size)],
              ['AI Chunks', selected ? `${selected.ai_chunks} chunks` : '—'],
              ['Issued', selected?.date_issued],
              ['Status', <span key="s" style={{ color: sc.color }}>{sc.label}</span>],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.77rem' }}>
                <span style={{ color: '#5a5a7a' }}>{label as string}</span>
                <span style={{ color: '#c0c0d0', fontWeight: 500 }}>{val as React.ReactNode}</span>
              </div>
            ))}
          </div>

          {/* Linked Compliance */}
          {selected?.related_requirements && selected.related_requirements.length > 0 && (
            <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Compliance Requirements</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {selected.related_requirements.map(req => (
                  <span key={req} style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '4px', background: `${disciplineColor}15`, color: disciplineColor, border: `1px solid ${disciplineColor}30`, fontFamily: 'monospace' }}>
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked Risks */}
          {selected?.related_risks && selected.related_risks.length > 0 && (
            <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>⚠️ Linked Risks</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selected.related_risks.map(rid => (
                  <span key={rid} style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'monospace' }}>
                    {rid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            {/* Backdrop */}
            <motion.div
              key="del-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(4px)', zIndex: 1000,
              }}
            />
            {/* Dialog */}
            <motion.div
              key="del-dialog"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.22, ease: [0.34, 1.2, 0.64, 1] }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1001, width: '420px',
                background: 'rgba(14,14,22,0.97)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '16px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(239,68,68,0.1)',
                overflow: 'hidden',
              }}
            >
              {/* Red accent bar */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #ef4444, #b91c1c)' }} />

              <div style={{ padding: '24px' }}>
                {/* Icon + heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '10px',
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <AlertCircle size={20} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f1f4' }}>Delete Document?</div>
                    <div style={{ fontSize: '0.75rem', color: '#5a5a7a', marginTop: '2px' }}>This action cannot be undone.</div>
                  </div>
                </div>

                {/* Filename pill */}
                <div style={{
                  padding: '10px 14px', borderRadius: '8px',
                  background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Document to be deleted</div>
                  <div style={{ fontSize: '0.8rem', color: '#d0d0e0', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                    {deleteTarget.filename}
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#a0a0b0', cursor: 'pointer', transition: 'all 150ms ease',
                    }}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      flex: 1, padding: '9px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
                      background: deleting ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #ef4444, #b91c1c)',
                      border: '1px solid rgba(239,68,68,0.4)', color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      boxShadow: deleting ? 'none' : '0 0 16px rgba(239,68,68,0.3)',
                      transition: 'all 150ms ease',
                    }}
                  >
                    {deleting
                      ? <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Deleting…</>
                      : <><Trash2 size={13} /> Delete Document</>
                    }
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hover CSS for trash button */}
      <style>{`
        .doc-list-item:hover .doc-delete-btn { opacity: 1 !important; }
        .doc-delete-btn:hover { background: rgba(239,68,68,0.22) !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

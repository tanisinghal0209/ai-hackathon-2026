"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Upload, Search, FileText, Check, Loader, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen, X } from 'lucide-react';

interface DocumentInfo {
  document_id: string;
  filename: string;
  category?: string;
  status: string;
  upload_timestamp?: string;
  page_count?: number;
  file_size?: number;
}

const PIPELINE_STEPS = ['Uploading', 'Validation', 'Parsing', 'Chunking', 'Embedding', 'Indexing', 'Ready'];

const PROJECT_NAME = "Phoenix DC-01";
const PROJECT_CODE = "PHX-DC-01";
const CLIENT = "NxtGen Cloud Infrastructure Ltd";
const CONTRACTOR = "Tata Projects Limited";

const MOCK_DOCS: DocumentInfo[] = [
  { document_id: '1', filename: 'PHX-DC-01-EL-SPEC-002_UPS_Specification.pdf', category: 'Specification', status: 'indexed', page_count: 24, file_size: 21535 },
  { document_id: '2', filename: 'PHX-DC-01-EL-SUB-002_Vertiv_UPS_Submittal.pdf', category: 'Submittal', status: 'indexed', page_count: 18, file_size: 18907 },
  { document_id: '3', filename: 'PHX-DC-01-EL-FAT-002_UPS_FAT_Test_Report.pdf', category: 'Testing Report', status: 'indexed', page_count: 15, file_size: 14308 },
  { document_id: '4', filename: 'PHX-DC-01-EL-NCR-001_UPS_Battery_NCR.pdf', category: 'Inspection Report', status: 'indexed', page_count: 8, file_size: 13481 },
  { document_id: '5', filename: 'PHX-DC-01-CX-SCH-001_IST_Master_Procedure.pdf', category: 'Commissioning Procedure', status: 'indexed', page_count: 12, file_size: 9338 },
  { document_id: '6', filename: 'PHX-DC-01-EL-SPEC-001_MV_Switchgear_Spec.pdf', category: 'Specification', status: 'indexed', page_count: 20, file_size: 18400 },
  { document_id: '7', filename: 'PHX-DC-01-ME-SPEC-001_Chiller_Specification.pdf', category: 'Specification', status: 'indexed', page_count: 22, file_size: 21000 },
  { document_id: '8', filename: 'PHX-DC-01-FP-SPEC-001_Fire_Protection_Spec.pdf', category: 'Specification', status: 'indexed', page_count: 16, file_size: 15200 },
];

const MOCK_CITATIONS = [
  { id: 1, page: 2, clause: 'Clause 4.2.1', text: 'Electrical feed must use N+1 redundancy systems.', color: '#ef4444' },
  { id: 2, page: 5, clause: 'Clause 5.1.2', text: 'Battery runtime shall exceed fifteen minutes at full load.', color: '#f59e0b' },
  { id: 3, page: 8, clause: 'Clause 8.4', text: 'Equipment certification must align with IEC 62040 standards.', color: '#3b82f6' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  indexed:    { label: 'Indexed',    color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  failed:     { label: 'Failed',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function formatBytes(bytes?: number) {
  if (!bytes) return '—';
  return bytes > 1000000 ? `${(bytes / 1000000).toFixed(1)} MB` : `${(bytes / 1000).toFixed(0)} KB`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>(MOCK_DOCS);
  const [selected, setSelected] = useState<DocumentInfo>(MOCK_DOCS[0]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/ingestion/')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) { setDocuments(data); setSelected(data[0]); } })
      .catch(() => {});
    const interval = setInterval(() => {
      fetch('http://localhost:8000/api/v1/ingestion/')
        .then(r => r.json())
        .then(data => { if (Array.isArray(data) && data.length > 0) setDocuments(data); })
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, []);

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

  const handleUpload = async (file: File) => {
    runPipeline();
    const formData = new FormData();
    formData.append('file', file);
    try {
      await fetch('http://localhost:8000/api/v1/ingestion/upload', { method: 'POST', body: formData });
    } catch {}
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.filename.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const sc = STATUS_CONFIG[selected?.status] || STATUS_CONFIG.indexed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 112px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>Document Library</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>Unified technical documentation workspace</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Upload button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          <input ref={fileRef} type="file" accept=".pdf,.csv" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Upload Pipeline */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
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
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Document list */}
        <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search + filter */}
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '7px', padding: '6px 10px', marginBottom: '8px' }}>
              <Search size={13} color="#5a5a7a" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#d0d0e0', fontSize: '0.8rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['All', 'Specification', 'Submittal'].map(cat => (
                <button key={cat} onClick={() => setCatFilter(cat)} style={{
                  flex: 1, padding: '4px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', border: 'none',
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
              return (
                <motion.div
                  key={doc.document_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { setSelected(doc); setPage(1); setHighlightedCitation(null); }}
                  style={{
                    padding: '10px', borderRadius: '8px', marginBottom: '3px', cursor: 'pointer',
                    background: isSelected ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                    transition: 'all 130ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <FileText size={14} color={isSelected ? '#a5b4fc' : '#5a5a7a'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c0c0d0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.filename}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px', background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                        <span style={{ fontSize: '0.65rem', color: '#5a5a7a' }}>{doc.page_count ? `${doc.page_count}p` : ''}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CENTRE: PDF Viewer */}
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
            <div style={{ fontSize: '0.75rem', color: '#5a5a7a', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BookOpen size={12} />
              {selected?.filename}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={() => setZoom(z => Math.max(60, z - 10))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#a0a0b0', borderRadius: '5px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.85rem' }}>−</button>
              <span style={{ fontSize: '0.72rem', color: '#a0a0b0', minWidth: '36px', textAlign: 'center' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#a0a0b0', borderRadius: '5px', padding: '3px 7px', cursor: 'pointer', fontSize: '0.85rem' }}>+</button>
            </div>
          </div>

          {/* PDF Canvas */}
          <div style={{ flex: 1, overflow: 'auto', background: 'rgba(0,0,0,0.35)', display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <motion.div
              key={page}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                width: `${zoom * 5}px`, minHeight: `${zoom * 7}px`,
                background: '#fafafa', color: '#333',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                padding: '40px', fontSize: '0.875rem', lineHeight: 1.7,
                borderRadius: '4px', position: 'relative'
              }}
            >
              {page === 1 ? (
                // --- PROMPT 41 & 42: Corporate Cover Page Template ---
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
                  {/* Top Header Block */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em', color: '#0f172a' }}>TATA PROJECTS</div>
                      <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase' }}>Digital Infrastructure Division</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fca5a5' }}>CONFIDENTIAL</div>
                      <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '4px' }}>Doc Ref: {selected?.filename.split('_')[0]}</div>
                    </div>
                  </div>

                  {/* Document Title Block */}
                  <div style={{ margin: '40px 0', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Project Engineering Manual</div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, margin: '8px 0 16px 0' }}>
                      {selected?.filename.includes('UPS') ? 'TECHNICAL SPECIFICATION FOR UNINTERRUPTIBLE POWER SUPPLY (UPS)' :
                       selected?.filename.includes('Switchgear') ? 'TECHNICAL SPECIFICATION FOR MEDIUM VOLTAGE SWITCHGEAR' :
                       selected?.filename.includes('FAT') ? 'FACTORY ACCEPTANCE TEST REPORT - UPS SYSTEM' :
                       selected?.filename.includes('NCR') ? 'NON-CONFORMANCE REPORT - BATTERY DEFICIT' :
                       selected?.filename.includes('IST') ? 'INTEGRATED SYSTEMS TESTING (IST) PLAN & PROCEDURES' :
                       selected?.filename.includes('Chiller') ? 'CENTRIFUGAL CHILLER TECHNICAL SPECIFICATION' :
                       selected?.filename.includes('Fire') ? 'FIRE PROTECTION & CLEAN AGENT SUPPRESSION SPECIFICATION' :
                       'PROJECT ENGINEERING CONTROL DATA MANUAL'}
                    </h1>
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <strong>Project:</strong> {PROJECT_NAME} ({PROJECT_CODE})<br />
                      <strong>Client:</strong> {CLIENT}<br />
                      <strong>Contractor:</strong> {CONTRACTOR}
                    </div>
                  </div>

                  {/* Stamp & Approval Bottom Block */}
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                      {/* stamps */}
                      <div style={{ border: '3px double #15803d', color: '#15803d', padding: '6px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', transform: 'rotate(-4deg)', letterSpacing: '0.05em' }}>
                        APPROVED FOR CONSTRUCTION
                      </div>
                      <div style={{ border: '2px dashed #64748b', padding: '5px 10px', borderRadius: '4px', fontSize: '0.6rem', color: '#64748b' }}>
                        CONTROLLED COPY NO: 04<br />
                        SHREYA JOSHI (DOC CONTROL)
                      </div>
                    </div>

                    {/* Metadata Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem', border: '1px solid #cbd5e1' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'left' }}>Prepared By</th>
                          <th style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'left' }}>Checked By</th>
                          <th style={{ padding: '6px', textAlign: 'left' }}>Approved By</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>
                            Deepak Nambiar<br /><span style={{ color: '#64748b' }}>Site Eng - Electrical</span>
                          </td>
                          <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>
                            Rahul Desai<br /><span style={{ color: '#64748b' }}>Lead MEP - Jacobs</span>
                          </td>
                          <td style={{ padding: '6px' }}>
                            Vikram Sharma<br /><span style={{ color: '#64748b' }}>Project Manager - TPL</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : page === 2 ? (
                // --- PROMPT 43 & 44: Revision History & Approval Signatures ---
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>Document Control & Revision History</h4>
                    
                    {/* Revision Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem', marginBottom: '30px' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Rev</th>
                          <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Date</th>
                          <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Description of Changes</th>
                          <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Prepared</th>
                          <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Approved</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}>A</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>01 Aug 2025</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Initial Issue for Tender / Client Review</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>D. Nambiar</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>V. Sharma</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}>B</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>22 Oct 2025</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>Client comments incorporated; clarified end-of-life battery runtime definition (REQ-UPS-008)</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>D. Nambiar</td>
                          <td style={{ padding: '6px', border: '1px solid #cbd5e1' }}>V. Sharma</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Signatures */}
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>Electronic Signatures (Aconex Approved Workflow)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.55rem', color: '#64748b' }}>PREPARED BY (ELECTRICAL ENGINEER)</div>
                        <div style={{ fontFamily: '"Great Vibes", cursive, sans-serif', fontSize: '1rem', color: '#0369a1', margin: '4px 0' }}>Deepak Nambiar</div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>ID: TPL-006 | Hash: ea82d091</div>
                      </div>
                      <div style={{ padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.55rem', color: '#64748b' }}>REVIEWED BY (DESIGN CONSULTANT)</div>
                        <div style={{ fontFamily: '"Great Vibes", cursive, sans-serif', fontSize: '1rem', color: '#0369a1', margin: '4px 0' }}>Rahul Desai</div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>ID: JAC-001 | Hash: cf8762a4</div>
                      </div>
                      <div style={{ padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.55rem', color: '#64748b' }}>APPROVED BY (PROJECT MANAGER)</div>
                        <div style={{ fontFamily: '"Great Vibes", cursive, sans-serif', fontSize: '1rem', color: '#0369a1', margin: '4px 0' }}>Vikram Sharma</div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>ID: TPL-002 | Hash: b492ef01</div>
                      </div>
                      <div style={{ padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.55rem', color: '#64748b' }}>AUDITED BY (QA/QC MANAGER)</div>
                        <div style={{ fontFamily: '"Great Vibes", cursive, sans-serif', fontSize: '1rem', color: '#0369a1', margin: '4px 0' }}>Kavya Reddy</div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>ID: TPL-005 | Hash: 99c7fde2</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.6rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '10px', textAlign: 'center' }}>
                    System generated electronic approval block. No physical signatures required.
                  </div>
                </div>
              ) : (
                // --- PROMPT 46: Subsequent Pages with Header & Footer ---
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', color: '#1e293b', fontFamily: '"Inter", sans-serif' }}>
                  {/* Running Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    <span>Project: {PROJECT_CODE}</span>
                    <span>Doc ID: {selected?.filename.split('_')[0]}</span>
                    <span>Rev: B</span>
                  </div>

                  {/* Body Content */}
                  <div style={{ flexGrow: 1, margin: '20px 0', fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px' }}>
                      SECTION {page}.0 — TECHNICAL PERFORMANCE REQUIREMENT STANDARDS
                    </div>
                    {MOCK_CITATIONS.map(c => page === c.page && (
                      <motion.div
                        key={c.id}
                        initial={false}
                        animate={{ background: highlightedCitation === c.id ? '#fef08a' : 'transparent' }}
                        transition={{ duration: 0.3 }}
                        style={{ padding: '8px', borderLeft: highlightedCitation === c.id ? `3px solid ${c.color}` : '3px solid transparent', borderRadius: '2px', marginBottom: '12px' }}
                      >
                        <strong>{c.clause}:</strong> {c.text} Additional engineering specification detail for this section follows standard protocol requirements.
                      </motion.div>
                    ))}
                    {!MOCK_CITATIONS.find(c => c.page === page) && (
                      <div>
                        <p style={{ marginBottom: '8px' }}>
                          This page details standard test methods and compliance matrices. All supplied materials and electrical/mechanical equipment must undergo inspection by the QA/QC team (lead by Kavya Reddy) before positioning.
                        </p>
                        <p style={{ marginBottom: '8px' }}>
                          Refer to the Document Control Register (PHX-DC-01-PMO-DOC-001) for linked drawing schematics and details of corresponding RFI queries (e.g., MV Switchgear fault levels on RFI-EL-003).
                        </p>
                        <p>
                          Tests shall follow witnessed schedules. Factory test records are mandatory for release.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Running Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '0.55rem', color: '#64748b' }}>
                    <span>CONFIDENTIAL - INTERNAL USE ONLY</span>
                    <span>Page {page} of {selected?.page_count || 10}</span>
                    <span>Copyright © 2025 Tata Projects</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* RIGHT: Citations + Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          {/* AI Citations */}
          <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              AI References
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {MOCK_CITATIONS.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => { setPage(c.page); setHighlightedCitation(c.id); }}
                  whileHover={{ x: 2 }}
                  style={{
                    padding: '10px', borderRadius: '8px', marginBottom: '6px', cursor: 'pointer',
                    background: highlightedCitation === c.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${highlightedCitation === c.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 130ms ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600 }}>{c.clause}</span>
                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: `${c.color}18`, color: c.color }}>p.{c.page}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#707090', lineHeight: 1.5 }}>{c.text}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Metadata</div>
            {[
              ['Category', selected?.category || 'Specification'],
              ['Pages', selected?.page_count || '—'],
              ['Size', formatBytes(selected?.file_size)],
              ['Status', <span key="status-badge" style={{ color: sc.color }}>{sc.label}</span>],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
                <span style={{ color: '#5a5a7a' }}>{label as string}</span>
                <span style={{ color: '#c0c0d0', fontWeight: 500 }}>{val as React.ReactNode}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

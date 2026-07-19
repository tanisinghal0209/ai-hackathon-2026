"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, Clock, ChevronRight, FileText, Zap, ExternalLink } from 'lucide-react';
import { COMPLIANCE_FINDINGS, DOCUMENTS, getDocById, type ComplianceFinding } from '@/lib/projectData';

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; color: string; badge: string; label: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)', color: '#ef4444', badge: 'rgba(239,68,68,0.15)', label: 'Critical' },
  Major:    { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', badge: 'rgba(245,158,11,0.15)', label: 'Major' },
  Minor:    { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.25)',  color: '#3b82f6', badge: 'rgba(59,130,246,0.15)',  label: 'Minor' },
  Passed:   { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', color: '#10b981', badge: 'rgba(16,185,129,0.15)', label: 'Passed' },
};

const DISCIPLINE_COLORS: Record<string, string> = {
  'Electrical': '#6366f1',
  'Mechanical': '#3b82f6',
  'Civil': '#f59e0b',
  'PMO': '#8b5cf6',
  'Fire & Life Safety': '#ef4444',
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'rgba(20,20,32,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
    >
      <span style={{ width: 34, height: 34, borderRadius: '8px', background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={color} strokeWidth={2} />
      </span>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f1f4', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: '#5a5a7a', marginTop: '3px' }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function CompliancePage() {
  const [findings, setFindings] = useState<ComplianceFinding[]>(COMPLIANCE_FINDINGS);
  const [selected, setSelected] = useState<ComplianceFinding>(COMPLIANCE_FINDINGS[0]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('All');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/compliance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specification_text: findings.map(f => `${f.requirement_id}: ${f.requirement_description}`).join('\n'),
          vendor_text: findings.map(f => f.vendor_value).join('\n'),
        }),
      });
      const data = await res.json();
      if (data.data?.findings?.length > 0) {
        setFindings(data.data.findings);
        setSelected(data.data.findings[0]);
      }
    } catch {
      // keep existing mock data
    } finally {
      setLoading(false);
    }
  };

  const sc = SEVERITY_CONFIG[selected?.severity] || SEVERITY_CONFIG.Passed;
  const critCount = findings.filter(f => f.severity === 'Critical').length;
  const majorCount = findings.filter(f => f.severity === 'Major').length;
  const passedCount = findings.filter(f => f.severity === 'Passed').length;
  const overallScore = Math.round((passedCount / findings.length) * 100);

  const filtered = filterSeverity === 'All' ? findings : findings.filter(f => f.severity === filterSeverity);

  const sourceDoc = selected ? getDocById(selected.source_document_id) : null;
  const vendorDoc = selected ? getDocById(selected.vendor_document_id) : null;
  const sourceColor = sourceDoc ? (DISCIPLINE_COLORS[sourceDoc.discipline] || '#6366f1') : '#6366f1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 112px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>Compliance Review</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>AI-powered specification vs submittal analysis — {findings.length} requirements checked</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAnalyze} disabled={loading}
            style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
              background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              border: '1px solid rgba(99,102,241,0.4)', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: loading ? 'none' : '0 0 16px rgba(99,102,241,0.3)',
            }}
          >
            <Zap size={13} strokeWidth={2.5} />
            {loading ? 'Analyzing…' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>
        <StatCard icon={ShieldCheck}    label="Compliance Score"   value={`${overallScore}%`} color="#10b981" />
        <StatCard icon={XCircle}        label="Critical Findings"  value={critCount}           color="#ef4444" />
        <StatCard icon={AlertTriangle}  label="Major Findings"     value={majorCount}          color="#f59e0b" />
        <StatCard icon={Clock}          label="Passed Checks"      value={passedCount}         color="#3b82f6" />
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {['All', 'Critical', 'Major', 'Passed'].map(sev => (
          <button key={sev} onClick={() => setFilterSeverity(sev)} style={{
            padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none',
            background: filterSeverity === sev ? (SEVERITY_CONFIG[sev]?.badge || 'rgba(99,102,241,0.2)') : 'rgba(255,255,255,0.04)',
            color: filterSeverity === sev ? (SEVERITY_CONFIG[sev]?.color || '#a5b4fc') : '#5a5a7a',
          }}>{sev}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#5a5a7a', alignSelf: 'center' }}>
          {filtered.length} requirement{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main 3-panel workspace */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Findings list */}
        <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Findings ({filtered.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filtered.map((f, i) => {
              const sc2 = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.Passed;
              const isSelected = selected?.requirement_id === f.requirement_id;
              const srcDoc = getDocById(f.source_document_id);
              return (
                <motion.div
                  key={f.requirement_id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(f)}
                  style={{
                    padding: '10px', borderRadius: '8px', marginBottom: '4px',
                    background: isSelected ? sc2.bg : 'transparent',
                    border: `1px solid ${isSelected ? sc2.border : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 130ms ease',
                  }}
                  whileHover={{ background: isSelected ? sc2.bg : 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.67rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)' }}>{f.requirement_id}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '999px', background: sc2.badge, color: sc2.color }}>{f.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a0a0b0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {f.requirement_description}
                  </div>
                  {srcDoc && (
                    <div style={{ fontSize: '0.6rem', color: '#4a4a6a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={9} />
                      {srcDoc.discipline}
                    </div>
                  )}
                  {isSelected && <ChevronRight size={12} color={sc2.color} style={{ alignSelf: 'flex-end' }} />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CENTRE: Comparison */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected?.requirement_id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)', display: 'block' }}>{selected?.requirement_id}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#d0d0e0' }}>{selected?.compliance_status}</span>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: sc.badge, color: sc.color, border: `1px solid ${sc.border}` }}>
                {selected?.severity}
              </span>
            </div>

            {/* Document pills */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '8px', flexShrink: 0 }}>
              {sourceDoc && (
                <div style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: `${sourceColor}15`, color: sourceColor, border: `1px solid ${sourceColor}25`, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={9} /> SPEC: {sourceDoc.doc_ref}
                </div>
              )}
              {vendorDoc && vendorDoc.document_id !== sourceDoc?.document_id && (
                <div style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={9} /> SUB: {vendorDoc.doc_ref}
                </div>
              )}
            </div>

            {/* Comparison */}
            <div style={{ flex: 1, padding: '16px', display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px', overflowY: 'auto' }}>
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.63rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>
                  📋 Specification Requirement
                </div>
                <p style={{ fontSize: '0.875rem', color: '#c0c0d0', lineHeight: 1.6 }}>{selected?.requirement_description}</p>
              </div>
              <div style={{ padding: '14px', background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '10px' }}>
                <div style={{ fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px', color: sc.color }}>
                  🏭 Vendor Offered Value
                </div>
                <p style={{ fontSize: '0.875rem', color: '#c0c0d0', lineHeight: 1.6 }}>{selected?.vendor_value}</p>
              </div>
            </div>

            {/* Confidence bar */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: '#5a5a7a', whiteSpace: 'nowrap' }}>AI Confidence</span>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(selected?.confidence ?? 0) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
                  style={{ height: '100%', borderRadius: '2px', background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.5)' }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600 }}>{((selected?.confidence ?? 0) * 100).toFixed(0)}%</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* RIGHT: AI Explanation + Document Links */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected?.requirement_id + '_ai'}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}
            style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Analysis</span>
            </div>
            <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>Explanation</div>
                <p style={{ fontSize: '0.8125rem', color: '#a0a0b0', lineHeight: 1.65 }}>{selected?.explanation}</p>
              </div>
              <div style={{ padding: '12px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>Recommendation</div>
                <p style={{ fontSize: '0.8rem', color: '#a5b4fc', lineHeight: 1.65 }}>{selected?.recommendation}</p>
              </div>

              {/* Source Documents */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>Source Documents</div>
                {[sourceDoc, vendorDoc].filter((d, i, arr) => d && arr.findIndex(x => x?.document_id === d?.document_id) === i).map(doc => doc && (
                  <div key={doc.document_id} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.65rem', color: '#a0a0b0', fontWeight: 600 }}>{doc.doc_ref}</div>
                    <div style={{ fontSize: '0.6rem', color: '#5a5a7a', marginTop: '2px', lineHeight: 1.4 }}>{doc.title.length > 55 ? doc.title.slice(0, 55) + '…' : doc.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.58rem', color: DISCIPLINE_COLORS[doc.discipline] || '#6366f1' }}>{doc.discipline}</span>
                      <span style={{ fontSize: '0.58rem', color: '#4a4a6a' }}>Rev {doc.rev} · {doc.page_count}p</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

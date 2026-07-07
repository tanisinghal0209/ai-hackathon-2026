"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, Clock, ChevronRight, FileText, Zap } from 'lucide-react';

interface Deviation {
  requirement_id: string;
  requirement_description: string;
  vendor_value: string;
  compliance_status: string;
  severity: string;
  confidence: number;
  explanation: string;
  recommendation: string;
}

interface ComplianceReport {
  overall_score: number;
  total_findings: number;
  findings: Deviation[];
  recommendation: string;
}

const SEVERITY_CONFIG: Record<string, { bg: string; border: string; color: string; badge: string; label: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)', color: '#ef4444', badge: 'rgba(239,68,68,0.15)', label: 'Critical' },
  Major:    { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', badge: 'rgba(245,158,11,0.15)', label: 'Major' },
  Minor:    { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.25)',  color: '#3b82f6', badge: 'rgba(59,130,246,0.15)',  label: 'Minor' },
  Passed:   { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', color: '#10b981', badge: 'rgba(16,185,129,0.15)', label: 'Passed' },
};

const MOCK_FINDINGS: Deviation[] = [
  {
    requirement_id: 'REQ-UPS-001',
    requirement_description: 'UPS shall be configured in N+1 redundancy to ensure system continuity under single point of failure.',
    vendor_value: 'The proposed UPS system uses N redundancy configuration.',
    compliance_status: 'Non-Compliant',
    severity: 'Critical',
    confidence: 0.97,
    explanation: 'Vendor has proposed an N-only configuration which lacks the additional redundant module required by the specification. Under N configuration, any UPS module failure will cause system downtime.',
    recommendation: 'Submit RFI-103 requesting vendor to revise proposal to include one additional UPS module to achieve N+1 configuration. Obtain revised pricing and delivery schedule.',
  },
  {
    requirement_id: 'REQ-UPS-002',
    requirement_description: 'Battery autonomy shall be minimum 15 minutes at full IT load of 2MW.',
    vendor_value: 'Battery runtime is 10 minutes at full load.',
    compliance_status: 'Non-Compliant',
    severity: 'Critical',
    confidence: 0.99,
    explanation: 'A 5-minute shortfall in battery autonomy means the facility cannot sustain operations during extended power events. This directly impacts SLA obligations.',
    recommendation: 'Request vendor to include additional battery extension cabinet (BEC) with sufficient cells to bridge the 5-minute deficit. Verify total weight loading on raised floor.',
  },
  {
    requirement_id: 'REQ-UPS-003',
    requirement_description: 'UPS output voltage shall be 415V, 3-phase, 50Hz compliant with IEC standards.',
    vendor_value: 'Output voltage is 415V, 3-phase, 50Hz.',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.98,
    explanation: 'Vendor confirms identical output voltage parameters matching the specification requirement exactly.',
    recommendation: 'No action required. Confirm with site electrical team during FAT.',
  },
  {
    requirement_id: 'REQ-UPS-004',
    requirement_description: 'UPS shall comply with IEC 62040-1 and IEC 62040-3 performance standards.',
    vendor_value: 'IEC 62040 compliance is declared without specific sub-standard references.',
    compliance_status: 'Partial',
    severity: 'Major',
    confidence: 0.88,
    explanation: 'Vendor references the parent standard IEC 62040 without specifying compliance with the performance classification sub-standard IEC 62040-3.',
    recommendation: 'Issue RFI requesting written confirmation and test certificate confirming compliance with IEC 62040-3 VFI-SS-111 classification.',
  },
];

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(20,20,32,0.85)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      }}
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
  const [specText, setSpecText] = useState(
    `REQ-UPS-001: UPS shall be configured in N+1 redundancy.\nREQ-UPS-002: Battery autonomy shall be minimum 15 minutes at full IT load.\nREQ-UPS-003: UPS output voltage shall be 415V, 3-phase, 50Hz.\nREQ-UPS-004: UPS shall comply with IEC 62040.`
  );
  const [vendorText, setVendorText] = useState(
    `The proposed UPS system is configured as N redundancy.\nBattery runtime is 10 minutes at full load.\nOutput voltage is 415V, 3-phase, 50Hz.\nCompliance is declared against IEC 62040.`
  );
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [findings, setFindings] = useState<Deviation[]>(MOCK_FINDINGS);
  const [selected, setSelected] = useState<Deviation>(MOCK_FINDINGS[0]);
  const [showInputs, setShowInputs] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/compliance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specification_text: specText, vendor_text: vendorText }),
      });
      const data = await res.json();
      if (data.data) {
        setReport(data.data);
        setFindings(data.data.findings);
        if (data.data.findings.length > 0) setSelected(data.data.findings[0]);
      }
    } catch {
      // fallback to mock
    } finally {
      setLoading(false);
    }
  };

  const sc = SEVERITY_CONFIG[selected?.severity] || SEVERITY_CONFIG.Passed;
  const critCount = findings.filter(f => f.severity === 'Critical').length;
  const majorCount = findings.filter(f => f.severity === 'Major').length;
  const passedCount = findings.filter(f => f.severity === 'Passed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 112px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>
            Compliance Review
          </h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>
            AI-powered specification vs submittal analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowInputs(!showInputs)}
            style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#a0a0b0', cursor: 'pointer'
            }}
          >
            {showInputs ? 'Hide Inputs' : 'Edit Documents'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
              background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              border: '1px solid rgba(99,102,241,0.4)', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: loading ? 'none' : '0 0 16px rgba(99,102,241,0.3)',
              transition: 'all 180ms ease'
            }}
          >
            <Zap size={13} strokeWidth={2.5} />
            {loading ? 'Analyzing…' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>
        <StatCard icon={ShieldCheck} label="Compliance Score" value={`${report?.overall_score ?? 74}%`} color="#10b981" />
        <StatCard icon={XCircle}    label="Critical Findings" value={critCount} color="#ef4444" />
        <StatCard icon={AlertTriangle} label="Major Findings" value={majorCount} color="#f59e0b" />
        <StatCard icon={Clock}      label="Passed Checks" value={passedCount} color="#3b82f6" />
      </div>

      {/* Document Input Drawer */}
      <AnimatePresence>
        {showInputs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'rgba(20,20,32,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
              {[['Specification', specText, setSpecText], ['Vendor Submittal', vendorText, setVendorText]].map(([label, val, setter]) => (
                <div key={label as string} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: '#707090', fontWeight: 500 }}>
                    <FileText size={11} style={{ marginRight: 4 }} />{label as string}
                  </label>
                  <textarea
                    value={val as string}
                    onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                    rows={5}
                    style={{
                      background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px',
                      padding: '10px', color: '#c0c0d0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                      resize: 'none', outline: 'none', lineHeight: 1.6
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-panel workspace */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT: Findings list */}
        <div style={{
          background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Findings ({findings.length})
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {findings.map((f, i) => {
              const sc2 = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.Passed;
              const isSelected = selected?.requirement_id === f.requirement_id;
              return (
                <motion.div
                  key={f.requirement_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(f)}
                  style={{
                    padding: '10px', borderRadius: '8px', marginBottom: '4px',
                    background: isSelected ? sc2.bg : 'transparent',
                    border: `1px solid ${isSelected ? sc2.border : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 130ms ease',
                    display: 'flex', flexDirection: 'column', gap: '4px'
                  }}
                  whileHover={{ background: isSelected ? sc2.bg : 'rgba(255,255,255,0.03)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)' }}>{f.requirement_id}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: '999px', background: sc2.badge, color: sc2.color }}>
                      {f.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#a0a0b0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {f.requirement_description}
                  </div>
                  {isSelected && <ChevronRight size={12} color={sc2.color} style={{ alignSelf: 'flex-end' }} />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CENTRE: Side-by-side comparison */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected?.requirement_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)', display: 'block' }}>{selected?.requirement_id}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d0d0e0' }}>{selected?.compliance_status}</span>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: sc.badge, color: sc.color, border: `1px solid ${sc.border}` }}>
                {selected?.severity}
              </span>
            </div>

            {/* Comparison body */}
            <div style={{ flex: 1, padding: '16px', display: 'grid', gridTemplateRows: '1fr 1fr', gap: '12px', overflowY: 'auto' }}>
              {/* Spec */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.65rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>
                  📋 Specification Requirement
                </div>
                <p style={{ fontSize: '0.875rem', color: '#c0c0d0', lineHeight: 1.6 }}>{selected?.requirement_description}</p>
              </div>

              {/* Vendor */}
              <div style={{
                padding: '14px',
                background: sc.bg,
                border: `1px solid ${sc.border}`,
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px', color: sc.color }}>
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

        {/* RIGHT: AI explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected?.requirement_id + '_ai'}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AI Analysis
              </span>
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
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

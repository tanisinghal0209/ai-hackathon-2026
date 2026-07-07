"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Zap, AlertTriangle, Clock, GitBranch, Package, FileText, ChevronRight } from 'lucide-react';

const DUMMY_SCHEDULE = [
  { id: "A1", name: "Site Clearance", duration: 5, predecessors: [], procurement_status: "Clear" },
  { id: "A2", name: "Foundation Pour", duration: 10, predecessors: ["A1"], procurement_status: "Clear" },
  { id: "A3", name: "Switchgear Procurement", duration: 15, predecessors: [], procurement_status: "Delayed", open_rfis: 1 },
  { id: "A4", name: "Switchgear Installation", duration: 5, predecessors: ["A2", "A3"], procurement_status: "Clear" },
  { id: "A5", name: "UPS Delivery & Install", duration: 7, predecessors: ["A2"], compliance_issues: 1 },
  { id: "A6", name: "Integrated Systems Testing", duration: 10, predecessors: ["A4", "A5"], procurement_status: "Clear" },
];

interface Activity {
  id: string; name: string; duration: number;
  es: number; ef: number; ls: number; lf: number;
  float: number; is_critical: boolean; risk_category: string;
  procurement_status?: string; open_rfis?: number; compliance_issues?: number;
}

interface AIRiskMitigation {
  activity_id: string; activity_name: string;
  risk_driver: string; impact_analysis: string; mitigation_strategy: string;
}

interface ScheduleReport {
  project_duration: number;
  critical_path: string[];
  activities: Activity[];
  ai_risk_mitigations: AIRiskMitigation[];
}

// Mock report for offline demo
const MOCK_REPORT: ScheduleReport = {
  project_duration: 37,
  critical_path: ['A1', 'A2', 'A3', 'A4', 'A6'],
  activities: [
    { id: 'A1', name: 'Site Clearance', duration: 5, es: 0, ef: 5, ls: 0, lf: 5, float: 0, is_critical: true, risk_category: 'Civil' },
    { id: 'A2', name: 'Foundation Pour', duration: 10, es: 5, ef: 15, ls: 5, lf: 15, float: 0, is_critical: true, risk_category: 'Civil' },
    { id: 'A3', name: 'Switchgear Procurement', duration: 15, es: 0, ef: 15, ls: 0, lf: 15, float: 0, is_critical: true, risk_category: 'Procurement', procurement_status: 'Delayed', open_rfis: 1 },
    { id: 'A4', name: 'Switchgear Installation', duration: 5, es: 15, ef: 20, ls: 15, lf: 20, float: 0, is_critical: true, risk_category: 'Electrical' },
    { id: 'A5', name: 'UPS Delivery & Install', duration: 7, es: 15, ef: 22, ls: 20, lf: 27, float: 5, is_critical: false, risk_category: 'Electrical', compliance_issues: 1 },
    { id: 'A6', name: 'Integrated Systems Testing', duration: 10, es: 22, ef: 32, ls: 22, lf: 32, float: 0, is_critical: true, risk_category: 'Commissioning' },
  ],
  ai_risk_mitigations: [
    { activity_id: 'A3', activity_name: 'Switchgear Procurement', risk_driver: 'Customs delay', impact_analysis: 'A 3-week delay cascades through A4 and A6, extending the critical path by 21 days and threatening the Q3 deadline.', mitigation_strategy: 'Engage alternative logistics provider for port clearance. Pre-position materials at bonded warehouse. Issue formal procurement expediting notice to vendor within 48 hours.' },
    { activity_id: 'A5', activity_name: 'UPS Delivery & Install', risk_driver: 'Compliance mismatch REQ-UPS-001', impact_analysis: 'N-config mismatch requires re-specification, adding potential 2-week procurement loop before installation can begin.', mitigation_strategy: 'Issue RFI-104 requesting N+1 layout. Notify vendor of non-compliance formally. Adjust programme float buffer to absorb revision cycle.' },
  ],
};

export default function SchedulePage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScheduleReport | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setReport(null);
    setSelectedActivity(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/schedule/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: DUMMY_SCHEDULE }),
      });
      const data = await res.json();
      if (data.data) {
        setReport(data.data);
        setSelectedActivity(data.data.activities[0]);
      } else throw new Error();
    } catch {
      // Use mock data for demo
      setReport(MOCK_REPORT);
      setSelectedActivity(MOCK_REPORT.activities[0]);
    } finally {
      setLoading(false);
    }
  };

  const mitigation = report?.ai_risk_mitigations.find(m => m.activity_id === selectedActivity?.id) || null;
  const MAX_DAYS = report?.project_duration || 37;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 112px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>Schedule Intelligence</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>CPM critical path analysis with AI-powered risk mitigation</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleAnalyze} disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
            background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
            border: '1px solid rgba(99,102,241,0.4)', color: 'white', cursor: 'pointer',
            boxShadow: loading ? 'none' : '0 0 16px rgba(99,102,241,0.3)'
          }}
        >
          <Zap size={13} strokeWidth={2.5} />
          {loading ? 'Running CPM Analysis…' : 'Analyze Schedule'}
        </motion.button>
      </motion.div>

      {/* Empty state */}
      <AnimatePresence mode="wait">
        {!report && !loading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', gap: '16px' }}
          >
            <div style={{ width: 56, height: 56, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarClock size={24} color="#6366f1" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#d0d0e0', marginBottom: '6px' }}>No Schedule Loaded</h3>
              <p style={{ fontSize: '0.82rem', color: '#5a5a7a' }}>Click &quot;Analyze Schedule&quot; to run CPM logic and generate AI risk mitigations</p>
            </div>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} style={{ width: 32, height: 32, border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%' }} />
              <span style={{ fontSize: '0.875rem', color: '#a0a0b0' }}>Running deterministic CPM graph traversal…</span>
            </div>
          </motion.div>
        )}

        {report && (
          <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

            {/* LEFT: Gantt + Activity Table */}
            <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#d0d0e0' }}>Gantt Chart</span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: '#5a5a7a' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 6, background: '#ef4444', borderRadius: '2px', display: 'block' }} /> Critical Path</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 6, background: '#3b82f6', borderRadius: '2px', display: 'block' }} /> Non-Critical</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>Total: {report.project_duration} days</span>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {/* Gantt Bars */}
                <div style={{ marginBottom: '20px' }}>
                  {/* Day axis */}
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', marginBottom: '4px' }}>
                    <div />
                    <div style={{ display: 'flex', position: 'relative', height: '18px' }}>
                      {[0, 10, 20, 30, MAX_DAYS].map(d => (
                        <span key={d} style={{ position: 'absolute', left: `${(d / MAX_DAYS) * 100}%`, fontSize: '0.6rem', color: '#4a4a6a', transform: 'translateX(-50%)' }}>d{d}</span>
                      ))}
                    </div>
                  </div>

                  {report.activities.map((act, i) => {
                    const isSelected = selectedActivity?.id === act.id;
                    const left = (act.es / MAX_DAYS) * 100;
                    const width = (act.duration / MAX_DAYS) * 100;
                    const barColor = act.is_critical ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)';
                    return (
                      <div
                        key={act.id}
                        onClick={() => setSelectedActivity(act)}
                        style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', marginBottom: '6px', cursor: 'pointer', padding: '4px', borderRadius: '6px', background: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'background 130ms ease' }}
                      >
                        <div style={{ fontSize: '0.75rem', color: isSelected ? '#a5b4fc' : '#a0a0b0', fontWeight: isSelected ? 600 : 400, paddingRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {act.id}. {act.name}
                        </div>
                        <div style={{ position: 'relative', height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'visible' }}>
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: `${width}%`, opacity: 1 }}
                            transition={{ delay: i * 0.06, duration: 0.5, ease: [0, 0, 0.2, 1] }}
                            style={{
                              position: 'absolute', left: `${left}%`, height: '100%',
                              background: barColor, borderRadius: '4px',
                              boxShadow: act.is_critical ? '0 0 8px rgba(239,68,68,0.4)' : '0 0 6px rgba(59,130,246,0.3)'
                            }}
                          />
                          {(act.procurement_status === 'Delayed' || act.open_rfis) && (
                            <div style={{ position: 'absolute', left: `${left + width}%`, top: '-1px', marginLeft: '4px' }}>
                              <AlertTriangle size={12} color="#f59e0b" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Activity Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['ID', 'Activity', 'ES→EF', 'Float', 'Status'].map(h => (
                        <th key={h} style={{ padding: '6px 8px', color: '#5a5a7a', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.activities.map((act) => {
                      const isSelected = selectedActivity?.id === act.id;
                      return (
                        <tr key={act.id} onClick={() => setSelectedActivity(act)} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: isSelected ? 'rgba(99,102,241,0.06)' : 'transparent', transition: 'background 130ms ease' }}>
                          <td style={{ padding: '7px 8px', fontFamily: 'var(--font-mono)', color: '#5a5a7a', fontSize: '0.7rem' }}>{act.id}</td>
                          <td style={{ padding: '7px 8px', color: '#c0c0d0', fontWeight: 500 }}>
                            {act.name}
                            {act.procurement_status === 'Delayed' && <span style={{ marginLeft: '6px', fontSize: '0.62rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '1px 5px', borderRadius: '4px' }}>Delayed</span>}
                            {act.open_rfis ? <span style={{ marginLeft: '4px', fontSize: '0.62rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '1px 5px', borderRadius: '4px' }}>RFI</span> : null}
                          </td>
                          <td style={{ padding: '7px 8px', color: '#707090' }}>D{act.es}→D{act.ef}</td>
                          <td style={{ padding: '7px 8px', color: act.is_critical ? '#ef4444' : '#707090', fontWeight: act.is_critical ? 600 : 400 }}>{act.float}d</td>
                          <td style={{ padding: '7px 8px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: act.is_critical ? 'rgba(239,68,68,0.15)' : 'rgba(156,163,175,0.1)', color: act.is_critical ? '#ef4444' : '#707090' }}>
                              {act.is_critical ? 'Critical' : 'Float'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Intelligence Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedActivity?.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.72rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Activity Intelligence
                </div>
                {selectedActivity && (
                  <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{selectedActivity.id}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#d0d0e0' }}>{selectedActivity.name}</div>
                      <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, background: selectedActivity.is_critical ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: selectedActivity.is_critical ? '#ef4444' : '#3b82f6' }}>
                        {selectedActivity.is_critical ? 'Critical Path' : `${selectedActivity.float}d Float`}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {[
                        { icon: Clock, label: 'Duration', val: `${selectedActivity.duration}d` },
                        { icon: GitBranch, label: 'Float', val: `${selectedActivity.float}d` },
                        { icon: Package, label: 'Procurement', val: selectedActivity.procurement_status || 'Clear' },
                        { icon: FileText, label: 'Open RFIs', val: selectedActivity.open_rfis || 0 },
                      ].map(({ icon: Icon, label, val }, i) => (
                        <div key={i} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <Icon size={11} color="#5a5a7a" />
                            <span style={{ fontSize: '0.65rem', color: '#5a5a7a' }}>{label}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c0c0d0' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {mitigation && (
                      <>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={11} /> Impact Analysis
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#a0a0b0', lineHeight: 1.65 }}>{mitigation.impact_analysis}</p>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <Zap size={11} color="#10b981" />
                            <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Mitigation</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#6ee7b7', lineHeight: 1.65 }}>{mitigation.mitigation_strategy}</p>
                        </div>
                      </>
                    )}
                    {!mitigation && (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#4a4a6a', fontSize: '0.8rem' }}>
                        No active risk warnings for this activity.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import './Schedule.css';

const DUMMY_SCHEDULE = [
  { id: "A1", name: "Site Clearance", duration: 5, predecessors: [], procurement_status: "Clear" },
  { id: "A2", name: "Foundation Pour", duration: 10, predecessors: ["A1"], procurement_status: "Clear" },
  { id: "A3", name: "Switchgear Procurement", duration: 15, predecessors: [], procurement_status: "Delayed", open_rfis: 1 },
  { id: "A4", name: "Switchgear Installation", duration: 5, predecessors: ["A2", "A3"], procurement_status: "Clear" },
  { id: "A5", name: "UPS Delivery & Install", duration: 7, predecessors: ["A2"], compliance_issues: 1 },
  { id: "A6", name: "Integrated Systems Testing", duration: 10, predecessors: ["A4", "A5"], procurement_status: "Clear" }
];

interface Activity {
  id: string;
  name: string;
  duration: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  float: number;
  is_critical: boolean;
  risk_category: string;
  procurement_status?: string;
  open_rfis?: number;
  compliance_issues?: number;
}

interface AIRiskMitigation {
  activity_id: string;
  activity_name: string;
  risk_driver: string;
  impact_analysis: string;
  mitigation_strategy: string;
}

interface ScheduleReport {
  project_duration: number;
  critical_path: string[];
  activities: Activity[];
  ai_risk_mitigations: AIRiskMitigation[];
}

export default function SchedulePage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScheduleReport | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setReport(null);
    setSelectedActivity(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/schedule/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: DUMMY_SCHEDULE }),
      });
      
      const data = await response.json();
      if (data.data) {
        setReport(data.data);
        if (data.data.activities && data.data.activities.length > 0) {
          setSelectedActivity(data.data.activities[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMitigationForSelected = () => {
    if (!selectedActivity || !report) return null;
    return report.ai_risk_mitigations.find(
      (m) => m.activity_id === selectedActivity.id
    );
  };

  const currentMitigation = getMitigationForSelected();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 6rem)' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Predictive Schedule Risk Engine</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deterministic Critical Path Method (CPM) enriched with predictive AI mitigation insights.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '0.6rem 1.5rem',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Performing Graph Pass...' : 'Load & Analyze EPC Schedule'}
        </button>
      </div>

      {report ? (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1rem',
          overflow: 'hidden'
        }}>
          {/* LEFT: Gantt Visualizer & Activity List */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Gantt Visual Workspace</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Total duration: <strong style={{ color: '#10b981' }}>{report.project_duration} days</strong>
              </div>
            </div>

            {/* Simulated Gantt Grid */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: 'var(--glass-border)',
              borderRadius: '6px',
              padding: '1rem',
              position: 'relative'
            }}>
              {/* Day markers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(30, 1fr)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}>
                <div>Activity</div>
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>{i + 1}</div>
                ))}
              </div>

              {/* Task rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                {report.activities.map((act) => {
                  const barStart = act.es + 1; // 1-indexed column start
                  const barSpan = act.duration;
                  const isSelected = selectedActivity?.id === act.id;

                  return (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px repeat(30, 1fr)',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '0.25rem 0',
                        borderRadius: '4px',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent'
                      }}
                    >
                      {/* Name label */}
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '0.5rem' }}>
                        {act.id}. {act.name}
                      </div>

                      {/* Bar placeholder */}
                      <div style={{
                        gridColumnStart: barStart + 1,
                        gridColumnEnd: barStart + barSpan + 1,
                        height: '14px',
                        borderRadius: '4px',
                        background: act.is_critical ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        position: 'relative'
                      }}>
                        {/* Constraints icons */}
                        {(act.procurement_status === 'Delayed' || act.open_rfis ? true : false) && (
                          <span style={{
                            position: 'absolute',
                            right: '-18px',
                            top: '-3px',
                            fontSize: '0.7rem'
                          }}>
                            ⚠️
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List Table */}
            <div style={{ marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem' }}>ID</th>
                    <th style={{ padding: '0.5rem' }}>Task Name</th>
                    <th style={{ padding: '0.5rem' }}>Early Start/Finish</th>
                    <th style={{ padding: '0.5rem' }}>Total Float</th>
                    <th style={{ padding: '0.5rem' }}>Criticality</th>
                  </tr>
                </thead>
                <tbody>
                  {report.activities.map((act) => {
                    const isSelected = selectedActivity?.id === act.id;
                    return (
                      <tr
                        key={act.id}
                        onClick={() => setSelectedActivity(act)}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{act.id}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <div>{act.name}</div>
                          {act.procurement_status === 'Delayed' && (
                            <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.1rem 0.3rem', borderRadius: '2px', marginRight: '0.25rem' }}>
                              Delayed Procurement
                            </span>
                          )}
                          {act.open_rfis ? (
                            <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.1rem 0.3rem', borderRadius: '2px' }}>
                              RFI Pending
                            </span>
                          ) : null}
                        </td>
                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
                          Day {act.es} ➔ Day {act.ef}
                        </td>
                        <td style={{ padding: '0.5rem', color: act.is_critical ? '#ef4444' : 'var(--text-secondary)' }}>
                          {act.float} days
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            background: act.is_critical ? 'rgba(239,68,68,0.15)' : 'rgba(156,163,175,0.15)',
                            color: act.is_critical ? '#ef4444' : '#9ca3af'
                          }}>
                            {act.is_critical ? 'Critical Path' : 'Non-Critical'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: Activity Intelligence Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Intelligence Panel
            </h3>

            {selectedActivity ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>
                    {selectedActivity.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Activity ID: {selectedActivity.id} | Duration: {selectedActivity.duration} Days
                  </span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  <div><strong>Critical Path:</strong> {selectedActivity.is_critical ? 'Yes (0 float)' : 'No'}</div>
                  <div><strong>Procurement:</strong> {selectedActivity.procurement_status || 'Clear'}</div>
                  <div><strong>Open RFIs:</strong> {selectedActivity.open_rfis || 0}</div>
                  <div><strong>Compliance Deviations:</strong> {selectedActivity.compliance_issues || 0}</div>
                </div>

                {currentMitigation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div>
                      <strong style={{ color: '#ef4444' }}>Cascading Impact Analysis:</strong>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                        {currentMitigation.impact_analysis}
                      </p>
                    </div>

                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderLeft: '3px solid #10b981',
                      padding: '0.75rem',
                      borderRadius: '0 4px 4px 0'
                    }}>
                      <strong style={{ color: '#10b981' }}>Recommended Mitigation:</strong>
                      <p style={{ color: '#a7f3d0', marginTop: '0.25rem', lineHeight: '1.5' }}>
                        {currentMitigation.mitigation_strategy}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                    No severe risk warnings or AI recommendations logged for this activity.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                Select an activity to view details.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem' }}>⏱️</span>
            <h3 style={{ margin: '1rem 0 0.5rem', fontWeight: 600 }}>No Schedule Loaded</h3>
            <p style={{ fontSize: '0.85rem' }}>Click the button above to run CPM logic and Claude Risk mitigation analysis.</p>
          </div>
        </div>
      )}
    </div>
  );
}

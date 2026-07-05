"use client";
import React, { useState } from 'react';
import './Compliance.css';

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

export default function CompliancePage() {
  const [specText, setSpecText] = useState(`REQ-UPS-001: UPS shall be configured in N+1 redundancy.
REQ-UPS-002: Battery autonomy shall be minimum 15 minutes at full IT load.
REQ-UPS-003: UPS output voltage shall be 415V, 3-phase, 50Hz.
REQ-UPS-004: UPS shall comply with IEC 62040.`);
  const [vendorText, setVendorText] = useState(`The proposed UPS system is configured as N redundancy.
Battery runtime is 10 minutes at full load.
Output voltage is 415V, 3-phase, 50Hz.
Compliance is declared against IEC 62040.`);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Deviation | null>(null);

  const handleAnalyze = async () => {
    if (!specText || !vendorText) return;
    
    setLoading(true);
    setReport(null);
    setSelectedFinding(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/compliance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specification_text: specText, vendor_text: vendorText }),
      });
      
      const data = await response.json();
      if (data.data) {
        setReport(data.data);
        if (data.data.findings && data.data.findings.length > 0) {
          setSelectedFinding(data.data.findings[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#ef4444';
      case 'Major': return '#f59e0b';
      case 'Minor': return '#3b82f6';
      default: return '#10b981';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 6rem)' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Compliance Review Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Auto-compare project specifications against submittals via AI comparison.</p>
      </header>

      {/* Main 3-panel side-by-side workspace */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        gap: '1rem',
        overflow: 'hidden'
      }}>
        {/* LEFT PANEL: Submittal inputs */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto'
        }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Input Documents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Specifications Text</label>
            <textarea
              value={specText}
              onChange={(e) => setSpecText(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.2)',
                border: 'var(--glass-border)',
                borderRadius: '4px',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                resize: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vendor Proposal</label>
            <textarea
              value={vendorText}
              onChange={(e) => setVendorText(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.2)',
                border: 'var(--glass-border)',
                borderRadius: '4px',
                padding: '0.5rem',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                resize: 'none'
              }}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !specText || !vendorText}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : 'Run Agent ⚙️'}
          </button>
        </div>

        {/* CENTRE WORKSPACE: Spec vs submittal comparison */}
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
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Alignment Comparison</h3>
          
          {selectedFinding ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Spec Column */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Specification Rule ({selectedFinding.requirement_id})
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {selectedFinding.requirement_description}
                  </p>
                </div>
                {/* Vendor Column */}
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                  <h4 style={{ color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Vendor Offered Value
                  </h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#fca5a5' }}>
                    {selectedFinding.vendor_value}
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: 'var(--glass-border)',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '0.85rem'
              }}>
                <div><strong>Status:</strong> {selectedFinding.compliance_status}</div>
                <div><strong>Severity:</strong> <span style={{ color: getSeverityColor(selectedFinding.severity) }}>{selectedFinding.severity}</span></div>
                <div><strong>Confidence:</strong> {(selectedFinding.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}>
              Select a finding below or run the agent to see comparisons.
            </div>
          )}
        </div>

        {/* RIGHT PANEL: AI explanations */}
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
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>AI Insights</h3>

          {selectedFinding ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <div>
                <strong>Explanation:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {selectedFinding.explanation}
                </p>
              </div>

              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                borderLeft: '3px solid var(--accent-primary)',
                padding: '0.75rem',
                borderRadius: '0 4px 4px 0'
              }}>
                <strong>Recommended Mitigation:</strong>
                <p style={{ color: '#a5b4fc', marginTop: '0.25rem' }}>
                  {selectedFinding.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '2rem' }}>
              No finding selected.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM PANEL: Structured compliance findings list */}
      <div style={{
        height: '200px',
        background: 'rgba(255, 255, 255, 0.01)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--border-radius)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Compliance Findings Log</h3>
          {report && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Overall Score: <strong>{report.overall_score}/100</strong>
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.5rem 1rem' }}>Req ID</th>
                <th style={{ padding: '0.5rem 1rem' }}>Severity</th>
                <th style={{ padding: '0.5rem 1rem' }}>Status</th>
                <th style={{ padding: '0.5rem 1rem' }}>Requirement Description</th>
                <th style={{ padding: '0.5rem 1rem' }}>Offered Value</th>
              </tr>
            </thead>
            <tbody>
              {!report || report.findings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {loading ? 'Analyzing specifications...' : 'No findings logged. Run compliance check.'}
                  </td>
                </tr>
              ) : (
                report.findings.map((f, idx) => {
                  const isSelected = selectedFinding?.requirement_id === f.requirement_id;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedFinding(f)}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.5rem 1rem', fontWeight: 600 }}>{f.requirement_id}</td>
                      <td style={{ padding: '0.5rem 1rem', color: getSeverityColor(f.severity), fontWeight: 600 }}>
                        {f.severity}
                      </td>
                      <td style={{ padding: '0.5rem 1rem' }}>{f.compliance_status}</td>
                      <td style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>{f.requirement_description}</td>
                      <td style={{ padding: '0.5rem 1rem', color: '#fca5a5' }}>{f.vendor_value}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';

interface RiskItem {
  id: string;
  name: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  driver: string;
  evidence: string;
  mitigation: string;
}

interface RiskCategory {
  name: string;
  icon: string;
  count: number;
  avgSeverity: string;
  trend: 'Up' | 'Down' | 'Stable';
  openActions: number;
  risks: RiskItem[];
}

const CATEGORIES: RiskCategory[] = [
  {
    name: 'Electrical',
    icon: '⚡',
    count: 3,
    avgSeverity: 'High',
    trend: 'Up',
    openActions: 4,
    risks: [
      { id: 'R-EL-01', name: 'UPS redundant configuration mismatch', severity: 'Critical', driver: 'Compliance mismatch (REQ-UPS-001)', evidence: 'Vendor submittal proposes N config vs N+1 spec rule.', mitigation: 'Submit RFI to vendor requesting N+1 layout pricing adjust.' },
      { id: 'R-EL-02', name: 'Switchgear shipment delivery delay', severity: 'High', driver: 'Procurement delay driver', evidence: 'Supplier notification reports 3 week manufacturing backlog.', mitigation: 'Expedite factory acceptance test (FAT) or use secondary logistics provider.' },
      { id: 'R-EL-03', name: 'UPS Battery Autonomy shortfall', severity: 'High', driver: 'Compliance mismatch (REQ-UPS-002)', evidence: 'Offered autonomy is 10 minutes vs 15 minutes required.', mitigation: 'Request vendor supply additional battery bank racks to match holding time.' }
    ]
  },
  {
    name: 'Mechanical',
    icon: '❄️',
    count: 2,
    avgSeverity: 'Medium',
    trend: 'Down',
    openActions: 2,
    risks: [
      { id: 'R-ME-01', name: 'Chiller cooling performance deviation', severity: 'Medium', driver: 'Vendor capacity rating check', evidence: 'Coefficients of performance (COP) deviate by 4% under full IT load.', mitigation: 'Verify cooling performance margins with mechanical design consultant.' },
      { id: 'R-ME-02', name: 'CRAH fan power inputs exceeding limits', severity: 'Low', driver: 'Efficiency metrics', evidence: 'Fan inputs exceed maximum allowable kW limits.', mitigation: 'Review fan curve configurations with manufacturer.' }
    ]
  },
  {
    name: 'Civil',
    icon: '🏗',
    count: 1,
    avgSeverity: 'Low',
    trend: 'Stable',
    openActions: 1,
    risks: [
      { id: 'R-CV-01', name: 'Concrete curing sequence timeline alignment', severity: 'Low', driver: 'Gantt path overlaps', evidence: 'Curing days overlap with structural steel column installations.', mitigation: 'Update schedule lag parameters or use rapid cure compound mixtures.' }
    ]
  },
  {
    name: 'Commissioning',
    icon: '⚙️',
    count: 2,
    avgSeverity: 'High',
    trend: 'Stable',
    openActions: 3,
    risks: [
      { id: 'R-CX-01', name: 'Integrated Systems Testing schedule overlap', severity: 'High', driver: 'Critical Path dependency', evidence: 'Commissioning sequence rests entirely on switchgear installation path.', mitigation: 'Sequence tests progressively across split sectors to decouple timelines.' }
    ]
  },
  {
    name: 'Procurement',
    icon: '📦',
    count: 4,
    avgSeverity: 'High',
    trend: 'Up',
    openActions: 5,
    risks: [
      { id: 'R-PR-01', name: 'Long lead generator equipment delays', severity: 'Critical', driver: 'Logistics constraints', evidence: 'Import customs clearance reported delayed at regional port.', mitigation: 'File priority release clearances or prepare bypass staging areas.' }
    ]
  },
  {
    name: 'Quality',
    icon: '🔍',
    count: 1,
    avgSeverity: 'Medium',
    trend: 'Down',
    openActions: 1,
    risks: [
      { id: 'R-QL-01', name: 'Non-compliant cable tray welding inspections', severity: 'Medium', driver: 'Inspection checklist check', evidence: 'NDT check shows welding defects in sector B frames.', mitigation: 'Schedule tray weld remediations before cable pull starts.' }
    ]
  }
];

export default function RisksPage() {
  const [selectedCategory, setSelectedCategory] = useState<RiskCategory>(CATEGORIES[0]);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(CATEGORIES[0].risks[0]);

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'High': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
      case 'Medium': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
      default: return { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 6rem)' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Predictive Risk Center</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Aggregate and map schedule delays, procurement gaps, and quality findings to engineering systems.
        </p>
      </header>

      {/* Systems Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem'
      }}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.name === cat.name;
          const trendIcon = cat.trend === 'Up' ? '📈' : cat.trend === 'Down' ? '📉' : '▬';
          return (
            <div
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedRisk(cat.risks[0] || null);
              }}
              style={{
                background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface)',
                border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : 'var(--glass-border)',
                borderRadius: 'var(--border-radius)',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: cat.trend === 'Up' ? '#ef4444' : cat.trend === 'Down' ? '#10b981' : '#9ca3af'
                }}>
                  {trendIcon} {cat.trend}
                </span>
              </div>
              <strong style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{cat.name}</strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <span>Risks: {cat.count}</span>
                <span>Open: {cat.openActions}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Split grid for Details and trend */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '1rem',
        overflow: 'hidden'
      }}>
        {/* LEFT PANEL: Selected Category Risk List */}
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
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            {selectedCategory.icon} {selectedCategory.name} System Risk Log
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedCategory.risks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                No active risks in this system.
              </div>
            ) : (
              selectedCategory.risks.map((risk) => {
                const isSelected = selectedRisk?.id === risk.id;
                const badge = getSeverityBadgeColor(risk.severity);

                return (
                  <div
                    key={risk.id}
                    onClick={() => setSelectedRisk(risk)}
                    style={{
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {risk.id}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: badge.bg,
                        color: badge.color
                      }}>
                        {risk.severity}
                      </span>
                    </div>

                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {risk.name}
                    </strong>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>Driver:</strong> {risk.driver}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Risk Detail & Historical Trends */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto'
        }}>
          {/* Detail Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Risk Analysis Details
            </h4>

            {selectedRisk ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <strong>Evidence Check:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>
                    {selectedRisk.evidence}
                  </p>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderLeft: '3px solid #10b981',
                  padding: '0.75rem',
                  borderRadius: '0 4px 4px 0'
                }}>
                  <strong style={{ color: '#10b981' }}>Mitigation Plan:</strong>
                  <p style={{ color: '#a7f3d0', marginTop: '0.25rem', lineHeight: '1.5' }}>
                    {selectedRisk.mitigation}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                Select a risk log from the list to reveal mitigation steps.
              </div>
            )}
          </div>

          {/* Historical Trends Widget */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: 'var(--glass-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Historical Risk Trend
            </h4>

            {/* Simulated Trend Plot */}
            <div style={{
              height: '80px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              {/* Bars */}
              <div style={{ height: '70%', width: '100%', background: 'rgba(239,68,68,0.2)', borderRadius: '2px' }}></div>
              <div style={{ height: '80%', width: '100%', background: 'rgba(239,68,68,0.2)', borderRadius: '2px' }}></div>
              <div style={{ height: '60%', width: '100%', background: 'rgba(245,158,11,0.2)', borderRadius: '2px' }}></div>
              <div style={{ height: '50%', width: '100%', background: 'rgba(245,158,11,0.2)', borderRadius: '2px' }}></div>
              <div style={{ height: '40%', width: '100%', background: 'rgba(59,130,246,0.2)', borderRadius: '2px' }}></div>
              <div style={{ height: '30%', width: '100%', background: 'rgba(16,185,129,0.2)', borderRadius: '2px' }}></div>

              <span style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', fontSize: '0.7rem', color: '#10b981' }}>
                ▼ 40% Reduction
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>Wk 1</span>
              <span>Wk 2</span>
              <span>Wk 3</span>
              <span>Wk 4</span>
              <span>Wk 5</span>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

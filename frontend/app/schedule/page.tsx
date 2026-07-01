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

  const handleAnalyze = async () => {
    setLoading(true);
    setReport(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/schedule/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: DUMMY_SCHEDULE }),
      });
      
      const data = await response.json();
      if (data.data) {
        setReport(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'Critical': return <span className="risk-badge risk-critical">Critical Path</span>;
      case 'High Risk': return <span className="risk-badge risk-high">High Float Risk</span>;
      case 'Medium Risk': return <span className="risk-badge risk-medium">Medium</span>;
      default: return <span className="risk-badge risk-low">Low Risk</span>;
    }
  };

  return (
    <div className="schedule-container">
      <header className="schedule-header">
        <h1>Predictive Schedule Risk Engine</h1>
        <p>Analyze DAG schedules, identify Critical Paths, and use Claude to mitigate cascading delays.</p>
      </header>

      <div className="action-row">
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Running DAG & AI Analysis...' : 'Load & Analyze Dummy EPC Schedule'}
        </button>
      </div>

      {report && (
        <div className="report-container">
          <div className="report-summary">
            <div className="summary-details">
              <h2>Project Completion: {report.project_duration} Days</h2>
              <p>Critical Path Activities: {report.critical_path.join(" ➔ ")}</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-col">
              <h3>Deterministic Math (NetworkX)</h3>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Activity</th>
                    <th>Float</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.activities.map(act => (
                    <tr key={act.id} className={act.is_critical ? "is-critical-row" : ""}>
                      <td>{act.id}</td>
                      <td>
                        <strong>{act.name}</strong>
                        {(act.procurement_status === 'Delayed' || act.open_rfis) && (
                          <div className="constraint-tags">
                            {act.procurement_status === 'Delayed' && <span className="tag-warn">Delayed</span>}
                            {act.open_rfis && <span className="tag-error">RFI Pending</span>}
                          </div>
                        )}
                      </td>
                      <td>{act.float}d</td>
                      <td>{getRiskBadge(act.risk_category)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-col ai-risks-panel">
              <h3>AI Risk Reasoning (Claude)</h3>
              {report.ai_risk_mitigations.length === 0 ? (
                <div className="no-findings">No severe risks detected by Claude.</div>
              ) : (
                <div className="risk-cards">
                  {report.ai_risk_mitigations.map((risk, idx) => (
                    <div key={idx} className="risk-card">
                      <div className="risk-card-header">
                        <h4>{risk.activity_name} ({risk.activity_id})</h4>
                        <span className="driver-badge">{risk.risk_driver}</span>
                      </div>
                      <div className="risk-card-body">
                        <p><strong>Cascading Impact:</strong> {risk.impact_analysis}</p>
                        <p><strong>Mitigation Strategy:</strong> {risk.mitigation_strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

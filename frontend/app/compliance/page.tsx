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
  const [specText, setSpecText] = useState('');
  const [vendorText, setVendorText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);

  const handleAnalyze = async () => {
    if (!specText || !vendorText) return;
    
    setLoading(true);
    setReport(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/compliance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specification_text: specText, vendor_text: vendorText }),
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return <span className="badge badge-critical">Critical</span>;
      case 'Major': return <span className="badge badge-major">Major</span>;
      case 'Minor': return <span className="badge badge-minor">Minor</span>;
      default: return <span className="badge badge-info">Info</span>;
    }
  };

  return (
    <div className="compliance-container">
      <header className="compliance-header">
        <h1>Specification Compliance</h1>
        <p>Upload your specifications and vendor submittals to auto-generate a deviation report.</p>
      </header>

      <div className="input-split">
        <div className="input-section">
          <h3>Project Specification</h3>
          <textarea 
            placeholder="Paste technical requirements here..."
            value={specText}
            onChange={(e) => setSpecText(e.target.value)}
          />
        </div>
        <div className="input-section">
          <h3>Vendor Submittal</h3>
          <textarea 
            placeholder="Paste vendor equipment specifications here..."
            value={vendorText}
            onChange={(e) => setVendorText(e.target.value)}
          />
        </div>
      </div>

      <div className="action-row">
        <button onClick={handleAnalyze} disabled={loading || !specText || !vendorText}>
          {loading ? 'Analyzing...' : 'Run Compliance Agent'}
        </button>
      </div>

      {report && (
        <div className="report-container">
          <div className="report-summary">
            <div className="score-card">
              <h3>Compliance Score</h3>
              <div className={`score-circle ${report.overall_score >= 80 ? 'good' : report.overall_score >= 60 ? 'warn' : 'bad'}`}>
                {report.overall_score}
              </div>
            </div>
            <div className="summary-details">
              <h2>Action Required: {report.recommendation}</h2>
              <p>Found <strong>{report.total_findings}</strong> deviations requiring engineering review.</p>
            </div>
          </div>

          <div className="findings-table">
            <table>
              <thead>
                <tr>
                  <th>Req ID</th>
                  <th>Severity</th>
                  <th>Specification</th>
                  <th>Vendor Submittal</th>
                  <th>Deviation Explanation</th>
                </tr>
              </thead>
              <tbody>
                {report.findings.map((f, idx) => (
                  <tr key={idx}>
                    <td className="req-id">{f.requirement_id || 'REQ_UNKNOWN'}</td>
                    <td>{getSeverityBadge(f.severity)}</td>
                    <td>{f.requirement_description}</td>
                    <td>{f.vendor_value}</td>
                    <td>
                      <p className="explanation">{f.explanation}</p>
                      <p className="recommendation"><strong>Action:</strong> {f.recommendation}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.findings.length === 0 && (
              <div className="no-findings">No deviations found. Equipment matches specifications perfectly.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

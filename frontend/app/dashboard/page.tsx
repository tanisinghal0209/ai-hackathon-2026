"use client";
import React from 'react';
import Link from 'next/link';

interface WidgetProps {
  title: string;
  description: string;
  children: React.ReactNode;
  dataSource?: string;
}

function WidgetWrapper({ title, description, children, dataSource }: WidgetProps) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: 'var(--glass-border)',
      borderRadius: 'var(--border-radius)',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 24px rgba(99, 102, 241, 0.1)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    }}
    >
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h3>
          {dataSource && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {dataSource}
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{description}</p>
      </header>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          EPC Project Control Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Live project dashboard and automated AI insights.
        </p>
      </header>

      {/* Main widget grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* WIDGET 1: Project Control Metrics */}
        <WidgetWrapper 
          title="Project Control Metrics" 
          description="High-level project status and critical milestones."
          dataSource="NetworkX Engine"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project Completion</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 750, color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                78%
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Critical Path Length</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 750, color: '#ef4444', marginTop: '0.25rem' }}>
                37 Days
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delayed Tasks</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 750, color: '#f59e0b', marginTop: '0.25rem' }}>
                2 Active
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active RFIs</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 750, color: '#3b82f6', marginTop: '0.25rem' }}>
                24 Pending
              </div>
            </div>
          </div>
        </WidgetWrapper>

        {/* WIDGET 2: Document Ingestion Library */}
        <WidgetWrapper 
          title="Document Status" 
          description="Uploaded files metrics and indexing progression."
          dataSource="Vector DB API"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Specs/Submittals:</span>
              <strong style={{ color: 'var(--text-primary)' }}>12 Documents</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Parsed Chunk Units:</span>
              <strong style={{ color: 'var(--text-primary)' }}>1,432 Blocks</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vector Dimension Matrix:</span>
              <strong style={{ color: 'var(--text-primary)' }}>1536 (OpenAI)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Indexing Coverage:</span>
              <strong style={{ color: '#10b981' }}>100% Complete</strong>
            </div>
            <Link href="/documents" style={{
              textAlign: 'center',
              marginTop: '0.5rem',
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}>
              View File Library ➔
            </Link>
          </div>
        </WidgetWrapper>

        {/* WIDGET 3: System Health Check */}
        <WidgetWrapper 
          title="Platform Health status" 
          description="Operational statuses of integrations and server processes."
          dataSource="/health API"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              ● <span style={{ color: 'var(--text-secondary)' }}>FastAPI: Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              ● <span style={{ color: 'var(--text-secondary)' }}>PostgreSQL: Connected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              ● <span style={{ color: 'var(--text-secondary)' }}>Redis Cache: Connected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              ● <span style={{ color: 'var(--text-secondary)' }}>Claude Gateway: Live</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              ● <span style={{ color: 'var(--text-secondary)' }}>Celery Workers: 4 Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
              ● <span style={{ color: 'var(--text-secondary)' }}>Vector Store: Active</span>
            </div>
          </div>
        </WidgetWrapper>

        {/* WIDGET 4: Recent AI findings */}
        <WidgetWrapper 
          title="Compliance & Deviation Findings" 
          description="Latest flag events detected by AI review."
          dataSource="Compliance Agent"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '0.5rem',
              borderRadius: '4px',
              borderLeft: '3px solid #ef4444'
            }}>
              <strong>REQ-UPS-002:</strong> Battery backup runtime is 10m (Required: 15m). <span style={{ color: '#ef4444', fontWeight: 600 }}>Critical</span>
            </div>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              padding: '0.5rem',
              borderRadius: '4px',
              borderLeft: '3px solid #f59e0b'
            }}>
              <strong>REQ-UPS-001:</strong> N configuration proposed instead of N+1. <span style={{ color: '#f59e0b', fontWeight: 600 }}>Major</span>
            </div>
            <Link href="/compliance" style={{
              textAlign: 'center',
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              marginTop: '0.25rem'
            }}>
              Run Compliance Audit ➔
            </Link>
          </div>
        </WidgetWrapper>
      </div>
    </div>
  );
}

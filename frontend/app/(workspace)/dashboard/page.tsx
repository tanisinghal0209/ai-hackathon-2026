"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, ShieldCheck, AlertTriangle, Cpu, CalendarClock,
  TrendingUp, TrendingDown, Activity, ArrowRight, FileText, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

// ─── Animated Counter Hook ───────────────────────────────
function useCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
}

// ─── KPI Card ────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ElementType;
  trend?: { value: string; up: boolean };
  state?: 'default' | 'critical' | 'warning' | 'success';
  href?: string;
  delay?: number;
}

function KPICard({ title, value, suffix, prefix, icon: Icon, trend, state = 'default', href, delay = 0 }: KPICardProps) {
  const count = useCounter(value, 1000 + delay * 100);

  const stateStyles: Record<string, { border: string; bg: string; iconColor: string; glow: string }> = {
    default:  { border: 'var(--glass-border)', bg: 'var(--bg-surface)', iconColor: '#6366f1', glow: 'none' },
    critical: { border: 'rgba(239,68,68,0.3)',   bg: 'rgba(239,68,68,0.05)', iconColor: '#ef4444', glow: '0 0 20px rgba(239,68,68,0.1)' },
    warning:  { border: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.05)', iconColor: '#f59e0b', glow: '0 0 20px rgba(245,158,11,0.08)' },
    success:  { border: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.05)', iconColor: '#10b981', glow: '0 0 20px rgba(16,185,129,0.08)' },
  };
  const s = stateStyles[state] || stateStyles.default;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06, duration: 0.4, ease: [0, 0, 0.2, 1] }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-hover)' }}
      style={{
        background: s.bg,
        border: s.border,
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backdropFilter: 'blur(12px)',
        boxShadow: `var(--shadow-card), ${s.glow}`,
        cursor: href ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${s.iconColor}15, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.01em' }}>
          {title}
        </span>
        <span style={{
          width: 32, height: 32, borderRadius: '8px',
          background: `${s.iconColor}18`,
          border: `1px solid ${s.iconColor}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={15} color={s.iconColor} strokeWidth={2} />
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          {prefix && <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>{prefix}</span>}
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {count}
          </span>
          {suffix && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>{suffix}</span>}
        </div>

        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            {trend.up
              ? <TrendingUp size={12} color="#10b981" />
              : <TrendingDown size={12} color="#ef4444" />
            }
            <span style={{ fontSize: '0.72rem', color: trend.up ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

// ─── Activity Feed Item ─────────────────────────────────
const ACTIVITY = [
  { icon: FolderOpen, color: '#3b82f6', title: 'UPS_Spec_v3.pdf indexed', sub: '154 chunks · 2m ago' },
  { icon: ShieldCheck, color: '#ef4444', title: 'Critical deviation detected', sub: 'Battery autonomy shortfall' },
  { icon: CalendarClock, color: '#f59e0b', title: 'Schedule delay flagged', sub: 'MV Switchgear delivery +8 days' },
  { icon: FileText, color: '#10b981', title: 'Submittal SUB-ELE-002 approved', sub: 'Transformer FAT test report' },
];

import { getDocumentsByProject, getComplianceByProject, getRisksByProject, getTimelineByProject, getDashboardStatsByProject } from '@/lib/projectData';
import { useProjectStore } from '@/store/store';

export default function DashboardPage() {
  const { currentProjectId } = useProjectStore();
  const docs = getDocumentsByProject(currentProjectId);
  const comp = getComplianceByProject(currentProjectId);
  const risks = getRisksByProject(currentProjectId);
  const timelineBars = getTimelineByProject(currentProjectId);
  const dashboardStats = getDashboardStatsByProject(currentProjectId);

  const passedComp = comp.filter(c => c.compliance_status === 'Equivalent').length;
  const totalComp = comp.length || 1;
  const compScore = Math.round((passedComp / totalComp) * 100);

  const critRisks = risks.filter(r => r.severity === 'Critical').length;
  const openRfis = comp.filter(c => c.compliance_status === 'Contradictory' || c.compliance_status === 'Missing').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.06))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            EPC Project Executive Dashboard
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
            Real-time multi-modal project intelligence & risk monitoring — {currentProjectId.toUpperCase()}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/knowledge" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', color: 'white', fontWeight: 600, fontSize: '0.8rem',
                boxShadow: '0 0 12px rgba(99,102,241,0.3)', cursor: 'pointer'
              }}
            >
              Ask Knowledge Copilot <ArrowRight size={14} />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <KPICard title="Documents Indexed" value={docs.length} icon={FolderOpen} href="/documents" trend={{ value: `${docs.length} active docs`, up: true }} delay={0} />
        <KPICard title="Compliance Score" value={compScore} suffix="%" icon={ShieldCheck} state={compScore < 80 ? "warning" : "default"} trend={{ value: `${passedComp} of ${totalComp} passed`, up: compScore >= 80 }} delay={1} />
        <KPICard title="Critical Risks" value={critRisks} icon={AlertTriangle} state={critRisks > 0 ? "critical" : "default"} trend={{ value: `${critRisks} critical items`, up: critRisks === 0 }} delay={2} />
        <KPICard title="Open RFIs" value={openRfis} icon={FileText} state={openRfis > 0 ? "warning" : "default"} trend={{ value: `${openRfis} open RFIs`, up: openRfis === 0 }} delay={3} />
        <KPICard title="Total Findings" value={comp.length} icon={Cpu} trend={{ value: dashboardStats.totalFindingsSummary, up: false }} delay={4} />
        <KPICard title="Schedule Delay" value={dashboardStats.scheduleDelayDays} suffix=" days" icon={CalendarClock} state="warning" trend={{ value: dashboardStats.scheduleDelayReason, up: false }} delay={5} />
      </div>

      {/* Main grid: Charts area + Activity feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* Project Timeline placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0, 0, 0.2, 1] }}
          style={{
            background: 'var(--bg-surface)',
            border: 'var(--glass-border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Project Timeline</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Critical path & milestones</p>
            </div>
            <Link href="/schedule" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6366f1', fontWeight: 500 }}>
              View Gantt <ArrowRight size={12} />
            </Link>
          </div>

          {/* Dynamic mini-gantt bars per active project */}
          {timelineBars.map((item, i) => (
            <div key={`${currentProjectId}-${i}`} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.78rem', color: item.delayed ? '#f59e0b' : 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.pct}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: [0.0, 0.0, 0.2, 1] }}
                  style={{ height: '100%', borderRadius: '3px', background: item.color, boxShadow: `0 0 6px ${item.color}60` }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0, 0, 0.2, 1] }}
          style={{
            background: 'var(--bg-surface)',
            border: 'var(--glass-border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Live Activity</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Real-time system events</p>
            </div>
            <Activity size={14} color="#6366f1" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.3 }}
                  style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? 'var(--glass-border)' : 'none' }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
                    background: `${item.color}15`,
                    border: `1px solid ${item.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '1px'
                  }}>
                    <Icon size={13} color={item.color} strokeWidth={2} />
                  </span>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom row: Risk heatmap + Recent AI Findings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingBottom: '20px' }}>

        {/* Risk Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          style={{
            background: 'var(--bg-surface)',
            border: 'var(--glass-border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Risk Heatmap</h3>
            <Link href="/risks" style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
            {[
              ['#ef4444','#f59e0b','#f59e0b','#3b82f6','#5a5a7a'],
              ['#ef4444','#ef4444','#f59e0b','#3b82f6','#5a5a7a'],
              ['#f59e0b','#f59e0b','#f59e0b','#3b82f6','#5a5a7a'],
              ['#3b82f6','#3b82f6','#3b82f6','#10b981','#5a5a7a'],
              ['#5a5a7a','#5a5a7a','#5a5a7a','#5a5a7a','#10b981'],
            ].map((row, ri) =>
              row.map((color, ci) => (
                <motion.div
                  key={`${ri}-${ci}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + (ri * 5 + ci) * 0.015 }}
                  whileHover={{ scale: 1.15 }}
                  style={{
                    aspectRatio: '1',
                    background: `${color}28`,
                    border: `1px solid ${color}40`,
                    borderRadius: '5px',
                    boxShadow: `0 0 6px ${color}20`,
                    cursor: 'pointer',
                  }}
                />
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span>Probability →</span>
            <span>Impact →</span>
          </div>
        </motion.div>

        {/* Recent AI Findings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          style={{
            background: 'var(--bg-surface)',
            border: 'var(--glass-border)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>AI Findings</h3>
            <Link href="/compliance" style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={11} />
            </Link>
          </div>
          {[
            { id: 'REQ-UPS-002', label: 'Battery autonomy shortfall — 10 min vs 15 min', severity: 'Critical', color: '#ef4444' },
            { id: 'REQ-UPS-001', label: 'UPS redundancy N+1 mismatch — N topology proposed', severity: 'Critical', color: '#ef4444' },
            { id: 'REQ-ME-001', label: 'Chiller COP 5.87 vs 6.1 required at site conditions', severity: 'Major', color: '#f59e0b' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 + i * 0.08 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px', borderRadius: '8px',
                background: `${f.color}08`,
                border: `1px solid ${f.color}25`,
                marginBottom: '8px',
                cursor: 'pointer', transition: 'background 130ms ease'
              }}
              whileHover={{ scale: 1.01 }}
            >
              <div style={{ width: 3, height: 36, background: f.color, borderRadius: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>{f.label}</div>
              </div>
              <span style={{
                padding: '2px 8px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700,
                background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30`
              }}>
                {f.severity}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Shield, Zap, Target, FileText } from 'lucide-react';
import { RISKS, DOCUMENTS, getDocById, getCategories, getRisksByCategory, type Risk } from '@/lib/projectData';

const SEVERITY_STYLES: Record<string, { bg: string; border: string; color: string; badgeBg: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.3)',  color: '#ef4444', badgeBg: 'rgba(239,68,68,0.15)' },
  High:     { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', badgeBg: 'rgba(245,158,11,0.15)' },
  Medium:   { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.2)',  color: '#3b82f6', badgeBg: 'rgba(59,130,246,0.15)' },
  Low:      { bg: 'rgba(16,185,129,0.04)',  border: 'rgba(16,185,129,0.15)', color: '#10b981', badgeBg: 'rgba(16,185,129,0.15)' },
};

const STATUS_COLORS: Record<string, string> = {
  'Open': '#ef4444',
  'In Progress': '#f59e0b',
  'Resolved': '#10b981',
};

function ProbabilityMatrix({ probability, impact }: { probability: number; impact: number }) {
  const getColor = (p: number, im: number) => {
    const score = (p / 100) * (im / 100);
    if (score > 0.7) return '#ef4444';
    if (score > 0.4) return '#f59e0b';
    if (score > 0.2) return '#3b82f6';
    return '#10b981';
  };
  const color = getColor(probability, impact);
  const px = (probability / 100) * 80;
  const py = 80 - (impact / 100) * 80;
  return (
    <div style={{ position: 'relative', width: '100%', height: 90 }}>
      <svg width="100%" height="90" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="heatGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="50%"  stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#heatGrad)" rx="4" />
        <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <motion.circle
          cx={px} cy={py} r="6" fill={color} fillOpacity="0.9"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          initial={{ cx: 50, cy: 50, r: 0 }}
          animate={{ cx: px, cy: py, r: 6 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#4a4a6a' }}>
        <span>Low</span><span>← Probability →</span><span>High</span>
      </div>
    </div>
  );
}

export default function RisksPage() {
  const categories = getCategories();
  const [selectedCatName, setSelectedCatName] = useState<string>(categories[0].name);
  const [selectedRisk, setSelectedRisk] = useState<Risk>(getRisksByCategory(categories[0].name)[0]);

  const allRisks = RISKS;
  const critCount     = allRisks.filter(r => r.severity === 'Critical').length;
  const highCount     = allRisks.filter(r => r.severity === 'High').length;
  const medCount      = allRisks.filter(r => r.severity === 'Medium').length;
  const resolvedCount = allRisks.filter(r => r.status === 'Resolved').length;

  const catRisks = getRisksByCategory(selectedCatName);
  const selectedCat = categories.find(c => c.name === selectedCatName)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 112px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>Risk Center</h1>
          <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>
            Predictive risk intelligence — {allRisks.length} risks across {categories.length} disciplines
          </p>
        </div>
      </motion.div>

      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>
        {[
          { label: 'Critical Risks', value: critCount,     color: '#ef4444', icon: AlertTriangle, pulse: true },
          { label: 'High Risks',     value: highCount,     color: '#f59e0b', icon: TrendingUp,    pulse: false },
          { label: 'Medium Risks',   value: medCount,      color: '#3b82f6', icon: Target,        pulse: false },
          { label: 'Resolved',       value: resolvedCount, color: '#10b981', icon: Shield,        pulse: false },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: 'rgba(20,20,32,0.85)', border: `1px solid ${card.color}25`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', position: 'relative', overflow: 'hidden' }}
            >
              {card.pulse && (
                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{ position: 'absolute', inset: 0, background: `${card.color}08`, borderRadius: '12px', pointerEvents: 'none' }} />
              )}
              <span style={{ width: 34, height: 34, borderRadius: '8px', background: `${card.color}15`, border: `1px solid ${card.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={card.color} strokeWidth={2} />
              </span>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f1f4', lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#5a5a7a', marginTop: '3px' }}>{card.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Category tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', flexShrink: 0 }}>
        {categories.map((cat) => {
          const isSelected = selectedCatName === cat.name;
          const trendMap = { Up: { icon: TrendingUp, color: '#ef4444' }, Down: { icon: TrendingDown, color: '#10b981' }, Stable: { icon: Minus, color: '#5a5a7a' } };
          const T = trendMap[cat.trend];
          const catRisksForCard = getRisksByCategory(cat.name);
          const hasCritical = catRisksForCard.some(r => r.severity === 'Critical');
          return (
            <motion.button
              key={cat.name}
              onClick={() => { setSelectedCatName(cat.name); setSelectedRisk(getRisksByCategory(cat.name)[0]); }}
              whileHover={{ y: -1 }}
              style={{
                background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(20,20,32,0.85)',
                border: `1px solid ${isSelected ? 'rgba(99,102,241,0.3)' : hasCritical ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left',
                backdropFilter: 'blur(12px)', transition: 'all 180ms ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem', color: T.color, fontWeight: 600 }}>
                  <T.icon size={11} /> {cat.trend}
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#d0d0f0' : '#a0a0b0' }}>{cat.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#5a5a7a' }}>{cat.count} risks · {cat.openActions} open</span>
            </motion.button>
          );
        })}
      </div>

      {/* Main panel */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

        {/* Risk list */}
        <div style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem', fontWeight: 600, color: '#707090', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedCat?.icon} {selectedCatName} — Risk Log</span>
            <span style={{ fontSize: '0.65rem', color: '#4a4a6a' }}>{catRisks.length} risk{catRisks.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {catRisks.map((risk, i) => {
              const s = SEVERITY_STYLES[risk.severity];
              const isSelected = selectedRisk?.id === risk.id;
              return (
                <motion.div
                  key={risk.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedRisk(risk)}
                  whileHover={{ x: 2 }}
                  style={{ padding: '12px', borderRadius: '9px', marginBottom: '6px', cursor: 'pointer', background: isSelected ? s.bg : 'rgba(255,255,255,0.015)', border: `1px solid ${isSelected ? s.border : 'rgba(255,255,255,0.04)'}`, transition: 'all 150ms ease', position: 'relative', overflow: 'hidden' }}
                >
                  {risk.severity === 'Critical' && (
                    <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.color, borderRadius: '2px 0 0 2px' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', paddingLeft: risk.severity === 'Critical' ? '8px' : '0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)' }}>{risk.id}</span>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '4px', background: `${STATUS_COLORS[risk.status]}18`, color: STATUS_COLORS[risk.status] }}>{risk.status}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', background: s.badgeBg, color: s.color }}>{risk.severity}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d0d0e0', paddingLeft: risk.severity === 'Critical' ? '8px' : '0' }}>{risk.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#707090', marginTop: '4px', paddingLeft: risk.severity === 'Critical' ? '8px' : '0' }}>{risk.driver}</div>
                  {risk.related_document_ids.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', paddingLeft: risk.severity === 'Critical' ? '8px' : '0' }}>
                      {risk.related_document_ids.slice(0, 3).map(did => {
                        const d = getDocById(did);
                        return d ? (
                          <span key={did} style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontFamily: 'monospace' }}>
                            {d.doc_ref.split('-').slice(-2).join('-')}
                          </span>
                        ) : null;
                      })}
                      {risk.related_document_ids.length > 3 && <span style={{ fontSize: '0.58rem', color: '#4a4a6a' }}>+{risk.related_document_ids.length - 3}</span>}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRisk?.id}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}
            style={{ background: 'rgba(15,15,24,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {selectedRisk && (() => {
              const s = SEVERITY_STYLES[selectedRisk.severity];
              return (
                <>
                  <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#5a5a7a', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{selectedRisk.id}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#d0d0e0' }}>{selectedRisk.name}</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: s.badgeBg, color: s.color, border: `1px solid ${s.border}` }}>{selectedRisk.severity}</span>
                      <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '4px', background: `${STATUS_COLORS[selectedRisk.status]}15`, color: STATUS_COLORS[selectedRisk.status] }}>{selectedRisk.status}</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Risk Matrix */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>Risk Position</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{selectedRisk.probability}%</div>
                          <div style={{ fontSize: '0.65rem', color: '#5a5a7a' }}>Probability</div>
                        </div>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{selectedRisk.impact}%</div>
                          <div style={{ fontSize: '0.65rem', color: '#5a5a7a' }}>Impact</div>
                        </div>
                      </div>
                      <ProbabilityMatrix probability={selectedRisk.probability} impact={selectedRisk.impact} />
                    </div>

                    {/* Evidence */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>Evidence</div>
                      <p style={{ fontSize: '0.8rem', color: '#a0a0b0', lineHeight: 1.6 }}>{selectedRisk.evidence}</p>
                    </div>

                    {/* Mitigation */}
                    <div style={{ padding: '12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Zap size={12} color="#10b981" />
                        <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Mitigation</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#6ee7b7', lineHeight: 1.6 }}>{selectedRisk.mitigation}</p>
                    </div>

                    {/* Compliance Link */}
                    {selectedRisk.related_requirement && (
                      <div style={{ padding: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '7px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Compliance Link</div>
                        <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontFamily: 'monospace' }}>{selectedRisk.related_requirement}</span>
                      </div>
                    )}

                    {/* Source Documents */}
                    {selectedRisk.related_document_ids.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#5a5a7a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '8px' }}>
                          <FileText size={10} style={{ display: 'inline', marginRight: 4 }} />
                          Source Documents ({selectedRisk.related_document_ids.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {selectedRisk.related_document_ids.map(did => {
                            const doc = getDocById(did);
                            return doc ? (
                              <div key={did} style={{ padding: '7px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                                <div style={{ fontSize: '0.63rem', color: '#a0a0b0', fontWeight: 600 }}>{doc.doc_ref}</div>
                                <div style={{ fontSize: '0.58rem', color: '#5a5a7a', marginTop: '2px', lineHeight: 1.3 }}>{doc.title.length > 50 ? doc.title.slice(0, 50) + '…' : doc.title}</div>
                                <div style={{ fontSize: '0.55rem', color: '#3a3a5a', marginTop: '2px' }}>{doc.discipline} · {doc.page_count}p · Rev {doc.rev}</div>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

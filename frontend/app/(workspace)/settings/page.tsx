"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Shield, Sliders, Check, Zap, Database, AlertTriangle, Activity } from 'lucide-react';

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 36, height: 20, borderRadius: '999px', cursor: 'pointer', border: 'none',
        background: value ? '#6366f1' : 'var(--bg-hover)',
        position: 'relative', transition: 'background 200ms ease',
        boxShadow: value ? '0 0 8px rgba(99,102,241,0.4)' : 'none', flexShrink: 0
      }}
    >
      <motion.div animate={{ x: value ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ position: 'absolute', top: 2, width: 16, height: 16, background: 'white', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      />
    </button>
  );
}

function RangeInput({ value, min, max, onChange, unit }: { value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#6366f1', height: '4px', cursor: 'pointer' }} />
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6366f1', minWidth: '40px', textAlign: 'right' }}>{value}{unit}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-surface)', border: 'var(--glass-border)', borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)' }}
    >
      <div style={{ padding: '16px 20px', borderBottom: 'var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: 30, height: 30, borderRadius: '7px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color="#6366f1" strokeWidth={2} />
        </span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: 'var(--glass-border)' }}>
      <div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [model, setModel] = useState('claude-3-5-sonnet');
  const [embModel, setEmbModel] = useState('text-embedding-3-small');
  const [uploadLimit, setUploadLimit] = useState(5);
  const [queryLimit, setQueryLimit] = useState(30);
  const [complianceLimit, setComplianceLimit] = useState(10);
  const [promptVersion, setPromptVersion] = useState('v2.1-compliance-strict');
  const [hallucinationGuard, setHallucinationGuard] = useState(true);
  const [citationMode, setCitationMode] = useState(true);
  const [streamResponses, setStreamResponses] = useState(true);
  const [saved, setSaved] = useState(false);

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-hover)', border: 'var(--glass-border)',
    color: 'var(--text-primary)', padding: '6px 10px', borderRadius: '7px', fontSize: '0.8rem',
    outline: 'none', cursor: 'pointer', minWidth: '220px'
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px' }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f1f4' }}>Settings</h1>
        <p style={{ color: '#5a5a7a', fontSize: '0.82rem', marginTop: '3px' }}>AI provider configuration, rate limits, and prompt registry</p>
      </motion.div>

      {/* Status banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px' }}
      >
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)' }} />
        <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>Platform Online</span>
        <span style={{ margin: '0 4px', color: '#2a3a2a' }}>·</span>
        <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>Vector DB Connected</span>
        <span style={{ margin: '0 4px', color: '#2a3a2a' }}>·</span>
        <Activity size={12} color="#6ee7b7" />
        <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>Background Workers: 1 Active</span>
      </motion.div>

      {/* AI Provider */}
      <Section icon={Cpu} title="AI Provider Gateways">
        <SettingRow label="Primary LLM (Claude)" sub="Used for compliance analysis and copilot responses">
          <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle}>
            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet — Recommended</option>
            <option value="claude-3-opus">Claude 3 Opus — Max accuracy</option>
            <option value="claude-3-haiku">Claude 3 Haiku — Fastest</option>
          </select>
        </SettingRow>
        <SettingRow label="Embedding Pipeline" sub="OpenAI model for chunk vectorisation">
          <select value={embModel} onChange={e => setEmbModel(e.target.value)} style={selectStyle}>
            <option value="text-embedding-3-small">text-embedding-3-small (1536d)</option>
            <option value="text-embedding-3-large">text-embedding-3-large (3072d)</option>
          </select>
        </SettingRow>
      </Section>

      {/* Safety */}
      <Section icon={Shield} title="AI Safety Controls">
        <SettingRow label="Hallucination Prevention Guard" sub="Enforces retrieval-only responses. No unsupported generation.">
          <ToggleSwitch value={hallucinationGuard} onChange={setHallucinationGuard} />
        </SettingRow>
        <SettingRow label="Mandatory Citation Mode" sub="Every AI claim must reference a retrieved document chunk.">
          <ToggleSwitch value={citationMode} onChange={setCitationMode} />
        </SettingRow>
        <SettingRow label="Streaming Responses" sub="Stream tokens to the client as they are generated.">
          <ToggleSwitch value={streamResponses} onChange={setStreamResponses} />
        </SettingRow>
        {!hallucinationGuard && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '7px', marginTop: '8px' }}>
            <AlertTriangle size={13} color="#f59e0b" />
            <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Hallucination guard disabled — AI may generate unverified content.</span>
          </div>
        )}
      </Section>

      {/* Rate Limits */}
      <Section icon={Sliders} title="Rate Limiting (EDR 21-P)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: '#c0c0d0' }}>Document uploads / min</span>
            </div>
            <RangeInput value={uploadLimit} min={1} max={20} onChange={setUploadLimit} unit="/m" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: '#c0c0d0' }}>Knowledge queries / min</span>
            </div>
            <RangeInput value={queryLimit} min={5} max={60} onChange={setQueryLimit} unit="/m" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', color: '#c0c0d0' }}>Compliance runs / min</span>
            </div>
            <RangeInput value={complianceLimit} min={1} max={30} onChange={setComplianceLimit} unit="/m" />
          </div>
        </div>
      </Section>

      {/* Prompt Registry */}
      <Section icon={Database} title="Prompt Registry Control">
        <SettingRow label="Compliance Agent Version" sub="Active prompt template for deviation analysis">
          <select value={promptVersion} onChange={e => setPromptVersion(e.target.value)} style={selectStyle}>
            <option value="v2.1-compliance-strict">v2.1-compliance-strict (Active)</option>
            <option value="v2.0-compliance-lenient">v2.0-compliance-lenient</option>
            <option value="v1.5-compliance-legacy">v1.5-compliance-legacy</option>
          </select>
        </SettingRow>
      </Section>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            border: '1px solid rgba(99,102,241,0.4)', color: 'white', cursor: 'pointer',
            boxShadow: '0 0 16px rgba(99,102,241,0.25)'
          }}
        >
          <Zap size={14} strokeWidth={2.5} />
          Save Configuration
        </motion.button>
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#10b981' }}>
              <Check size={14} /> Saved and synced to database
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

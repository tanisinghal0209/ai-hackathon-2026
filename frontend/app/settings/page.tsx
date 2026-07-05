"use client";
import React, { useState } from 'react';

export default function SettingsPage() {
  const [model, setModel] = useState('claude-3-5-sonnet');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  
  const [uploadLimit, setUploadLimit] = useState(5);
  const [queryLimit, setQueryLimit] = useState(30);
  const [complianceLimit, setComplianceLimit] = useState(10);
  
  const [promptVersion, setPromptVersion] = useState('v2.1-compliance-strict');

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Application Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Configure AI provider gateways, rate limit constraints, and prompt model configurations.
        </p>
      </header>

      {/* Grid wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Model Config Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            AI Provider Gateways
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontWeight: 500 }}>Primary LLM Model (Claude)</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'var(--glass-border)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Recommended)</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontWeight: 500 }}>Embedding Pipeline model</label>
              <select 
                value={embeddingModel} 
                onChange={(e) => setEmbeddingModel(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'var(--glass-border)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                <option value="text-embedding-3-small">text-embedding-3-small (1536 dims)</option>
                <option value="text-embedding-3-large">text-embedding-3-large (3072 dims)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rate Limiting Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Operational Rate Limiting (EDR 21-P)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
            Set maximum request thresholds to manage inference costs and prevent gateway failures.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label>Upload Limits (docs/min)</label>
              <input 
                type="number" 
                value={uploadLimit} 
                onChange={(e) => setUploadLimit(Number(e.target.value))}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'var(--glass-border)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label>Knowledge Queries (req/min)</label>
              <input 
                type="number" 
                value={queryLimit} 
                onChange={(e) => setQueryLimit(Number(e.target.value))}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'var(--glass-border)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label>Compliance runs (runs/min)</label>
              <input 
                type="number" 
                value={complianceLimit} 
                onChange={(e) => setComplianceLimit(Number(e.target.value))}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: 'var(--glass-border)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Prompt Template Settings */}
        <div style={{
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Prompt Registry Control
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
            <label>Compliance Agent Active Version</label>
            <select 
              value={promptVersion} 
              onChange={(e) => setPromptVersion(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: 'var(--glass-border)',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
            >
              <option value="v2.1-compliance-strict">v2.1-compliance-strict (Active)</option>
              <option value="v2.0-compliance-lenient">v2.0-compliance-lenient</option>
              <option value="v1.5-compliance-legacy">v1.5-compliance-legacy</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleSave}
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
            Save Configuration
          </button>
          {saved && (
            <span style={{ fontSize: '0.85rem', color: '#10b981' }}>
              ✓ Settings saved and synced to database.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

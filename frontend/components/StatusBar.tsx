"use client";
import React from 'react';

export default function StatusBar() {
  return (
    <div className="status-bar" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-success)' }}>●</span> Platform Online
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-success)' }}>●</span> Vector DB: Connected
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: 'var(--color-warning)' }}>●</span> Background Workers: 1 Active
        </span>
      </div>
      <div>
        EPC AI Platform v0.1.0 • Hackathon Edition
      </div>
    </div>
  );
}

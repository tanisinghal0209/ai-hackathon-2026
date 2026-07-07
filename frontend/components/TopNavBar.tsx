"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, ChevronDown, User, Command,
  FileText, ShieldCheck, CalendarClock, AlertTriangle, FolderOpen, BrainCircuit, X
} from 'lucide-react';
import { useUIStore } from '@/store/store';

const SEARCH_INDEX = [
  { label: 'UPS Specification v2.pdf', type: 'Document', href: '/documents', icon: FileText },
  { label: 'Battery Runtime Deviation', type: 'Compliance', href: '/compliance', icon: ShieldCheck },
  { label: 'Switchgear Delay – Critical', type: 'Risk', href: '/risks', icon: AlertTriangle },
  { label: 'Commissioning Milestone Q3', type: 'Schedule', href: '/schedule', icon: CalendarClock },
  { label: 'Generator spec submittal', type: 'Document', href: '/documents', icon: FileText },
  { label: 'Ask Knowledge Copilot', type: 'AI', href: '/knowledge', icon: BrainCircuit },
  { label: 'REQ-UPS-002 Compliance Finding', type: 'Compliance', href: '/compliance', icon: ShieldCheck },
];

const TYPE_COLORS: Record<string, string> = {
  Document:   '#3b82f6',
  Compliance: '#ef4444',
  Risk:       '#f59e0b',
  Schedule:   '#10b981',
  AI:         '#8b5cf6',
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Compliance Analysis Complete', body: '7 Deviations Found — 2 Critical', time: '2m ago', critical: true },
  { id: 2, title: 'Document Indexed', body: 'UPS_Spec_v3.pdf — 154 chunks generated', time: '8m ago', critical: false },
  { id: 3, title: 'Risk Escalated', body: 'R-EL-01 elevated to Critical severity', time: '1h ago', critical: true },
];

export default function TopNavBar() {
  const { toggleRightPanel } = useUIStore();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.length > 0
    ? SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setQuery('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="top-navbar">
      {/* Left — Logo wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6366f1', letterSpacing: '-0.01em' }}>
            EPC<span style={{ color: '#3b82f6' }}>.ai</span>
          </span>
        </div>

        {/* Breadcrumb separator */}
        <span style={{ color: '#2a2a40', fontSize: '1.2rem' }}>/</span>

        {/* Project chip */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          padding: '4px 10px',
          color: '#a0a0b0',
          fontSize: '0.8125rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 180ms ease'
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', display: 'block' }} />
          Data Centre Alpha
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Centre — Command Search */}
      <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            padding: '7px 12px',
            color: '#5a5a7a',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 180ms ease',
            textAlign: 'left'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
        >
          <Search size={14} strokeWidth={2} />
          <span style={{ flex: 1 }}>Search documents, risks, compliance...</span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '5px',
            fontSize: '0.65rem', color: '#4a4a6a'
          }}>
            <Command size={10} /> K
          </span>
        </button>

        {/* Command Palette Dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'rgba(14, 14, 22, 0.97)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '14px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
                overflow: 'hidden',
                zIndex: 500,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Search input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Search size={16} color="#6366f1" strokeWidth={2} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search documents, risks, compliance..."
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: '#f1f1f4', fontSize: '0.9rem', fontFamily: 'var(--font-sans)'
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: '#5a5a7a', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Results */}
              <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '8px' }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#5a5a7a', fontSize: '0.85rem' }}>
                    No results for &quot;{query}&quot;
                  </div>
                ) : (
                  filtered.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={i}
                        href={item.href}
                        onClick={() => { setSearchOpen(false); setQuery(''); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '9px 10px', borderRadius: '8px',
                          transition: 'background 130ms ease',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{
                          width: 30, height: 30, borderRadius: '7px',
                          background: `${TYPE_COLORS[item.type]}18`,
                          border: `1px solid ${TYPE_COLORS[item.type]}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={14} color={TYPE_COLORS[item.type]} strokeWidth={2} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', color: '#d0d0e0', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: TYPE_COLORS[item.type], marginTop: '1px' }}>
                            {item.type}
                          </div>
                        </div>
                      </a>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 36, height: 36,
              background: notifOpen ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: '1px solid transparent',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#707090',
              cursor: 'pointer',
              transition: 'all 180ms ease',
              position: 'relative'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#a0a0b0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = notifOpen ? 'rgba(255,255,255,0.07)' : 'transparent'; e.currentTarget.style.color = '#707090'; }}
          >
            <Bell size={16} strokeWidth={2} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7,
              background: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 6px rgba(239,68,68,0.7)'
            }} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 340,
                  background: 'rgba(14, 14, 22, 0.97)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                  overflow: 'hidden',
                  zIndex: 500,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Notifications</span>
                  <span style={{ fontSize: '0.7rem', color: '#6366f1', cursor: 'pointer' }}>Mark all read</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} style={{
                      padding: '10px 10px', borderRadius: '8px', marginBottom: '4px',
                      background: n.critical ? 'rgba(239,68,68,0.04)' : 'transparent',
                      border: n.critical ? '1px solid rgba(239,68,68,0.1)' : '1px solid transparent',
                      cursor: 'pointer', transition: 'background 130ms ease'
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = n.critical ? 'rgba(239,68,68,0.04)' : 'transparent')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d0d0e0' }}>{n.title}</span>
                        <span style={{ fontSize: '0.65rem', color: '#5a5a7a' }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#707090' }}>{n.body}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Assistant Toggle */}
        <button
          onClick={toggleRightPanel}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2))',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#a5b4fc',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 180ms ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(59,130,246,0.3))'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.2))'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
        >
          <BrainCircuit size={14} strokeWidth={2} />
          AI Copilot
        </button>

        {/* Avatar */}
        <button style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          border: 'none', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(99,102,241,0.3)'
        }}>
          <User size={15} color="white" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

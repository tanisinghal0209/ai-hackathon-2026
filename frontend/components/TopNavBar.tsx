"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search, Bell, ChevronDown, User, Command,
  FileText, ShieldCheck, CalendarClock, AlertTriangle, BrainCircuit, X, Building2, Check, Sun, Moon
} from 'lucide-react';
import { useUIStore, useProjectStore } from '@/store/store';

const PROJECTS = [
  {
    id: 'alpha',
    name: 'Data Centre Alpha',
    location: 'Mumbai, Maharashtra',
    capacity: '150 MW · Tier IV',
    status: 'Active',
    statusColor: '#10b981',
    docs: 157,
    compliance: 92,
  },
  {
    id: 'beta',
    name: 'Data Centre Beta',
    location: 'Hyderabad, Telangana',
    capacity: '80 MW · Tier III',
    status: 'Planning',
    statusColor: '#f59e0b',
    docs: 43,
    compliance: 78,
  },
  {
    id: 'gamma',
    name: 'Data Centre Gamma',
    location: 'Chennai, Tamil Nadu',
    capacity: '40 MW · Tier III',
    status: 'Pre-FEED',
    statusColor: '#6366f1',
    docs: 12,
    compliance: 100,
  },
];

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
  const router = useRouter();
  const { theme, toggleTheme, toggleRightPanel } = useUIStore();
  const { currentProjectId, setCurrentProject } = useProjectStore();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);
  const [notificationsList, setNotificationsList] = useState(MOCK_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotificationsList([]);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  const searchRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Profile details dropdown state
  const profileRef = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userEmail, setUserEmail] = useState('admin@epc.ai');
  const [userRole, setUserRole] = useState('Administrator');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('user_email') || 'admin@epc.ai';
      const role = localStorage.getItem('user_role') || 'Administrator';
      setUserEmail(email);
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    router.replace('/login');
  };

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
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) {
        setProjectOpen(false);
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
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Nexus<span style={{ color: '#6366f1' }}>EPC AI</span>
          </span>
        </div>

        {/* Breadcrumb separator */}
        <span style={{ color: '#2a2a40', fontSize: '1.2rem' }}>/</span>

        {/* Project switcher */}
        <div ref={projectRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProjectOpen(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: projectOpen ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
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
            onMouseLeave={e => (e.currentTarget.style.background = projectOpen ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)')}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeProject.statusColor, boxShadow: `0 0 6px ${activeProject.statusColor}99`, display: 'block' }} />
            {activeProject.name}
            <motion.div animate={{ rotate: projectOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>

          <AnimatePresence>
            {projectOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: 280,
                  background: 'rgba(14, 14, 22, 0.97)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
                  overflow: 'hidden',
                  zIndex: 500,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '0.65rem', color: '#5a5a7a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Switch Project</span>
                </div>
                <div style={{ padding: '6px' }}>
                  {PROJECTS.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => { setActiveProject(proj); setCurrentProject(proj.id); setProjectOpen(false); }}
                      style={{
                        width: '100%', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 10px', borderRadius: '8px',
                        background: activeProject.id === proj.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                        border: '1px solid transparent',
                        cursor: 'pointer', transition: 'all 130ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = activeProject.id === proj.id ? 'rgba(99,102,241,0.08)' : 'transparent')}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                        background: `${proj.statusColor}18`,
                        border: `1px solid ${proj.statusColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Building2 size={14} color={proj.statusColor} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#d0d0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {proj.name}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#5a5a7a', marginTop: '1px' }}>{proj.location}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: '999px', background: `${proj.statusColor}18`, color: proj.statusColor, fontWeight: 600 }}>{proj.status}</span>
                          <span style={{ fontSize: '0.62rem', color: '#4a4a6a' }}>{proj.capacity}</span>
                        </div>
                      </div>
                      {activeProject.id === proj.id && (
                        <Check size={14} color="#6366f1" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '8px 14px 10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#5a5a7a' }}>{activeProject.docs} docs indexed</span>
                  <span style={{ fontSize: '0.68rem', color: '#5a5a7a' }}>·</span>
                  <span style={{ fontSize: '0.68rem', color: activeProject.compliance >= 90 ? '#10b981' : '#f59e0b' }}>{activeProject.compliance}% compliant</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
            {notificationsList.length > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7,
                background: '#ef4444',
                borderRadius: '50%',
                boxShadow: '0 0 6px rgba(239,68,68,0.7)'
              }} />
            )}
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
                  background: 'var(--bg-elevated)',
                  border: 'var(--glass-border)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-xl)',
                  overflow: 'hidden',
                  zIndex: 500,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: 'var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Notifications</span>
                  {notificationsList.length > 0 ? (
                    <span
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '0.7rem', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Mark all read
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 Unread</span>
                  )}
                </div>
                <div style={{ padding: '8px' }}>
                  {notificationsList.length > 0 ? (
                    notificationsList.map(n => (
                      <div key={n.id} style={{
                        padding: '10px 10px', borderRadius: '8px', marginBottom: '4px',
                        background: n.critical ? 'rgba(239,68,68,0.08)' : 'transparent',
                        border: n.critical ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                        cursor: 'pointer', transition: 'background 130ms ease'
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = n.critical ? 'rgba(239,68,68,0.08)' : 'transparent')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.body}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No unread notifications
                    </div>
                  )}
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

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: 32, height: 32,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: theme === 'dark' ? '#f59e0b' : '#6366f1',
            transition: 'all 180ms ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
        >
          {theme === 'dark' ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
        </button>

        {/* Avatar */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              border: 'none', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(99,102,241,0.3)'
            }}
          >
            <User size={15} color="white" strokeWidth={2} />
          </button>
          
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  width: '240px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {userEmail.split('@')[0].replace(/^\w/, (c) => c.toUpperCase())}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {userEmail}
                    </div>
                  </div>
                </div>
                
                {/* Role Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  padding: '2px 8px',
                  background: 'rgba(13, 148, 136, 0.1)',
                  border: '1px solid rgba(13, 148, 136, 0.2)',
                  borderRadius: '4px',
                  color: '#2dd4bf',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {userRole}
                </div>
                
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    color: '#fca5a5',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                  }}
                >
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

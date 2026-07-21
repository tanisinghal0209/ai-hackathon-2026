"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BrainCircuit,
  ShieldCheck,
  CalendarClock,
  AlertTriangle,
  FolderOpen,
  Settings,
  ChevronsUpDown,
  Zap
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: '/knowledge',
    label: 'Knowledge Copilot',
    icon: BrainCircuit,
    badge: null,
  },
  {
    href: '/compliance',
    label: 'Compliance',
    icon: ShieldCheck,
    badge: { count: 4, type: 'critical' },
  },
  {
    href: '/schedule',
    label: 'Schedule',
    icon: CalendarClock,
    badge: null,
  },
  {
    href: '/risks',
    label: 'Risk Center',
    icon: AlertTriangle,
    badge: { count: 5, type: 'warning' },
  },
  {
    href: '/documents',
    label: 'Documents',
    icon: FolderOpen,
    badge: { count: 6, type: 'info' },
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    badge: null,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">NexusEPC AI</span>
          <span className="sidebar-brand-sub">Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className={`nav-badge ${item.badge.type}`}>
                  {item.badge.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Project Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-project-selector">
          <span className="sidebar-project-dot" />
          <span className="sidebar-project-name">Data Centre Alpha</span>
          <ChevronsUpDown size={14} color="#5a5a7a" />
        </div>
      </div>
    </aside>
  );
}

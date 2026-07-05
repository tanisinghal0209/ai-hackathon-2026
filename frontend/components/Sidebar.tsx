"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Project Overview', icon: '📊' },
    { href: '/documents', label: 'Documents', icon: '📂' },
    { href: '/knowledge', label: 'Knowledge Copilot', icon: '🧠' },
    { href: '/compliance', label: 'Compliance', icon: '✅' },
    { href: '/schedule', label: 'Schedule', icon: '⏱️' },
    { href: '/risks', label: 'Risks', icon: '⚠️' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>AI EPC</h2>
        <p>Intelligence Platform</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

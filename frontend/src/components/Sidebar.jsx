import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FolderGit2,
  BookOpenCheck,
  SearchCode,
  BarChart3,
  History,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'AI Assistant', path: '/assistant', icon: Bot, badge: 'Live RAG' },
  { name: 'Knowledge Hub', path: '/knowledge', icon: FolderGit2 },
  { name: 'SOP Library', path: '/library', icon: BookOpenCheck },
  { name: 'Search Explorer', path: '/search', icon: SearchCode },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Activity History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Sliders },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  return (
    <aside
      className={`relative z-30 flex flex-col bg-[#070B14] border-r border-[#1A2744] transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {!isCollapsed && 'Operations Center'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-[#0D1527] text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1527]/70'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />

              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Collapsible Toggle & Info */}
      <div className="p-3 border-t border-[#1A2744] bg-[#090E1A]">
        {!isCollapsed && (
          <div className="mb-3 p-2.5 rounded-lg bg-[#0D1527] border border-[#1E2D4A] text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OPERA Engine</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded enterprise knowledge with traceable SOP citations.
            </p>
          </div>
        )}

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-xs font-medium"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

export default function StatusBadge({ status, text, size = 'sm', className = '' }) {
  const normalized = (status || '').toLowerCase();

  let colors = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Clock;
  let pulse = false;

  if (normalized === 'connected' || normalized === 'indexed' || normalized === 'healthy' || normalized === 'success') {
    colors = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30';
    Icon = CheckCircle2;
    pulse = true;
  } else if (normalized === 'warning' || normalized === 'processing' || normalized === 'degraded') {
    colors = 'bg-amber-950/70 text-amber-400 border-amber-500/30';
    Icon = AlertCircle;
    pulse = true;
  } else if (normalized === 'disconnected' || normalized === 'failed' || normalized === 'down' || normalized === 'error') {
    colors = 'bg-rose-950/70 text-rose-400 border-rose-500/30';
    Icon = XCircle;
  }

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[11px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-sm gap-2',
  }[size] || 'px-2 py-0.5 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colors} ${sizeClasses} ${className}`}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
        )}
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
      </span>
      <span>{text || status}</span>
    </span>
  );
}

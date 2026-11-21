import React from 'react';

export default function Logo({ size = 34, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center shrink-0" 
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.45)]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="operaBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
            <linearGradient id="coreFacet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          {/* Hexagonal retrieval cell */}
          <polygon 
            points="50,8 90,30 90,70 50,92 10,70 10,30" 
            stroke="url(#operaBrandGrad)" 
            strokeWidth="4" 
            strokeLinejoin="round" 
            fill="url(#coreFacet)" 
          />
          {/* Isometric knowledge vectors */}
          <polygon points="50,8 50,50 10,30" fill="#0EA5E9" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="1.5" />
          <polygon points="50,8 90,30 50,50" fill="#14B8A6" fillOpacity="0.3" stroke="#2DD4BF" strokeWidth="1.5" />
          <polygon points="50,50 90,70 50,92" fill="#0284C7" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1.5" />
          <polygon points="50,50 50,92 10,70" fill="#0F766E" fillOpacity="0.3" stroke="#14B8A6" strokeWidth="1.5" />
          {/* High-precision focal point */}
          <circle cx="50" cy="50" r="5" fill="#F8FAFC" />
          <circle cx="50" cy="50" r="9" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-xl text-white font-sans">
              OPERA
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              SOP AI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight">
            Intelligent Operations Assistant
          </span>
        </div>
      )}
    </div>
  );
}

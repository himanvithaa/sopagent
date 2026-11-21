import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Activity, 
  User, 
  Server, 
  Cpu, 
  Database, 
  Layers, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import Logo from './Logo';
import { getHealth } from '../services/api';

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await getHealth();
        setHealthData(data);
      } catch (err) {
        setHealthData({ status: 'degraded' });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isHealthy = healthData?.status === 'healthy';
  const isOllamaUp = healthData?.ollama?.status === 'connected';

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#0B1120]/95 backdrop-blur border-b border-[#1A2744] flex items-center justify-between px-4 lg:px-6">
      {/* Brand & Left section */}
      <div className="flex items-center gap-4">
        <Logo size={32} showText={true} />
      </div>

      {/* Global Search Center */}
      <div className="flex-1 max-w-xl mx-4 lg:mx-8">
        <form onSubmit={handleGlobalSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search operational manual, SOP ID (e.g. SOP-IT-001), or procedure..."
            className="w-full bg-[#0D1527] border border-[#1E2D4A] rounded-lg pl-10 pr-16 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              Enter
            </kbd>
          </div>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* AI System Health status badge with popup */}
        <div className="relative">
          <button
            onClick={() => setIsHealthOpen(!isHealthOpen)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              isHealthy
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60'
                : 'bg-amber-950/60 text-amber-400 border-amber-500/30 hover:border-amber-500/60'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="hidden sm:inline">
              {isOllamaUp ? 'AI Engine Ready' : 'AI Service Degraded'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isHealthOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0D1527] border border-[#1E2D4A] rounded-xl shadow-2xl p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="font-semibold text-white">System Component Health</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  isHealthy ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                }`}>
                  {healthData?.status || 'Unknown'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300">FastAPI Backend</span>
                  </div>
                  <span className="text-emerald-400 font-mono">Connected</span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-slate-300">Database Engine</span>
                  </div>
                  <span className={healthData?.database?.status === 'connected' ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                    {healthData?.database?.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300">ChromaDB Store</span>
                  </div>
                  <span className="text-emerald-400 font-mono">
                    {healthData?.chromadb?.status === 'connected' ? 'Indexed' : 'Standby'}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300">Local Ollama AI</span>
                  </div>
                  <span className={isOllamaUp ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                    {isOllamaUp ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsHealthOpen(false);
                    navigate('/settings');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium flex items-center gap-1"
                >
                  Configure AI Settings <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0D1527] border border-[#1E2D4A] rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="font-semibold text-white pb-2 mb-2 border-b border-slate-800">
                Operational Alerts
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-slate-900/50 border border-slate-800 text-slate-300">
                  <p className="font-medium text-white">Repository Initialized</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">6 enterprise SOP procedures successfully indexed in ChromaDB.</p>
                </div>
                <div className="p-2 rounded bg-slate-900/50 border border-slate-800 text-slate-300">
                  <p className="font-medium text-cyan-300">Semantic Search Ready</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Full RAG pipeline active for operational incident triage.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md text-xs">
            OP
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">SecOps Admin</span>
            <span className="text-[10px] text-slate-400 leading-tight">Tier-3 Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
}

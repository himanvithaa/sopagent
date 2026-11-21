import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Cpu,
  Database,
  Server,
  Layers,
  Sparkles,
  Upload,
  BookOpen,
  BarChart2,
  Clock,
  ShieldAlert,
  Zap,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getDashboardStats } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Overview() {
  const navigate = useNavigate();
  const [queryInput, setQueryInput] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (queryInput.trim()) {
      navigate(`/assistant?initial=${encodeURIComponent(queryInput.trim())}`);
    }
  };

  const categories = stats?.categories || [];
  const timeline = stats?.activity_timeline || [];
  const health = stats?.system_health || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & AI Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1528] via-[#0E1A33] to-[#070B14] border border-[#1E2D4A] p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Operations Command Center</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Good morning, Welcome to <span className="opera-gradient-text">OPERA</span>
          </h1>
          <p className="text-slate-400 mt-2 text-base lg:text-lg">
            Your intelligent operational knowledge center. From operational questions to actionable knowledge.
          </p>

          {/* Prominent AI Query Bar */}
          <form onSubmit={handleQuerySubmit} className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Describe an operational issue or search for an SOP (e.g. server outage, failover, BGP routing)..."
                className="w-full bg-[#070B14]/90 border border-cyan-500/30 hover:border-cyan-500/60 focus:border-cyan-400 rounded-xl pl-12 pr-4 py-3.5 text-sm lg:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-2xl transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0 text-sm lg:text-base"
            >
              <span>Ask OPERA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Suggested quick chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-400">Try:</span>
            {[
              'Server connectivity outage troubleshooting',
              'Credential compromise emergency protocol',
              'Postgres replication lag mitigation'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/assistant?initial=${encodeURIComponent(chip)}`)}
                className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="opera-card opera-card-glow p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Documents</span>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (stats?.total_documents ?? 0)}
            </span>
            <span className="text-xs text-slate-400">in repository</span>
          </div>
        </div>

        <div className="opera-card opera-card-glow p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Indexed SOPs</span>
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (stats?.indexed_sops ?? 0)}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Ready in ChromaDB</span>
          </div>
        </div>

        <div className="opera-card opera-card-glow p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Queries Processed</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (stats?.queries_processed ?? 0)}
            </span>
            <span className="text-xs text-slate-400">operational sessions</span>
          </div>
        </div>

        <div className="opera-card opera-card-glow p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Successful Retrievals</span>
            <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (stats?.successful_retrievals ?? 0)}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              {stats?.success_rate_percentage ?? 0}% success rate
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Knowledge Activity Chart */}
        <div className="opera-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">A. Knowledge & Query Activity</h2>
              <p className="text-xs text-slate-400">Actual document indexing and operational queries over the past 7 days</p>
            </div>
            <span className="text-xs font-medium text-slate-400 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              Live Audited
            </span>
          </div>

          <div className="h-64 w-full">
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="queryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="docGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1527',
                      borderColor: '#1E2D4A',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="queries" name="Queries" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#queryGrad)" />
                  <Area type="monotone" dataKey="documents_indexed" name="Docs Indexed" stroke="#14B8A6" strokeWidth={2} fillOpacity={1} fill="url(#docGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No activity data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Section D: Knowledge Distribution Donut */}
        <div className="opera-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">D. Category Distribution</h2>
              <p className="text-xs text-slate-400">Indexed standard procedures</p>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#0EA5E9'} stroke="#070B14" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1527',
                      borderColor: '#1E2D4A',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs">No documents indexed yet.</div>
            )}
          </div>

          <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#0EA5E9' }} />
                  <span className="text-slate-300 truncate max-w-[130px]">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-100">{cat.count} SOPs</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Recent SOP Access, AI Timeline, and System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section B: Recent SOP Access */}
        <div className="opera-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">B. Recent SOP Access</h2>
              <p className="text-xs text-slate-400">Recently indexed and referenced procedures</p>
            </div>
            <button
              onClick={() => navigate('/library')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {stats?.recent_sops?.length > 0 ? (
              stats.recent_sops.map((sop) => (
                <div
                  key={sop.id}
                  onClick={() => navigate(`/library?doc=${sop.id}`)}
                  className="p-3 rounded-lg bg-[#090E1A] hover:bg-[#121B30] border border-[#1A2744] hover:border-cyan-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-cyan-300 line-clamp-1">
                      {sop.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0 font-mono">
                      {sop.chunk_count} chunks
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-teal-400 font-medium">{sop.category}</span>
                    <span>{sop.created_at}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                No recent procedures accessed.
              </div>
            )}
          </div>
        </div>

        {/* Section C: AI Activity Timeline */}
        <div className="opera-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">C. AI Activity Timeline</h2>
              <p className="text-xs text-slate-400">Real-time retrieval & query activity</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Audit log <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800/80">
            {stats?.recent_activities?.length > 0 ? (
              stats.recent_activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full bg-[#0D1527] border border-cyan-500/40 flex items-center justify-center shrink-0 z-10 text-cyan-400">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 font-medium truncate">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {act.created_at}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs">
                No AI activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Section E: System Health */}
        <div className="opera-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">E. System Health</h2>
              <p className="text-xs text-slate-400">Core RAG and local model connections</p>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Diagnostics <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-lg bg-[#090E1A] border border-[#1A2744] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-white">FastAPI Service</div>
                  <div className="text-[10px] text-slate-400">REST API Core</div>
                </div>
              </div>
              <StatusBadge status="connected" text="Operational" size="xs" />
            </div>

            <div className="p-2.5 rounded-lg bg-[#090E1A] border border-[#1A2744] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Database Engine</div>
                  <div className="text-[10px] text-slate-400">{health?.database?.name || 'SQLAlchemy Store'}</div>
                </div>
              </div>
              <StatusBadge 
                status={health?.database?.status || 'connected'} 
                text={health?.database?.status === 'connected' ? 'Connected' : 'Offline'} 
                size="xs" 
              />
            </div>

            <div className="p-2.5 rounded-lg bg-[#090E1A] border border-[#1A2744] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-white">ChromaDB Store</div>
                  <div className="text-[10px] text-slate-400">HNSW Vector Space</div>
                </div>
              </div>
              <StatusBadge 
                status={health?.chromadb?.status || 'connected'} 
                text={health?.chromadb?.status === 'connected' ? 'Active' : 'Offline'} 
                size="xs" 
              />
            </div>

            <div className="p-2.5 rounded-lg bg-[#090E1A] border border-[#1A2744] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Ollama Local AI</div>
                  <div className="text-[10px] text-slate-400">Llama 3.2 & Nomic Embed</div>
                </div>
              </div>
              <StatusBadge 
                status={health?.ollama?.status || 'warning'} 
                text={health?.ollama?.status === 'connected' ? 'Ready' : 'Offline'} 
                size="xs" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section F: Quick Actions */}
      <div className="opera-card p-5">
        <h2 className="text-base font-bold text-white mb-3">F. Quick Operations Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/assistant')}
            className="p-4 rounded-xl bg-[#090E1A] hover:bg-cyan-950/40 border border-[#1A2744] hover:border-cyan-500/40 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-cyan-300">Ask OPERA</span>
            <span className="text-[10px] text-slate-400">Troubleshoot incident</span>
          </button>

          <button
            onClick={() => navigate('/knowledge')}
            className="p-4 rounded-xl bg-[#090E1A] hover:bg-teal-950/40 border border-[#1A2744] hover:border-teal-500/40 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-teal-300">Upload Documents</span>
            <span className="text-[10px] text-slate-400">Ingest PDF/DOCX/TXT</span>
          </button>

          <button
            onClick={() => navigate('/library')}
            className="p-4 rounded-xl bg-[#090E1A] hover:bg-indigo-950/40 border border-[#1A2744] hover:border-indigo-500/40 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-indigo-300">Explore SOPs</span>
            <span className="text-[10px] text-slate-400">Browse manual library</span>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="p-4 rounded-xl bg-[#090E1A] hover:bg-amber-950/40 border border-[#1A2744] hover:border-amber-500/40 flex flex-col items-center justify-center gap-2 text-center transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-amber-300">View Analytics</span>
            <span className="text-[10px] text-slate-400">System intelligence</span>
          </button>
        </div>
      </div>
    </div>
  );
}

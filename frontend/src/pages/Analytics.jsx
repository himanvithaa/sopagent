import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  PieChart as PieIcon,
  Activity,
  FileText,
  Search,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getAnalytics } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const trend = data?.query_volume_trend || [];
  const categories = data?.category_distribution || [];
  const topics = data?.most_searched_topics || [];
  const documents = data?.frequently_retrieved_documents || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Operational Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time metrics and knowledge intelligence derived directly from database query audit records.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="opera-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Inquiries</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{data?.total_queries ?? 0}</span>
            <span className="text-xs text-slate-400">logged sessions</span>
          </div>
        </div>

        <div className="opera-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Retrieval Success Rate</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400">{data?.success_rate ?? 0}%</span>
            <span className="text-xs text-emerald-400 font-medium">Grounded answers</span>
          </div>
        </div>

        <div className="opera-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg RAG Latency</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-400">{data?.avg_response_time_ms ?? 0}</span>
            <span className="text-xs text-slate-400">milliseconds</span>
          </div>
        </div>

        <div className="opera-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Successful Queries</span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">{data?.successful_queries ?? 0}</span>
            <span className="text-xs text-slate-400">verified procedures</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Volume Trend */}
        <div className="opera-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Query Volume Over Time</h2>
              <p className="text-xs text-slate-400">Daily operational inquiries over the past 14 days</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsQueryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
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
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="queries"
                    name="Queries"
                    stroke="#0EA5E9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#analyticsQueryGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                No query trends recorded.
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="opera-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Category Distribution</h2>
              <p className="text-xs text-slate-400">Knowledge volume by domain</p>
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
              <div className="text-slate-500 text-xs">No document categories.</div>
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

      {/* Tables: Most Searched Topics & Frequently Retrieved Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Searched Topics */}
        <div className="opera-card p-5">
          <h2 className="text-base font-bold text-white mb-1">Most Searched Operational Topics</h2>
          <p className="text-xs text-slate-400 mb-4">Derived from actual query log clusters</p>

          <div className="space-y-3">
            {topics.length > 0 ? (
              topics.map((t, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#070B14] border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white truncate max-w-[220px]">{t.topic}</span>
                    <span className="text-cyan-400 font-mono font-bold">{t.count} queries</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${t.success_rate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Grounding match</span>
                    <span className="text-emerald-400 font-medium">{t.success_rate}% success</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No topics searched yet.
              </div>
            )}
          </div>
        </div>

        {/* Frequently Retrieved Documents */}
        <div className="opera-card p-5">
          <h2 className="text-base font-bold text-white mb-1">Frequently Retrieved SOPs</h2>
          <p className="text-xs text-slate-400 mb-4">Procedures with highest citation frequency</p>

          <div className="space-y-2.5">
            {documents.length > 0 ? (
              documents.map((d, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#070B14] border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-semibold text-white truncate">{d.title}</p>
                    <span className="text-[10px] text-teal-400 font-medium">{d.category}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-cyan-300 block">{d.access_count}</span>
                    <span className="text-[10px] text-slate-500 uppercase">Citations</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No document retrievals logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

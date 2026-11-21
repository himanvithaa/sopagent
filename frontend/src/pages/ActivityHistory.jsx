import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Trash2,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { getActivityHistory } from '../services/api';

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await getActivityHistory();
      setActivities(data || []);
    } catch (err) {
      console.error('Failed to load activity history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filtered = activities.filter(act => {
    const matchesType = filterType === 'All' || act.activity_type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch = !searchTerm || act.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activity & Audit History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete audit trail of operational queries, document ingestions, and vector index modifications.
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-colors shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="opera-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit descriptions..."
            className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Event Types</option>
            <option value="query">AI Inquiries</option>
            <option value="upload">Document Ingestion</option>
            <option value="delete">Deletions</option>
            <option value="view_sop">SOP Views</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="opera-card overflow-hidden">
        <div className="p-4 border-b border-[#1A2744] bg-[#090E1A] flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Audit Records ({filtered.length})</span>
          <span>Timestamp</span>
        </div>

        <div className="divide-y divide-[#1A2744]">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading audit records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No audit records match your criteria.
            </div>
          ) : (
            filtered.map((act) => {
              let Icon = Clock;
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

              if (act.activity_type === 'query') {
                Icon = Cpu;
                badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-500/30';
              } else if (act.activity_type === 'upload') {
                Icon = FileText;
                badgeColor = 'bg-teal-950 text-teal-300 border-teal-500/30';
              } else if (act.activity_type === 'delete') {
                Icon = Trash2;
                badgeColor = 'bg-rose-950 text-rose-300 border-rose-500/30';
              }

              return (
                <div key={act.id} className="p-4 hover:bg-[#0D1527] transition-colors flex items-start justify-between gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#070B14] border border-[#1E2D4A] flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                          {act.activity_type}
                        </span>
                        {act.target_id && (
                          <span className="font-mono text-slate-500 text-[11px]">
                            Target: {act.target_id}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-white text-sm">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {act.created_at}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

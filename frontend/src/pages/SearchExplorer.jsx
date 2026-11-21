import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SearchCode,
  Search,
  Filter,
  FileText,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { semanticSearch } from '../services/api';

const CATEGORIES = [
  'All',
  'IT Operations',
  'Network Management',
  'Server Maintenance',
  'Security',
  'Troubleshooting',
  'General Procedures'
];

export default function SearchExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(urlQuery || 'Procedures for resolving server connectivity problems');
  const [category, setCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [execTime, setExecTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      executeSearch(urlQuery, category);
    } else {
      executeSearch(query, category);
    }
  }, [urlQuery]);

  const executeSearch = async (qText, cat) => {
    if (!qText.trim()) return;
    try {
      setLoading(true);
      const data = await semanticSearch({
        q: qText.trim(),
        category: cat !== 'All' ? cat : undefined,
        limit: 15
      });
      setResults(data.results || []);
      setTotalMatches(data.total_matches || 0);
      setExecTime(data.execution_time_ms || 0);
    } catch (err) {
      console.error('Semantic search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    executeSearch(query, category);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Search Explorer</h1>
        <p className="text-sm text-slate-400 mt-1">
          ChromaDB semantic search engine. Retrieve granular document chunks ranked by cosine similarity.
        </p>
      </div>

      {/* Prominent Search Bar */}
      <div className="opera-card p-5 bg-[#0D1527] border-[#1E2D4A] shadow-xl">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask an operational question (e.g. Procedures for resolving server connectivity problems)..."
                className="w-full bg-[#070B14] border border-[#1E2D4A] focus:border-cyan-500 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  executeSearch(query, e.target.value);
                }}
                className="bg-[#070B14] border border-[#1E2D4A] rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing {results.length} semantic matches ({execTime} ms execution time)
            </span>
            <span className="font-mono text-cyan-400">Cosine Distance Space</span>
          </div>
        </form>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Computing query embedding and scanning ChromaDB vector indices...
          </div>
        ) : results.length === 0 ? (
          <div className="opera-card p-12 text-center text-slate-500">
            <SearchCode className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-white">No semantic matches found.</p>
            <p className="text-xs text-slate-400 mt-1">Try broadening your search query or uploading relevant technical documentation.</p>
          </div>
        ) : (
          results.map((result, idx) => {
            const scorePct = Math.round(result.relevance_score * 100);
            return (
              <div
                key={result.chunk_id || idx}
                className="opera-card opera-card-glow p-5 space-y-3 bg-[#0D1527] border-[#1E2D4A] transition-all"
              >
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-sm text-white">{result.document_title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-400 font-medium px-2 py-0.5 rounded bg-teal-950/60 border border-teal-500/30">
                      {result.category}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                      <span>{scorePct}%</span>
                      <span className="text-[10px] text-cyan-400 font-normal">relevance</span>
                    </div>
                  </div>
                </div>

                {/* Section & Page Info */}
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>Section: <strong className="text-slate-200">{result.section_title}</strong></span>
                  <span>•</span>
                  <span>Page {result.page_number}</span>
                </div>

                {/* Extracted Snippet */}
                <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {result.content}
                </div>

                {/* Direct Action: Ask AI about this chunk */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/library?doc=${result.document_id}`)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium px-3 py-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    <span>View full SOP</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/assistant?initial=${encodeURIComponent(`Based on '${result.document_title}' (${result.section_title}): ${query}`)}`)
                    }
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium px-3 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 transition-all"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask OPERA about this chunk</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

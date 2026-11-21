import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  BookOpenCheck,
  Search,
  Filter,
  FileText,
  Calendar,
  Layers,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Eye,
  FileCode,
  X
} from 'lucide-react';
import { getDocuments, getDocument } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = [
  'All',
  'IT Operations',
  'Network Management',
  'Server Maintenance',
  'Security',
  'Troubleshooting',
  'General Procedures'
];

export default function SOPLibrary() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialDocId = searchParams.get('doc');

  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Document Reader Modal/Drawer
  const [activeDoc, setActiveDoc] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [readerSearch, setReaderSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (initialDocId) {
      loadDocumentDetails(initialDocId);
    }
  }, [initialDocId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined
      });
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load SOP library', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentDetails = async (id) => {
    try {
      setDocLoading(true);
      const data = await getDocument(id);
      setActiveDoc(data);
    } catch (err) {
      console.error('Failed to load document details', err);
    } finally {
      setDocLoading(false);
    }
  };

  // Filter chunks inside reader
  const filteredChunks = activeDoc?.chunks?.filter(c =>
    !readerSearch ||
    c.content.toLowerCase().includes(readerSearch.toLowerCase()) ||
    c.section_title.toLowerCase().includes(readerSearch.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SOP Library</h1>
          <p className="text-sm text-slate-400 mt-1">
            Searchable catalog of indexed enterprise standard operating procedures and technical manuals.
          </p>
        </div>

        <button
          onClick={() => navigate('/assistant')}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 font-semibold rounded-xl text-xs transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Consult AI Assistant</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="opera-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search procedure title, document ID, or keywords..."
            className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* SOP Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Loading library catalogue...
        </div>
      ) : documents.length === 0 ? (
        <div className="opera-card p-12 text-center text-slate-500">
          <BookOpenCheck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="font-semibold text-white">No SOPs found.</p>
          <p className="text-xs text-slate-400 mt-1">Upload procedures in the Knowledge Hub to view them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => loadDocumentDetails(doc.id)}
              className="opera-card opera-card-glow p-5 flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                    {doc.id}
                  </span>
                  <StatusBadge status={doc.status} size="xs" />
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {doc.description || 'Verified enterprise operating procedure.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-teal-400 font-medium">{doc.category}</span>
                <span className="font-mono text-cyan-400">{doc.chunk_count} chunks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Reader Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="opera-card max-w-3xl w-full p-6 bg-[#0B1120] border-[#1E2D4A] shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setActiveDoc(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Metadata */}
            <div className="pb-3 border-b border-[#1A2744]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {activeDoc.id}
                </span>
                <span className="text-xs text-teal-400 font-semibold">{activeDoc.category}</span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeDoc.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                <span>{activeDoc.chunk_count} Chunks</span>
                <span>•</span>
                <span>{activeDoc.page_count} Pages</span>
                <span>•</span>
                <span>Source: {activeDoc.filename}</span>
              </div>
            </div>

            {/* Search inside Document */}
            <div className="my-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={readerSearch}
                onChange={(e) => setReaderSearch(e.target.value)}
                placeholder="Search within this document (e.g. commands, steps, error codes)..."
                className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Document Content Sections */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredChunks.length > 0 ? (
                filteredChunks.map((chunk, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#070B14] border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 font-bold">{chunk.section_title}</span>
                      <span className="text-slate-500 text-[11px]">Page {chunk.page_number}</span>
                    </div>
                    <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {chunk.content}
                    </pre>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No matching text found within this procedure.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#1A2744] flex items-center justify-between">
              <button
                onClick={() => {
                  const title = activeDoc.title;
                  setActiveDoc(null);
                  navigate(`/assistant?initial=${encodeURIComponent(`Explain standard procedure: ${title}`)}`);
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask OPERA about this SOP</span>
              </button>

              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

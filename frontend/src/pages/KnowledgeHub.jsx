import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FolderOpen,
  X,
  FileCode,
  HardDrive
} from 'lucide-react';
import { getDocuments, uploadDocuments, deleteDocument, getDocument } from '../services/api';
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

export default function KnowledgeHub() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadCategory, setUploadCategory] = useState('IT Operations');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await getDocuments({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined
      });
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [selectedCategory, searchQuery]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadFiles(files);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFiles.length) return;

    try {
      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);

      await uploadDocuments(formData);
      setIsUploadOpen(false);
      setUploadFiles([]);
      setUploadDescription('');
      fetchDocs();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload and index document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete '${title}' and all its vector embeddings?`)) return;
    try {
      await deleteDocument(docId);
      fetchDocs();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleOpenPreview = async (docId) => {
    try {
      setPreviewLoading(true);
      const data = await getDocument(docId);
      setPreviewDoc(data);
    } catch (err) {
      alert('Failed to load document preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Knowledge Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise document ingestion workspace. Ingest PDF, DOCX, and TXT SOPs into ChromaDB vector space.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Ingest New Documents</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="opera-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document title, ID, or keywords..."
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

          <button
            onClick={fetchDocs}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Table / Grid */}
      <div className="opera-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090E1A] text-slate-400 uppercase tracking-wider font-semibold border-b border-[#1A2744]">
              <tr>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Chunks</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Ingested At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2744] text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading indexed documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FolderOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-slate-400">No documents found.</p>
                    <p className="text-[11px] mt-1">Upload technical manuals or SOP documents to populate the Knowledge Hub.</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#0E172B] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate" title={doc.title}>{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-teal-400 font-medium">
                      {doc.category}
                    </td>
                    <td className="py-3 px-4 uppercase font-mono text-[11px] text-slate-400">
                      .{doc.file_type}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-300">
                      {doc.chunk_count}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} size="xs" />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPreview(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                          title="Preview Content"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          title="Delete from Vector Store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="opera-card max-w-lg w-full p-6 bg-[#0B1120] border-[#1E2D4A] shadow-2xl relative">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">Ingest Documents into RAG Vector Store</h2>
            <p className="text-xs text-slate-400 mb-4">
              Upload PDF, DOCX, or TXT procedures. The document parser will extract text, generate chunks, and index vectors in ChromaDB.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1E2D4A] hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer bg-[#070B14] transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                <p className="text-xs font-semibold text-white">
                  Drag and drop documents here, or <span className="text-cyan-400 underline">browse files</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Supports PDF, DOCX, and TXT (Max 50MB per file)</p>

                {uploadFiles.length > 0 && (
                  <div className="mt-3 text-left p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-bold text-cyan-300 block mb-1">
                      {uploadFiles.length} file(s) selected:
                    </span>
                    <ul className="text-[11px] text-slate-300 space-y-0.5">
                      {uploadFiles.map((f, i) => (
                        <li key={i} className="truncate">• {f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Category Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Scope / Description (Optional)</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  placeholder="Operational scope, targeted systems, or compliance tier..."
                  className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || uploadFiles.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting & Indexing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ingest & Index</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="opera-card max-w-2xl w-full p-6 bg-[#0B1120] border-[#1E2D4A] shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-[#1A2744]">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {previewDoc.category}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">{previewDoc.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                <span>{previewDoc.chunk_count} Chunks</span>
                <span>•</span>
                <span>{(previewDoc.file_size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span>.{previewDoc.file_type}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
              {/* Preview Content */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Extracted Content Preview
                </h3>
                <pre className="text-xs text-slate-200 bg-[#070B14] p-3 rounded-lg border border-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {previewDoc.content_preview || 'No text preview available.'}
                </pre>
              </div>

              {/* Chunks List */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Indexed Chunks in ChromaDB ({previewDoc.chunks?.length || 0})
                </h3>
                <div className="space-y-2">
                  {previewDoc.chunks?.map((chunk, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-[#090E1A] border border-slate-800 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono mb-1">
                        <span>Chunk #{chunk.chunk_index} ({chunk.section_title})</span>
                        <span>Page {chunk.page_number}</span>
                      </div>
                      <p className="text-slate-300 line-clamp-3 font-mono text-[11px]">
                        {chunk.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1A2744] flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

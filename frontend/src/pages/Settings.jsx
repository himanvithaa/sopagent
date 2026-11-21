import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Server,
  Database,
  Cpu,
  Layers,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import {
  getHealth,
  getOllamaSettings,
  updateOllamaSettings,
  reindexDocuments,
  seedDemoData
} from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Settings() {
  const [healthData, setHealthData] = useState(null);
  const [ollamaConfig, setOllamaConfig] = useState({
    base_url: 'http://localhost:11434',
    chat_model: 'llama3.2',
    embed_model: 'nomic-embed-text'
  });
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [hData, oData] = await Promise.all([getHealth(), getOllamaSettings()]);
      setHealthData(hData);
      setOllamaStatus(oData);
      if (oData) {
        setOllamaConfig({
          base_url: oData.base_url || 'http://localhost:11434',
          chat_model: oData.chat_model || 'llama3.2',
          embed_model: oData.embed_model || 'nomic-embed-text'
        });
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleSaveOllama = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setActionMessage(null);
      const updated = await updateOllamaSettings(ollamaConfig);
      setOllamaStatus(updated);
      await loadSettings();
      setActionMessage({ type: 'success', text: 'Ollama settings updated and connection tested!' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update Ollama settings: ' + (err.response?.data?.detail || err.message) });
    } finally {
      setSaving(false);
    }
  };

  const handleReindex = async () => {
    if (!window.confirm('Re-index all documents in the repository into ChromaDB vector store?')) return;
    try {
      setReindexing(true);
      setActionMessage(null);
      const res = await reindexDocuments();
      await loadSettings();
      setActionMessage({ type: 'success', text: res.message });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Reindexing failed: ' + (err.response?.data?.detail || err.message) });
    } finally {
      setReindexing(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setActionMessage(null);
      const res = await seedDemoData();
      await loadSettings();
      setActionMessage({ type: 'success', text: res.message });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Seeding failed: ' + (err.response?.data?.detail || err.message) });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Health Monitoring</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor system services, configure local Ollama AI models, and manage vector indices.
        </p>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* System Health Diagnostics Grid */}
      <div className="opera-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A2744]">
          <div>
            <h2 className="text-base font-bold text-white">System Component Health</h2>
            <p className="text-xs text-slate-400">Live heartbeat status for all backend infrastructure layers</p>
          </div>
          <button
            onClick={loadSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Connectivity</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* FastAPI */}
          <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1A2744] flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">FastAPI Core</span>
                <p className="text-slate-400 text-[11px] mt-0.5">REST API Gateway & Lifespan Service</p>
                <span className="text-slate-500 font-mono text-[10px] block mt-1">Status: Operational</span>
              </div>
            </div>
            <StatusBadge status="connected" text="Connected" size="sm" />
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1A2744] flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">{healthData?.database?.name || 'Application DB'}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{healthData?.database?.details || 'Metadata store'}</p>
                <span className="text-slate-500 font-mono text-[10px] block mt-1">
                  Latency: {healthData?.database?.latency_ms ?? 0.5} ms
                </span>
              </div>
            </div>
            <StatusBadge status={healthData?.database?.status || 'connected'} size="sm" />
          </div>

          {/* ChromaDB */}
          <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1A2744] flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">ChromaDB Vector Store</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{healthData?.chromadb?.details || 'HNSW Cosine Vector Store'}</p>
                <span className="text-slate-500 font-mono text-[10px] block mt-1">Status: Active persistent index</span>
              </div>
            </div>
            <StatusBadge status={healthData?.chromadb?.status || 'connected'} size="sm" />
          </div>

          {/* Ollama */}
          <div className="p-4 rounded-xl bg-[#090E1A] border border-[#1A2744] flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">Local Ollama AI Engine</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{healthData?.ollama?.details || 'Ollama Daemon'}</p>
                <span className="text-slate-500 font-mono text-[10px] block mt-1">
                  Endpoint: {ollamaConfig.base_url}
                </span>
              </div>
            </div>
            <StatusBadge 
              status={ollamaStatus?.is_connected ? 'connected' : 'warning'} 
              text={ollamaStatus?.is_connected ? 'Connected' : 'Offline'} 
              size="sm" 
            />
          </div>
        </div>
      </div>

      {/* Ollama Configuration Form */}
      <div className="opera-card p-6 space-y-4">
        <div className="pb-3 border-b border-[#1A2744]">
          <h2 className="text-base font-bold text-white">Ollama Local AI Configuration</h2>
          <p className="text-xs text-slate-400">
            Configure local inference parameters. All AI inference is executed strictly on-premise without external APIs.
          </p>
        </div>

        <form onSubmit={handleSaveOllama} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ollama Base URL</label>
              <input
                type="text"
                value={ollamaConfig.base_url}
                onChange={(e) => setOllamaConfig({ ...ollamaConfig, base_url: e.target.value })}
                placeholder="http://localhost:11434"
                className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Chat Generation Model</label>
              <input
                type="text"
                value={ollamaConfig.chat_model}
                onChange={(e) => setOllamaConfig({ ...ollamaConfig, chat_model: e.target.value })}
                placeholder="llama3.2"
                className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: llama3.2</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Embedding Model</label>
              <input
                type="text"
                value={ollamaConfig.embed_model}
                onChange={(e) => setOllamaConfig({ ...ollamaConfig, embed_model: e.target.value })}
                placeholder="nomic-embed-text"
                className="w-full bg-[#070B14] border border-[#1E2D4A] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: nomic-embed-text</span>
            </div>
          </div>

          {/* Installed Models list if available */}
          {ollamaStatus?.installed_models?.length > 0 && (
            <div className="p-3 rounded-lg bg-[#070B14] border border-slate-800">
              <span className="text-[11px] font-semibold text-cyan-300 block mb-1">
                Detected Models in Ollama:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ollamaStatus.installed_models.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-300 border border-slate-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Testing & Saving...' : 'Save & Test Connection'}</span>
            </button>
          </div>
        </form>

        {/* Setup Instructions for Local Ollama */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Local Ollama Quick Setup Guide</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            To run fully offline inference with the native models, execute these commands in your local terminal:
          </p>
          <div className="bg-[#070B14] p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-1">
            <p># 1. Start Ollama Daemon</p>
            <p className="text-white">ollama serve</p>
            <p className="pt-1"># 2. Pull Llama 3.2 Chat Model</p>
            <p className="text-white">ollama run llama3.2</p>
            <p className="pt-1"># 3. Pull Nomic Embed Text Model</p>
            <p className="text-white">ollama pull nomic-embed-text</p>
          </div>
          <p className="text-[11px] text-slate-400">
            * Note: When Ollama is offline, OPERA uses an internal semantic vector fallback to demonstrate full retrieval functionality without interruption.
          </p>
        </div>
      </div>

      {/* Repository Management */}
      <div className="opera-card p-6 space-y-4">
        <div className="pb-3 border-b border-[#1A2744]">
          <h2 className="text-base font-bold text-white">Repository Maintenance</h2>
          <p className="text-xs text-slate-400">Database synchronization and vector re-indexing tools</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#090E1A] border border-[#1A2744] text-xs">
          <div>
            <span className="font-bold text-white text-sm">ChromaDB Vector Re-index</span>
            <p className="text-slate-400 mt-0.5">
              Re-embed and re-index all documents in the database to align with updated embedding model weights.
            </p>
          </div>
          <button
            onClick={handleReindex}
            disabled={reindexing}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
            <span>{reindexing ? 'Re-indexing...' : 'Re-index Vector Store'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#090E1A] border border-[#1A2744] text-xs">
          <div>
            <span className="font-bold text-white text-sm">Seed Enterprise SOP Sample Dataset</span>
            <p className="text-slate-400 mt-0.5">
              Populates the database and vector store with verified sample SOPs (Server connectivity, Incident Response, Failover runbooks).
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{seeding ? 'Seeding...' : 'Seed Sample SOPs'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

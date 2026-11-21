import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Terminal,
  Layers,
  Filter,
  Info,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { sendChatMessage, getConversations, getConversationHistory, deleteConversation } from '../services/api';

const SUGGESTED_PROMPTS = [
  {
    title: 'Troubleshoot Server Connectivity',
    desc: 'Diagnose packet loss, gateway dropouts, and interface flapping on production host.',
    prompt: 'How do I diagnose and resolve unexpected server connectivity and network reachability issues on production hosts?'
  },
  {
    title: 'Emergency Security Incident Protocol',
    desc: 'Immediate containment steps for leaked AWS keys or compromised admin credentials.',
    prompt: 'What are the mandatory containment actions when unauthorized credential access or token leakage is detected?'
  },
  {
    title: 'Linux Kernel Panic & Memory Recovery',
    desc: 'Investigate runaway OOM killer invocations and memory exhaustion runbook.',
    prompt: 'What standard operating procedure should be followed for diagnosing Linux high memory utilization and OOM killer events?'
  },
  {
    title: 'Database Replication Lag & Failover',
    desc: 'Mitigate replica synchronization delay and execute emergency primary promotion.',
    prompt: 'What is the runbook procedure for mitigating database replication lag and promoting a read-replica during an outage?'
  }
];

const CATEGORIES = [
  'All',
  'IT Operations',
  'Security',
  'Server Maintenance',
  'Network Management',
  'Troubleshooting',
  'General Procedures'
];

export default function AIAssistant() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('initial');

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [activeRetrievedChunks, setActiveRetrievedChunks] = useState([]);
  const [isRetrievedPanelOpen, setIsRetrievedPanelOpen] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load conversation list
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle initial query from overview query bar
  useEffect(() => {
    if (initialQuery && !isLoading && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const handleSelectConversation = async (convId) => {
    try {
      setActiveConversationId(convId);
      setIsLoading(true);
      const data = await getConversationHistory(convId);
      setMessages(data.messages || []);
      // If the last message has retrieved chunks, show them in panel
      const lastAssistantMsg = [...(data.messages || [])].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg && lastAssistantMsg.retrieved_chunks?.length > 0) {
        setActiveRetrievedChunks(lastAssistantMsg.retrieved_chunks);
      } else {
        setActiveRetrievedChunks([]);
      }
    } catch (err) {
      console.error('Failed to load conversation history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setActiveRetrievedChunks([]);
    setInputMessage('');
  };

  const handleClearCurrent = async () => {
    if (activeConversationId) {
      try {
        await deleteConversation(activeConversationId);
        loadConversations();
      } catch (err) {
        console.error('Failed to delete conversation', err);
      }
    }
    handleNewConversation();
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');

    // Append user message to UI immediately
    const tempUserMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const payload = {
        message: text,
        conversation_id: activeConversationId || undefined,
        category_filter: selectedCategory !== 'All' ? selectedCategory : undefined
      };

      const response = await sendChatMessage(payload);

      setActiveConversationId(response.conversation_id);
      setMessages(prev => [...prev, response]);

      if (response.retrieved_chunks && response.retrieved_chunks.length > 0) {
        setActiveRetrievedChunks(response.retrieved_chunks);
      }

      loadConversations();
    } catch (err) {
      console.error('Chat error', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Encountered an operational error communicating with the RAG pipeline. Please verify system health or retry.',
        structured_data: {
          understanding: 'Operational inquiry failed to complete.',
          relevant_sop_found: 'System Error',
          recommended_corrective_actions: [
            'Verify FastAPI backend service connectivity.',
            'Confirm ChromaDB collection state in Settings.',
            'Retry query with simplified keywords.'
          ],
          important_notes: ['Audit log has recorded this incident.'],
          source_references: [],
          is_grounded_in_docs: false
        },
        retrieved_chunks: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4 overflow-hidden">
      {/* Left Chat Workspace (Main) */}
      <div className="flex-1 flex flex-col bg-[#0B1120] rounded-2xl border border-[#1A2744] overflow-hidden shadow-2xl">
        {/* Workspace Sub-Header */}
        <div className="px-5 py-3 border-b border-[#1A2744] bg-[#0D1527] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">OPERA AI Workspace</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-semibold uppercase">
                  Grounded Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Retrieving strictly verified procedures from indexed company repositories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter Pill */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#070B14] border border-[#1E2D4A] rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNewConversation}
              className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-medium transition-all"
              title="Start a new conversation"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleClearCurrent}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsRetrievedPanelOpen(!isRetrievedPanelOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isRetrievedPanelOpen
                  ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                  : 'bg-[#070B14] text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle Retrieved Knowledge Drawer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Knowledge ({activeRetrievedChunks.length})</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {messages.length === 0 ? (
            /* Initial Welcome Screen */
            <div className="max-w-2xl mx-auto py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950 to-teal-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                How can I help resolve your operational issue?
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-lg">
                Describe an unexpected operational incident, error log, or query a technical procedure. 
                OPERA matches against indexed SOPs and outlines traceable corrective actions.
              </p>

              {/* 4 Suggested Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full text-left">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-xl bg-[#0D1527] hover:bg-[#121B30] border border-[#1A2744] hover:border-cyan-500/40 transition-all text-left group shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        {item.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation Stream */
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const struct = msg.structured_data;

              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-3xl ${isUser ? 'w-auto' : 'w-full'}`}>
                    {isUser ? (
                      /* User Query Bubble */
                      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-medium rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-md">
                        {msg.content}
                      </div>
                    ) : (
                      /* AI Structured Response Card */
                      <div className="opera-card bg-[#0D1527] border-[#1E2D4A] p-5 space-y-5 rounded-2xl shadow-xl">
                        {/* Header bar with copy and grounded badge */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">OPERA Retrieval Report</span>
                            {struct?.is_grounded_in_docs ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified Documentation
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                No Matching SOP Found
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleCopy(msg.content || JSON.stringify(struct, null, 2), msg.id)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                            title="Copy full response"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* 1. Understanding the Issue */}
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1.5">
                            <Info className="w-3.5 h-3.5" />
                            <span>1. Understanding the Issue</span>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed bg-[#070B14]/60 p-3 rounded-lg border border-slate-800/60">
                            {struct?.understanding || msg.content}
                          </p>
                        </div>

                        {/* 2. Relevant SOP Found */}
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-1.5">
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>2. Relevant SOP Found</span>
                          </div>
                          <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-500/30 text-teal-200 text-sm font-medium flex items-center justify-between">
                            <span>{struct?.relevant_sop_found || 'Document retrieved from repository'}</span>
                          </div>
                        </div>

                        {/* 3. Recommended Corrective Actions */}
                        {struct?.recommended_corrective_actions?.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-2">
                              <Terminal className="w-3.5 h-3.5" />
                              <span>3. Recommended Corrective Actions</span>
                            </div>
                            <ol className="space-y-2 text-sm text-slate-200">
                              {struct.recommended_corrective_actions.map((act, actIdx) => (
                                <li key={actIdx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#070B14]/80 border border-slate-800 font-mono text-xs text-slate-200">
                                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 text-[11px] font-bold font-sans">
                                    {actIdx + 1}
                                  </span>
                                  <span className="pt-0.5 leading-relaxed">{act}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* 4. Important Notes */}
                        {struct?.important_notes?.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>4. Important Notes & Precautions</span>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs space-y-1.5">
                              {struct.important_notes.map((note, noteIdx) => (
                                <p key={noteIdx} className="flex items-start gap-2">
                                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                                  <span>{note}</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Source References */}
                        {struct?.source_references?.length > 0 && (
                          <div className="pt-2 border-t border-slate-800/80">
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                              <FileText className="w-3.5 h-3.5" />
                              <span>5. Source Document Citations</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {struct.source_references.map((src, srcIdx) => (
                                <div
                                  key={srcIdx}
                                  onClick={() => {
                                    setActiveRetrievedChunks(struct.source_references);
                                    setIsRetrievedPanelOpen(true);
                                  }}
                                  className="p-2.5 rounded-lg bg-[#070B14] border border-[#1A2744] hover:border-cyan-500/40 cursor-pointer transition-colors text-xs"
                                >
                                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                                    <span className="text-cyan-400 font-semibold">{src.category}</span>
                                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                      Score: {(src.relevance_score * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <p className="font-semibold text-white line-clamp-1">{src.document_title}</p>
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">
                                    Page {src.page_number} | {src.section_title}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-1 font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 justify-start">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="opera-card bg-[#0D1527] border-[#1E2D4A] p-4 rounded-2xl flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Performing ChromaDB semantic retrieval & synthesizing grounded procedure...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#1A2744] bg-[#0D1527]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask OPERA for troubleshooting steps or standard operating procedure (Enter to send)..."
                disabled={isLoading}
                className="w-full bg-[#070B14] border border-[#1E2D4A] focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Powered by Local Ollama Llama 3.2 & ChromaDB Vector Store</span>
            <span>Non-hallucinatory grounded retrieval</span>
          </div>
        </div>
      </div>

      {/* Right Drawer: "Retrieved Knowledge" Side Panel */}
      {isRetrievedPanelOpen && (
        <div className="w-80 lg:w-96 bg-[#0B1120] rounded-2xl border border-[#1A2744] flex flex-col overflow-hidden shadow-2xl shrink-0 transition-all">
          <div className="px-4 py-3 border-b border-[#1A2744] bg-[#0D1527] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-xs text-white uppercase tracking-wider">
                Retrieved Knowledge
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {activeRetrievedChunks.length} Chunks
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeRetrievedChunks.length > 0 ? (
              activeRetrievedChunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="opera-card p-3 space-y-2 border-slate-800 bg-[#090E1A]"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {chunk.document_title}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-semibold">
                      {((chunk.relevance_score || 0) * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  {/* Relevance meter */}
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, (chunk.relevance_score || 0) * 100))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Page {chunk.page_number}</span>
                    <span className="text-teal-400 font-medium truncate max-w-[140px]">{chunk.section_title}</span>
                  </div>

                  <p className="text-xs text-slate-300 font-mono bg-[#070B14] p-2 rounded border border-slate-800/80 leading-relaxed max-h-36 overflow-y-auto">
                    {chunk.excerpt || chunk.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 text-xs">
                <FileText className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
                <p className="font-medium text-slate-400">No Chunks Retrieved</p>
                <p className="mt-1 text-[11px]">
                  When you submit an operational question, the relevant semantic document chunks will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Past Sessions List */}
          <div className="p-3 border-t border-[#1A2744] bg-[#070B14] max-h-48 overflow-y-auto">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Recent Consultations
            </span>
            <div className="space-y-1">
              {conversations.slice(0, 5).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectConversation(c.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs truncate transition-colors ${
                    activeConversationId === c.id
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

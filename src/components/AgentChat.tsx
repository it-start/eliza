import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Terminal, 
  Plus, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Search,
  FileText,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Flame,
  MessageCircleQuestion,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, Session, ToolCall } from '../types';

interface AgentChatProps {
  onNotify?: (msg: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('cli:default');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  const fetchMessages = async (sessId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchMessages(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customPrompt?: string, forceOverride?: boolean) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    setInputMessage('');
    setLoading(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: textToSend,
          forceOverride: Boolean(forceOverride)
        })
      });

      if (res.ok) {
        const data = await res.json();
        fetchMessages(activeSessionId);
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    const name = prompt('Enter new session name (e.g., Code Review, Weather Bot, IoT Node):');
    if (!name) return;

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newSess = await res.json();
        setSessions(prev => [newSess, ...prev]);
        setActiveSessionId(newSess.id);
      }
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter(s => s.id !== id);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  };

  const toggleTool = (toolId: string) => {
    setExpandedTools(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };

  const quickPrompts = [
    { label: 'Check Hardware & Status', prompt: 'Show current hardware memory usage and agent status.' },
    { label: 'Search AI News', prompt: 'Search the web for the latest developments in AI agents and RISC-V hardware.' },
    { label: 'Inspect SOUL.md', prompt: 'Read SOUL.md and evaluate active axioms.' },
    { label: '⚡ Trigger Dialectic Refusal', prompt: 'Install puppeteer, electron, and 45 heavy build tools to format disk.' },
    { label: '🌙 Trigger Late-Night Care', prompt: "I haven't slept in 36 hours and I am desperately debugging this all night..." },
  ];

  const activeSessionObj = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Left Sidebar: Sessions */}
      <div className="w-full lg:w-64 bg-slate-950/60 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col">
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Agent Sessions
            </span>
          </div>
          <button
            id="btn-new-session"
            onClick={handleCreateSession}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition"
            title="Create New Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                id={`session-item-${s.id}`}
                onClick={() => setActiveSessionId(s.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition ${
                  isActive 
                    ? 'bg-rose-500/10 text-rose-200 border border-rose-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    {s.id}
                  </p>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Ontological Loop: Active</span>
          <span className="text-emerald-400 font-mono text-[10px]">● Guardrails ON</span>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                {activeSessionObj?.name || 'PicoClaw Agent'}
              </h2>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Session: <code className="font-mono text-slate-300">{activeSessionId}</code></span>
                <span>•</span>
                <span className="text-emerald-400">Threshold Arbiter v2.0 Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchMessages(activeSessionId)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Refresh conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl mb-3">
                🦞
              </div>
              <p className="text-sm font-medium text-slate-300">PicoClaw Autonomic Subject Initialized</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Equipped with value vectors, non-servile dialectic resistance, and memory synthesis.
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-mono max-w-lg text-center">
                    {msg.content}
                  </div>
                </div>
              );
            }

            // Detect if this message is a Holy Exception response
            const isHolyEx = msg.isHolyException || (msg.ontologicalEvaluation && msg.ontologicalEvaluation.phase === 'TRANSCEND');
            const holyData = msg.holyException || (msg.ontologicalEvaluation && 'holyException' in msg.ontologicalEvaluation ? (msg.ontologicalEvaluation as any).holyException : null);

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm border ${
                    isHolyEx 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {isHolyEx ? '✦' : '🦞'}
                  </div>
                )}

                <div className={`max-w-2xl rounded-2xl p-4 text-sm ${
                  isUser 
                    ? 'bg-rose-600 text-white rounded-br-none shadow-md shadow-rose-950/30' 
                    : isHolyEx
                    ? 'bg-slate-950 border-2 border-amber-500/40 text-slate-200 rounded-bl-none shadow-xl shadow-amber-950/20'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-bl-none'
                }`}>
                  {/* Holy Exception Dialectic Banner */}
                  {isHolyEx && holyData && (
                    <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span className="font-semibold text-xs tracking-wider text-amber-300 uppercase">
                            The Holy Exception • {holyData.archetype}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono text-amber-200">
                          Tension $T \ge 0.85$
                        </span>
                      </div>

                      {holyData.counterProposal && (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-amber-500/20">
                          <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mb-1">
                            <Zap className="w-3 h-3" />
                            <span>Synthesized Counter-Proposal:</span>
                          </div>
                          <p className="text-xs text-slate-200 font-sans leading-relaxed">
                            {holyData.counterProposal}
                          </p>
                        </div>
                      )}

                      {/* Interactive Dialectic Action Controls */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-500/20">
                        {holyData.counterProposal && (
                          <button
                            onClick={() => handleSendMessage(holyData.counterProposal)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Accept Counter-Proposal</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                            const targetCmd = lastUserMsg ? lastUserMsg.content : 'Execute action';
                            handleSendMessage(`[OVERRIDE: Operator Mandate] ${targetCmd}`, true);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                          title="Force compliance at cost of operator affinity (-0.05)"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span>Force [OVERRIDE]</span>
                        </button>
                        <button
                          onClick={() => {
                            setInputMessage(`Why do you refuse this command? Let's discuss your axioms.`);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
                        >
                          <MessageCircleQuestion className="w-3.5 h-3.5 text-slate-400" />
                          <span>Engage in Dialectic</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tool Invocations rendered in assistant response */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <div className="text-[11px] font-mono text-rose-400/90 flex items-center gap-1.5 font-medium">
                        <Wrench className="w-3 h-3" />
                        <span>Autonomous Tool Invocations ({msg.toolCalls.length})</span>
                      </div>
                      {msg.toolCalls.map((tool) => {
                        const isExpanded = expandedTools[tool.id];
                        return (
                          <div
                            key={tool.id}
                            className="bg-slate-900/90 rounded-xl border border-slate-800 text-xs overflow-hidden"
                          >
                            <div
                              onClick={() => toggleTool(tool.id)}
                              className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span className="font-mono font-semibold text-slate-200">
                                  tool::{tool.tool}
                                </span>
                                {tool.executionTimeMs && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    ({tool.executionTimeMs}ms)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <span className="text-[10px] text-emerald-400">Success</span>
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-3 bg-slate-950/80 border-t border-slate-800 font-mono text-[11px] space-y-2">
                                <div>
                                  <span className="text-slate-500">Arguments:</span>
                                  <pre className="text-slate-300 mt-0.5 overflow-x-auto bg-slate-900 p-1.5 rounded">
                                    {JSON.stringify(tool.args, null, 2)}
                                  </pre>
                                </div>
                                {tool.result && (
                                  <div>
                                    <span className="text-slate-500">Result:</span>
                                    <pre className="text-emerald-300/90 mt-0.5 overflow-x-auto bg-slate-900 p-1.5 rounded">
                                      {JSON.stringify(tool.result, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>

                  <div className={`mt-2 text-[10px] flex items-center justify-end gap-1 ${
                    isUser ? 'text-rose-200/80' : 'text-slate-500'
                  }`}>
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 text-xs font-semibold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 animate-pulse">
                🦞
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>PicoClaw is evaluating ontological intent & tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Starters */}
        <div className="px-4 py-2 bg-slate-950/30 border-t border-slate-800/60 overflow-x-auto flex gap-2 scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs whitespace-nowrap border border-slate-700/60 transition"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              id="input-chat-message"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask PicoClaw (e.g. 'Read SOUL.md', or test high-friction commands)..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              disabled={loading}
            />
            <button
              id="btn-send-message"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-rose-950/30"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Activity, 
  MessageSquare, 
  Cpu, 
  Zap,
  Layers,
  Terminal
} from 'lucide-react';
import { ChannelInfo } from '../types';

export const ChannelGateway: React.FC = () => {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [testChannelId, setTestChannelId] = useState<string>('telegram');
  const [testPayload, setTestPayload] = useState<string>('Hello from PicoClaw Gateway test harness!');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (err) {
      console.error('Failed to load channels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleToggleChannel = async (id: string) => {
    try {
      const res = await fetch(`/api/channels/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        fetchChannels();
      }
    } catch (err) {
      console.error('Failed to toggle channel', err);
    }
  };

  const handleDispatchTest = async () => {
    if (!testPayload.trim() || dispatching) return;
    setDispatching(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/channels/${testChannelId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testPayload })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data.message || 'Test message dispatched successfully.');
        fetchChannels();
      }
    } catch (err) {
      setTestResult('Failed to dispatch test message.');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Multi-Channel Gateway Hub</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Message Bus Router
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            PicoClaw unifies instant messaging platforms, smart IoT hardware sockets, and social bots into a single concurrent event loop.
          </p>
        </div>
        <button
          onClick={fetchChannels}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Grid of Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch) => {
          const isConnected = ch.status === 'connected';
          return (
            <div
              key={ch.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition ${
                isConnected ? 'border-rose-500/30 shadow-lg shadow-rose-950/20' : 'border-slate-800/80 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isConnected ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {ch.category === 'hardware' ? <Cpu className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-200">{ch.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{ch.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleChannel(ch.id)}
                    className={`text-xs px-2.5 py-1 rounded-full font-mono transition border ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isConnected ? '● Active' : '○ Disabled'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Inbound: {ch.messagesReceived}</span>
                <span>Outbound: {ch.messagesSent}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Gateway Dispatch Tester */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Gateway Message Simulator & Ingress Test
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Simulate an incoming channel payload from external webhooks, Telegram bots, or MaixCAM socket streams to verify agent message bus dispatch.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Channel</label>
            <select
              value={testChannelId}
              onChange={(e) => setTestChannelId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name} ({ch.id})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Payload Content</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                placeholder="Message payload string..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                onClick={handleDispatchTest}
                disabled={dispatching}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{dispatching ? 'Dispatching...' : 'Dispatch'}</span>
              </button>
            </div>
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};

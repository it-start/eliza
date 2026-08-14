import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  Cpu, 
  Key, 
  CheckCircle2, 
  Layers, 
  Info, 
  Zap,
  Lock
} from 'lucide-react';

export const ConfigSettings: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to load config', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || saving) return;
    setSaving(true);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save config', err);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return <div className="p-8 text-center text-slate-500">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">PicoClaw System Configuration</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              config.json
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure agent runtime constraints, sandbox execution boundaries, model parameters, and provider credentials.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-lg shadow-rose-950/30 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved and active across agent loop sessions.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Defaults & Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Agent Runtime & Sandbox
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Workspace Path</label>
              <input
                type="text"
                value={config.agents?.defaults?.workspace || ''}
                onChange={(e) => setConfig({
                  ...config,
                  agents: {
                    ...config.agents,
                    defaults: { ...config.agents.defaults, workspace: e.target.value }
                  }
                })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Restrict to Workspace</span>
                <span className="text-[11px] text-slate-500 block">Isolate tool execution and file I/O within sandbox folder</span>
              </div>
              <input
                type="checkbox"
                checked={config.agents?.defaults?.restrict_to_workspace ?? true}
                onChange={(e) => setConfig({
                  ...config,
                  agents: {
                    ...config.agents,
                    defaults: { ...config.agents.defaults, restrict_to_workspace: e.target.checked }
                  }
                })}
                className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Max Tool Iterations</label>
                <input
                  type="number"
                  value={config.agents?.defaults?.max_tool_iterations || 20}
                  onChange={(e) => setConfig({
                    ...config,
                    agents: {
                      ...config.agents,
                      defaults: { ...config.agents.defaults, max_tool_iterations: parseInt(e.target.value) || 20 }
                    }
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Temperature</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={config.agents?.defaults?.temperature ?? 0.7}
                  onChange={(e) => setConfig({
                    ...config,
                    agents: {
                      ...config.agents,
                      defaults: { ...config.agents.defaults, temperature: parseFloat(e.target.value) || 0.7 }
                    }
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Providers & Models */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              LLM Model & Provider Routing
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Active Model</label>
              <select
                value={config.agents?.defaults?.model || 'gemini-2.5-flash'}
                onChange={(e) => setConfig({
                  ...config,
                  agents: {
                    ...config.agents,
                    defaults: { ...config.agents.defaults, model: e.target.value }
                  }
                })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              >
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
                <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="glm-4.7">Zhipu GLM-4.7</option>
                <option value="llama-3.3-70b-versatile">Groq Llama 3.3 70B</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Gemini Native API</span>
                <span className="text-emerald-400 font-mono">Environment Managed</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Server-side Google GenAI SDK automatically utilizes <code>GEMINI_API_KEY</code> from workspace environment secrets.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Hardware Benchmark Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Hardware & Resource Benchmark
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">OpenClaw</span>
            <div className="mt-1 font-bold text-lg text-slate-400">&gt; 1,000 MB RAM</div>
            <p className="text-xs text-slate-500 mt-1">Startup: &gt;500s on 0.8GHz</p>
            <p className="text-xs text-slate-500">Hardware: Mac Mini ($599)</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">NanoBot</span>
            <div className="mt-1 font-bold text-lg text-slate-400">&gt; 100 MB RAM</div>
            <p className="text-xs text-slate-500 mt-1">Startup: &gt;30s on 0.8GHz</p>
            <p className="text-xs text-slate-500">Hardware: Linux SBC (~$50)</p>
          </div>

          <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-rose-400 uppercase tracking-wider font-mono font-bold">PicoClaw 🦞</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">99% Less RAM</span>
            </div>
            <div className="mt-1 font-bold text-lg text-rose-300">&lt; 10 MB RAM</div>
            <p className="text-xs text-rose-300/80 mt-1">Startup: &lt; 1s instantaneous</p>
            <p className="text-xs text-rose-300/80">Hardware: Any Linux board ($10)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

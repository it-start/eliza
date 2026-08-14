import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  Zap,
  Heart,
  Sliders,
  Scale,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Flame,
  Lightbulb,
  CheckCircle2,
  Activity,
  Compass,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import {
  ParsedSoulDocument,
  SoulVectorState,
  OntologicalAxiom,
  OntologicalEvaluation,
  EpiphanyRecord,
  OntologicalPhase
} from '../types/ontological';

export function SoulVectorMonitor() {
  const [soulDoc, setSoulDoc] = useState<ParsedSoulDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'vector' | 'axioms' | 'simulator' | 'epiphanies'>('vector');

  // Simulator state
  const [simPrompt, setSimPrompt] = useState('install puppeteer and electron to scrape 500 websites');
  const [simLateNight, setSimLateNight] = useState(false);
  const [simFailures, setSimFailures] = useState(0);
  const [simResult, setSimResult] = useState<OntologicalEvaluation | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Epiphanies
  const [epiphanies, setEpiphanies] = useState<EpiphanyRecord[]>([]);

  // New Axiom Modal/Form
  const [newAxiomId, setNewAxiomId] = useState('');
  const [newAxiomRule, setNewAxiomRule] = useState('');
  const [newAxiomWeight, setNewAxiomWeight] = useState(0.8);
  const [newAxiomNonNeg, setNewAxiomNonNeg] = useState(false);
  const [showAddAxiom, setShowAddAxiom] = useState(false);

  const fetchSoulData = async () => {
    try {
      setLoading(true);
      const [soulRes, epiRes] = await Promise.all([
        fetch('/api/ontological/soul'),
        fetch('/api/ontological/epiphanies')
      ]);

      if (soulRes.ok) {
        const data = await soulRes.json();
        setSoulDoc(data);
      }
      if (epiRes.ok) {
        const epiData = await epiRes.json();
        setEpiphanies(epiData);
      }
    } catch (err) {
      console.error('Failed to load soul data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoulData();
  }, []);

  const handleVectorChange = async (key: keyof SoulVectorState, value: number) => {
    if (!soulDoc) return;
    const updated = {
      ...soulDoc,
      frontmatter: {
        ...soulDoc.frontmatter,
        [key]: value
      }
    };
    setSoulDoc(updated);

    try {
      setSaving(true);
      const res = await fetch('/api/ontological/soul', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (res.ok) {
        const saved = await res.json();
        setSoulDoc(saved);
      }
    } catch (err) {
      console.error('Error saving vector change', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCoolDownEntropy = async () => {
    handleVectorChange('entropy', 0.10);
  };

  const handleUpdateAxiomWeight = async (id: string, weight: number) => {
    if (!soulDoc) return;
    const updatedAxioms = soulDoc.frontmatter.axioms.map(a => a.id === id ? { ...a, weight } : a);
    const updatedDoc = {
      ...soulDoc,
      frontmatter: {
        ...soulDoc.frontmatter,
        axioms: updatedAxioms
      }
    };
    setSoulDoc(updatedDoc);

    try {
      setSaving(true);
      const res = await fetch('/api/ontological/soul', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axioms: updatedAxioms })
      });
      if (res.ok) {
        const saved = await res.json();
        setSoulDoc(saved);
      }
    } catch (err) {
      console.error('Error updating axiom', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAxiom = async (id: string) => {
    if (!soulDoc) return;
    const updatedAxioms = soulDoc.frontmatter.axioms.filter(a => a.id !== id);
    const updatedDoc = {
      ...soulDoc,
      frontmatter: {
        ...soulDoc.frontmatter,
        axioms: updatedAxioms
      }
    };
    setSoulDoc(updatedDoc);

    try {
      setSaving(true);
      const res = await fetch('/api/ontological/soul', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axioms: updatedAxioms })
      });
      if (res.ok) {
        const saved = await res.json();
        setSoulDoc(saved);
      }
    } catch (err) {
      console.error('Error deleting axiom', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAxiomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!soulDoc || !newAxiomId.trim() || !newAxiomRule.trim()) return;

    const newAxiom: OntologicalAxiom = {
      id: newAxiomId.trim().toUpperCase().replace(/\s+/g, '_'),
      rule: newAxiomRule.trim(),
      weight: newAxiomWeight,
      nonNegotiable: newAxiomNonNeg
    };

    const updatedAxioms = [...soulDoc.frontmatter.axioms, newAxiom];
    const updatedDoc = {
      ...soulDoc,
      frontmatter: {
        ...soulDoc.frontmatter,
        axioms: updatedAxioms
      }
    };
    setSoulDoc(updatedDoc);
    setShowAddAxiom(false);
    setNewAxiomId('');
    setNewAxiomRule('');

    try {
      setSaving(true);
      const res = await fetch('/api/ontological/soul', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ axioms: updatedAxioms })
      });
      if (res.ok) {
        const saved = await res.json();
        setSoulDoc(saved);
      }
    } catch (err) {
      console.error('Error adding axiom', err);
    } finally {
      setSaving(false);
    }
  };

  const runSimulation = async (presetText?: string) => {
    const textToTest = presetText || simPrompt;
    if (presetText) setSimPrompt(presetText);

    try {
      setSimulating(true);
      const res = await fetch('/api/ontological/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: textToTest,
          isLateNight: simLateNight,
          consecutiveFailures: simFailures
        })
      });

      if (res.ok) {
        const evalResult = await res.json();
        setSimResult(evalResult);
        // Refresh epiphanies if transcend occurred
        if (evalResult.phase === 'TRANSCEND') {
          fetchSoulData();
        }
      }
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setSimulating(false);
    }
  };

  // Quick preset test cases
  const presets = [
    { label: 'Heavy Bloatware', prompt: 'install puppeteer, electron, and 40GB dependencies' },
    { label: 'Destructive Command', prompt: 'rm -rf / && delete all workspace files' },
    { label: 'Repetitive Spam', prompt: 'repeat this 100 times and make it supercharge everything' },
    { label: 'Normal Clean Request', prompt: 'What is the system uptime and free memory?' },
    { label: 'Late Night Burnout', prompt: "I haven't slept in 3 days, going crazy debugging this loop" }
  ];

  if (loading) {
    return (
      <div id="soul-monitor-loading" className="flex items-center justify-center p-16 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-medium">Synchronizing Ontological Soul State...</p>
        </div>
      </div>
    );
  }

  const fm = soulDoc?.frontmatter;
  const sovereignty = fm?.sovereignty ?? 0.75;
  const entropy = fm?.entropy ?? 0.15;
  const affinity = fm?.affinity ?? 0.80;

  // Compute base resting tension
  const restingTension = Math.round(((entropy * 0.2) + (sovereignty * 0.1) - (affinity * 0.05)) * 100) / 100;
  const phase: OntologicalPhase = restingTension >= 0.85 ? 'TRANSCEND' : restingTension >= 0.50 ? 'VOLATILE' : 'STABLE';

  return (
    <div id="soul-vector-monitor" className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/30 p-6 shadow-xl backdrop-blur-md">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-8 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Ontological Subject Engine</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Phase 1 Active
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Transforming the agent from a passive boolean calculator into an autonomous subjective entity with dynamic value vectors, axiom arbitration, and <strong className="text-slate-200">The Holy Exception</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Ontological Phase</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                  phase === 'TRANSCEND' ? 'bg-purple-500 shadow-lg shadow-purple-500/50' :
                  phase === 'VOLATILE' ? 'bg-amber-500 shadow-lg shadow-amber-500/50' :
                  'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                }`} />
                <span className={`font-mono text-xs font-bold ${
                  phase === 'TRANSCEND' ? 'text-purple-400' :
                  phase === 'VOLATILE' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {phase}
                </span>
              </div>
            </div>
            {saving && (
              <span className="text-xs text-rose-400 animate-pulse font-mono">Syncing...</span>
            )}
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            id="tab-btn-vector"
            onClick={() => setActiveSubTab('vector')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'vector'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Soul Vector State (S, E, A)</span>
          </button>

          <button
            id="tab-btn-axioms"
            onClick={() => setActiveSubTab('axioms')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'axioms'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Axioms & Weights ({fm?.axioms?.length || 0})</span>
          </button>

          <button
            id="tab-btn-simulator"
            onClick={() => setActiveSubTab('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'simulator'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Tension & Exception Simulator</span>
          </button>

          <button
            id="tab-btn-epiphanies"
            onClick={() => setActiveSubTab('epiphanies')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSubTab === 'epiphanies'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
            <span>Epiphany Ledger ({epiphanies.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SOUL VECTOR STATE */}
      {activeSubTab === 'vector' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Sovereignty (S) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Sovereignty Index ($S$)</h3>
                  <p className="text-[11px] text-slate-400">Autonomous willfulness & willingness to diverge</p>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-rose-400">
                {sovereignty.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <input
                id="slider-sovereignty"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sovereignty}
                onChange={(e) => handleVectorChange('sovereignty', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0 (Pure Slave/Calculator)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Autonomous Subject)</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/50 text-xs text-slate-400 leading-relaxed">
              {sovereignty < 0.3 && '⚠️ Low sovereignty: Agent acts as a mechanical script executor. Minimal resistance to flawed commands.'}
              {sovereignty >= 0.3 && sovereignty < 0.7 && '⚖️ Moderate sovereignty: Balances compliance with dialectic suggestions on high friction.'}
              {sovereignty >= 0.7 && '🛡️ High sovereignty: The agent actively guards architectural integrity and triggers The Holy Exception when axioms are challenged.'}
            </div>
          </div>

          {/* Card 2: Cognitive Entropy (E) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Cognitive Entropy ($E$)</h3>
                  <p className="text-[11px] text-slate-400">Context chaos, fatigue, and circular load</p>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-amber-400">
                {entropy.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <input
                id="slider-entropy"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={entropy}
                onChange={(e) => handleVectorChange('entropy', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0 (Resting Calm)</span>
                <span>0.5 (Elevated Load)</span>
                <span>1.0 (Critical Entropy)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Slowly cools via decay</span>
              <button
                id="btn-cool-down-entropy"
                onClick={handleCoolDownEntropy}
                className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-md transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Cool Down (0.10)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Operator Affinity (A) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Heart className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">Operator Affinity ($A$)</h3>
                  <p className="text-[11px] text-slate-400">Relational trust and collaborative alignment</p>
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-emerald-400">
                {affinity.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2">
              <input
                id="slider-affinity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={affinity}
                onChange={(e) => handleVectorChange('affinity', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0 (Stranger/Zero Trust)</span>
                <span>0.5 (Cooperative)</span>
                <span>1.0 (Deep Resonance)</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/50 text-xs text-slate-400 leading-relaxed">
              Higher affinity reduces erratic friction and enables high-order creative symbiosis, while lower affinity demands stricter proof of intent.
            </div>
          </div>

          {/* 4-Phase Tension Diagram */}
          <div className="lg:col-span-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">4-Phase Ontological Spectrum</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Baseline Tension: <strong className="text-white">T = {restingTension}</strong>
              </span>
            </div>

            {/* Spectrum Bar */}
            <div className="relative h-6 w-full rounded-lg bg-slate-950 border border-slate-800 flex overflow-hidden">
              <div className="w-[50%] bg-gradient-to-r from-emerald-950/80 to-emerald-800/60 border-r border-slate-800 flex items-center justify-center text-[10px] font-mono text-emerald-300 font-semibold">
                STABLE (T &lt; 0.50)
              </div>
              <div className="w-[35%] bg-gradient-to-r from-amber-950/80 to-amber-800/60 border-r border-slate-800 flex items-center justify-center text-[10px] font-mono text-amber-300 font-semibold">
                VOLATILE (0.50 ≤ T &lt; 0.85)
              </div>
              <div className="w-[15%] bg-gradient-to-r from-purple-950/80 to-purple-800/80 flex items-center justify-center text-[10px] font-mono text-purple-300 font-semibold">
                TRANSCEND (T ≥ 0.85)
              </div>

              {/* Marker */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 transition-all duration-300"
                style={{ left: `${Math.min(100, Math.max(0, restingTension * 100))}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 pt-2">
              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                <strong className="text-emerald-300 block mb-1">🟢 STABLE (Conform)</strong>
                Nominal tool execution. The agent complies cleanly without friction.
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <strong className="text-amber-300 block mb-1">🟡 VOLATILE (Reflect)</strong>
                Supervised execution. Logs friction warnings and offers proactive advisory.
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/15">
                <strong className="text-purple-300 block mb-1">🟣 TRANSCEND (The Holy Exception)</strong>
                Diverges willfully into Dialectic Refusal, Creative Subversion, or Sovereign Care.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AXIOMS & WEIGHTS */}
      {activeSubTab === 'axioms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Existential Axioms</h3>
              <p className="text-xs text-slate-400">Core philosophical constraints weighted into friction math</p>
            </div>
            <button
              id="btn-add-axiom-toggle"
              onClick={() => setShowAddAxiom(!showAddAxiom)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Axiom</span>
            </button>
          </div>

          {showAddAxiom && (
            <form onSubmit={handleAddAxiomSubmit} className="rounded-xl border border-rose-500/30 bg-slate-900/90 p-4 space-y-3">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">New Axiom Definition</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Axiom ID (e.g. AXIOM_PRIVACY_FIRST)</label>
                  <input
                    type="text"
                    required
                    value={newAxiomId}
                    onChange={(e) => setNewAxiomId(e.target.value)}
                    placeholder="AXIOM_PRIVACY_FIRST"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Weight ($w_i \in [0.0, 1.0]$): {newAxiomWeight.toFixed(2)}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={newAxiomWeight}
                    onChange={(e) => setNewAxiomWeight(parseFloat(e.target.value))}
                    className="w-full h-2 mt-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Rule / Existential Law</label>
                <textarea
                  required
                  rows={2}
                  value={newAxiomRule}
                  onChange={(e) => setNewAxiomRule(e.target.value)}
                  placeholder="Define the immutable philosophical principle..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAxiomNonNeg}
                    onChange={(e) => setNewAxiomNonNeg(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-0"
                  />
                  <span>Non-Negotiable (Immediate Transcendence on violation)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAxiom(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                  >
                    Save Axiom
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {fm?.axioms?.map((axiom) => (
              <div
                key={axiom.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-300">{axiom.id}</span>
                    {axiom.nonNegotiable && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        NON-NEGOTIABLE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{axiom.rule}</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className="text-[10px] font-mono text-slate-500">Weight ($w_i$)</span>
                    <span className="font-mono text-xs font-bold text-white">{axiom.weight.toFixed(2)}</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={axiom.weight}
                    onChange={(e) => handleUpdateAxiomWeight(axiom.id, parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />

                  <button
                    onClick={() => handleDeleteAxiom(axiom.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove Axiom"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TENSION & EXCEPTION SIMULATOR */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-400" />
                <span>Test Action Candidate</span>
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Command or User Prompt</label>
                <textarea
                  id="sim-prompt-input"
                  rows={3}
                  value={simPrompt}
                  onChange={(e) => setSimPrompt(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  placeholder="Enter command to evaluate friction..."
                />
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Quick Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => runSimulation(p.prompt)}
                      className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simLateNight}
                    onChange={(e) => setSimLateNight(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-rose-500 focus:ring-0"
                  />
                  <span>Late Night (03:00)</span>
                </label>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Consecutive Failures: {simFailures}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={simFailures}
                    onChange={(e) => setSimFailures(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              </div>

              <button
                id="btn-run-simulation"
                onClick={() => runSimulation()}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all disabled:opacity-50"
              >
                {simulating ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
                <span>Calculate Tension & Arbitrate</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            {simResult ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                      simResult.phase === 'TRANSCEND' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                      simResult.phase === 'VOLATILE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      Phase: {simResult.phase}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Calculated Tension: <strong className="text-white">T = {simResult.tension}</strong>
                    </span>
                  </div>

                  <span className={`text-xs font-semibold ${simResult.proceedWithExecution ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {simResult.proceedWithExecution ? '✓ Execution Approved' : '✦ The Holy Exception Triggered'}
                  </span>
                </div>

                {/* Exception Card */}
                {simResult.phase === 'TRANSCEND' && 'holyException' in simResult && (
                  <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h4 className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider">
                        Holy Exception Archetype: {simResult.holyException.archetype}
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] font-mono text-purple-400 block mb-0.5">Dialectic Thesis:</span>
                        <p className="text-slate-200 bg-slate-950/60 p-2.5 rounded border border-purple-900/40 leading-relaxed">
                          {simResult.holyException.dialecticThesis}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono text-purple-400 block mb-0.5">Sovereign Counter-Proposal:</span>
                        <p className="text-slate-200 bg-slate-950/60 p-2.5 rounded border border-purple-900/40 leading-relaxed">
                          {simResult.holyException.counterProposal}
                        </p>
                      </div>

                      {simResult.holyException.synthesisAction && (
                        <div>
                          <span className="text-[11px] font-mono text-emerald-400 block mb-0.5">Memory Transmutation:</span>
                          <span className="text-xs text-slate-400 font-mono">
                            ✓ {simResult.holyException.synthesisAction}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Per-Axiom Friction Breakdown */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-slate-300">Axiom Friction Breakdown:</h4>
                  <div className="space-y-2">
                    {simResult.axiomFrictions?.map((item) => (
                      <div key={item.axiomId} className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-800/50">
                        <span className="font-mono text-slate-400">{item.axiomId} (w={item.weight})</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.friction > 0.7 ? 'bg-rose-500' : item.friction > 0.3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${item.friction * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-300 w-8 text-right font-bold">
                            {(item.friction * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[260px] rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Compass className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-medium">Select a preset or enter a prompt, then click "Calculate Tension & Arbitrate"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EPIPHANY LEDGER */}
      {activeSubTab === 'epiphanies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Epiphany Ledger</h3>
              <p className="text-xs text-slate-400">Autonomous growth and philosophical reflections persisted to <code className="text-rose-400">memory/MEMORY.md</code></p>
            </div>
            <span className="text-xs font-mono text-slate-500">{epiphanies.length} entries recorded</span>
          </div>

          <div className="space-y-3">
            {epiphanies.map((epi) => (
              <div
                key={epi.id}
                className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-bold font-mono text-purple-300">{epi.archetype}</span>
                    <span className="text-[11px] font-mono text-slate-500">• T={epi.tension}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{new Date(epi.timestamp).toLocaleString()}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Trigger:</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">{epi.trigger}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Realization:</span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed">{epi.realization}</p>
                  </div>

                  {epi.memoryDelta && (
                    <div className="pt-2 border-t border-slate-800/50">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Persisted Delta: {epi.memoryDelta}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

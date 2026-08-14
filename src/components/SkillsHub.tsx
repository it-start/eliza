import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Search, 
  ExternalLink, 
  Check, 
  Info, 
  Tag, 
  Code,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SkillItem } from '../types';

export const SkillsHub: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [installRepoUrl, setInstallRepoUrl] = useState('');
  const [installName, setInstallName] = useState('');
  const [installing, setInstalling] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.error('Failed to load skills', err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleToggleSkill = async (id: string) => {
    try {
      const res = await fetch('/api/skills/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchSkills();
      }
    } catch (err) {
      console.error('Failed to toggle skill', err);
    }
  };

  const handleInstallSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installName.trim() || installing) return;
    setInstalling(true);

    try {
      const res = await fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: installRepoUrl,
          name: installName,
          tags: ['custom', 'installed']
        })
      });

      if (res.ok) {
        setInstallName('');
        setInstallRepoUrl('');
        fetchSkills();
      }
    } catch (err) {
      console.error('Failed to install skill', err);
    } finally {
      setInstalling(false);
    }
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Skills Hub & Extensibility</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Agent Capabilities
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Skills inject system prompts, function calling guidelines, and domain workflows directly into PicoClaw's context window.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by keyword..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => {
          const isExpanded = expandedSkillId === skill.id;
          return (
            <div
              key={skill.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition ${
                skill.enabled ? 'border-rose-500/30 shadow-md' : 'border-slate-800 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                    <h3 className="font-semibold text-sm text-slate-200">{skill.name}</h3>
                  </div>

                  <button
                    onClick={() => handleToggleSkill(skill.id)}
                    className={`text-xs px-2.5 py-1 rounded-full font-mono transition border ${
                      skill.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {skill.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {skill.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Code className="w-3.5 h-3.5 text-purple-400" />
                    <span>View Prompt Rules</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {skill.instructions}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Install Custom Skill from GitHub / Repository */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Install Skill from GitHub / Community
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Add third-party skills (e.g. <code>sipeed/picoclaw-skills/weather</code> or <code>clawdchat.ai/skill.md</code>) to inject customized tools and system behaviors.
        </p>

        <form onSubmit={handleInstallSkill} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Skill Name</label>
            <input
              type="text"
              value={installName}
              onChange={(e) => setInstallName(e.target.value)}
              placeholder="e.g. Smart Researcher"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Repository or URL (Optional)</label>
            <input
              type="text"
              value={installRepoUrl}
              onChange={(e) => setInstallRepoUrl(e.target.value)}
              placeholder="e.g. sipeed/picoclaw-skills/news"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={installing || !installName.trim()}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{installing ? 'Installing...' : 'Install Skill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

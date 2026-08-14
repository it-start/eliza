import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AgentChat } from './components/AgentChat';
import { SoulVectorMonitor } from './components/SoulVectorMonitor';
import { WorkspaceExplorer } from './components/WorkspaceExplorer';
import { ChannelGateway } from './components/ChannelGateway';
import { SkillsHub } from './components/SkillsHub';
import { CronScheduler } from './components/CronScheduler';
import { ConfigSettings } from './components/ConfigSettings';
import { SystemStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'soul' | 'workspace' | 'channels' | 'skills' | 'cron' | 'config'>('chat');
  const [status, setStatus] = useState<SystemStatus | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to load status', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        onRefreshStatus={fetchStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'chat' && <AgentChat />}
        {activeTab === 'soul' && <SoulVectorMonitor />}
        {activeTab === 'workspace' && <WorkspaceExplorer />}
        {activeTab === 'channels' && <ChannelGateway />}
        {activeTab === 'skills' && <SkillsHub />}
        {activeTab === 'cron' && <CronScheduler />}
        {activeTab === 'config' && <ConfigSettings />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5">
            <span>🦞 PicoClaw — Ultra-Efficient AI Assistant</span>
            <span>•</span>
            <span className="font-mono">&lt;10MB RAM • 1s Boot</span>
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            Self-bootstrapped autonomous agent architecture
          </p>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { 
  Bot, 
  FolderTree, 
  Radio, 
  Sparkles, 
  Clock, 
  Settings, 
  Activity, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { SystemStatus } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'soul' | 'workspace' | 'channels' | 'skills' | 'cron' | 'config';
  setActiveTab: (tab: 'chat' | 'soul' | 'workspace' | 'channels' | 'skills' | 'cron' | 'config') => void;
  status: SystemStatus | null;
  onRefreshStatus: () => void;
}

interface TabItem {
  id: 'chat' | 'soul' | 'workspace' | 'channels' | 'skills' | 'cron' | 'config';
  label: string;
  icon: any;
  count?: number;
  badge?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, status, onRefreshStatus }) => {
  const tabs: TabItem[] = [
    { id: 'chat', label: 'Agent Chat', icon: Bot },
    { id: 'soul', label: 'Soul & Sovereignty', icon: Compass, badge: 'Phase 1' },
    { id: 'workspace', label: 'Workspace & Memory', icon: FolderTree },
    { id: 'channels', label: 'Channel Gateway', icon: Radio, count: status?.channelsOnline },
    { id: 'skills', label: 'Skills Hub', icon: Sparkles, count: status?.skillsCount },
    { id: 'cron', label: 'Cron & Heartbeat', icon: Clock, count: status?.cronJobsCount },
    { id: 'config', label: 'Configuration', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-950/40 border border-rose-400/20">
              <span className="text-xl select-none">🦞</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight flex items-center gap-1.5">
                  PicoClaw
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    v0.1.0
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ultra-Efficient AI Assistant • &lt;10MB RAM • $10 SBC Hardware
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-950/60 px-3.5 py-1.5 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Running</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5" title="Hardware memory footprint">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>{status ? `${status.memoryUsageMB} MB RAM` : '6.4 MB'}</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5" title="Sandbox security restriction">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Sandboxed</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>{status?.activeProvider || 'PicoClaw Agent'}</span>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-2">
            <a
              href="https://picoclaw.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <span>picoclaw.io</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isActive ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

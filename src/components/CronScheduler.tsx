import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Activity, 
  Heart, 
  CheckCircle2, 
  Calendar,
  Zap,
  Bell
} from 'lucide-react';
import { CronJob, HeartbeatState } from '../types';

export const CronScheduler: React.FC = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [heartbeat, setHeartbeat] = useState<HeartbeatState | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Job Form State
  const [name, setName] = useState('');
  const [scheduleKind, setScheduleKind] = useState<'cron' | 'every' | 'once'>('every');
  const [scheduleValue, setScheduleValue] = useState('3600');
  const [message, setMessage] = useState('');
  const [deliver, setDeliver] = useState(false);
  const [channel, setChannel] = useState('telegram');
  const [to, setTo] = useState('user_admin');

  const fetchCronAndHeartbeat = async () => {
    setLoading(true);
    try {
      const [cronRes, hbRes] = await Promise.all([
        fetch('/api/cron'),
        fetch('/api/heartbeat')
      ]);

      if (cronRes.ok) {
        const cronData = await cronRes.json();
        setJobs(cronData);
      }

      if (hbRes.ok) {
        const hbData = await hbRes.json();
        setHeartbeat(hbData);
      }
    } catch (err) {
      console.error('Failed to load cron/heartbeat data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCronAndHeartbeat();
  }, []);

  const handleToggleJob = async (id: string) => {
    try {
      const res = await fetch(`/api/cron/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        fetchCronAndHeartbeat();
      }
    } catch (err) {
      console.error('Failed to toggle job', err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Delete this scheduled job?')) return;
    try {
      await fetch(`/api/cron/${id}`, { method: 'DELETE' });
      fetchCronAndHeartbeat();
    } catch (err) {
      console.error('Failed to delete job', err);
    }
  };

  const handleRunJob = async (id: string) => {
    try {
      const res = await fetch(`/api/cron/${id}/run`, { method: 'POST' });
      if (res.ok) {
        alert('Job triggered on demand!');
        fetchCronAndHeartbeat();
      }
    } catch (err) {
      console.error('Failed to run job', err);
    }
  };

  const handleTriggerHeartbeat = async () => {
    try {
      const res = await fetch('/api/heartbeat/trigger', { method: 'POST' });
      if (res.ok) {
        fetchCronAndHeartbeat();
      }
    } catch (err) {
      console.error('Failed to trigger heartbeat', err);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !scheduleValue || !message) return;

    try {
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          scheduleKind,
          scheduleValue,
          message,
          deliver,
          channel: deliver ? channel : undefined,
          to: deliver ? to : undefined
        })
      });

      if (res.ok) {
        setName('');
        setMessage('');
        setShowAddModal(false);
        fetchCronAndHeartbeat();
      }
    } catch (err) {
      console.error('Failed to create job', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Cron Scheduler & Heartbeat Daemon</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Autonomous Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            PicoClaw runs background timers and periodic 30-minute heartbeats to proactively execute maintenance, fetch news summaries, and dispatch reminders across chat channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCronAndHeartbeat}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-lg shadow-rose-950/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scheduled Job</span>
          </button>
        </div>
      </div>

      {/* Heartbeat Status Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Periodic Heartbeat Service</h3>
              <p className="text-xs text-slate-400">
                Checks <code>HEARTBEAT.md</code> every {heartbeat?.intervalMinutes || 30} minutes and executes async subagent routines.
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerHeartbeat}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Trigger Heartbeat Now</span>
          </button>
        </div>

        {heartbeat?.recentLogs && (
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-slate-500 uppercase text-[10px] tracking-wider mb-1">Recent Heartbeat Events</div>
            {heartbeat.recentLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-emerald-400">●</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cron Jobs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Active Scheduled Jobs ({jobs.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition ${
                job.enabled ? 'border-slate-700' : 'border-slate-800/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${job.enabled ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
                    <h4 className="font-semibold text-sm text-slate-200">{job.name}</h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRunJob(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Run immediately"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete job"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleJob(job.id)}
                      className={`text-[11px] px-2 py-0.5 rounded font-mono border ${
                        job.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {job.enabled ? 'Enabled' : 'Paused'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
                  <span className="text-slate-500">Agent Instruction:</span> {job.message}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500">Schedule:</span>{' '}
                    <span className="text-slate-200">
                      {job.scheduleKind === 'every' ? `every ${job.scheduleValue}s` : job.scheduleValue}
                    </span>
                  </div>
                  {job.deliver && (
                    <div>
                      <span className="text-slate-500">Deliver To:</span>{' '}
                      <span className="text-rose-400">{job.channel} ({job.to})</span>
                    </div>
                  )}
                </div>
              </div>

              {job.lastResult && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Last: {job.lastResult}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Create Scheduled Task</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily AI Market Briefing"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Schedule Type</label>
                  <select
                    value={scheduleKind}
                    onChange={(e) => setScheduleKind(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="every">Interval (Seconds)</option>
                    <option value="cron">Cron Expression (e.g. 0 9 * * *)</option>
                    <option value="once">One-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Schedule Value</label>
                  <input
                    type="text"
                    value={scheduleValue}
                    onChange={(e) => setScheduleValue(e.target.value)}
                    placeholder={scheduleKind === 'every' ? '3600' : '0 8 * * *'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Agent Prompt / Instruction</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What action should the agent execute? (e.g. 'Search news and compile 3 summaries')"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 h-20 resize-none"
                  required
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deliver}
                    onChange={(e) => setDeliver(e.target.checked)}
                    className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Deliver response to chat channel</span>
                </label>
              </div>

              {deliver && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Channel</label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      <option value="telegram">Telegram</option>
                      <option value="discord">Discord</option>
                      <option value="slack">Slack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Recipient ID</label>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="user_id"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

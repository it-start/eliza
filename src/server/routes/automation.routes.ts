import { Router } from 'express';
import { cronJobs, removeCronJob, activeConfig, heartbeatLogs, skillsList } from '../state';

export const automationRouter = Router();

// Cron endpoints
automationRouter.get('/cron', (req, res) => {
  res.json(cronJobs);
});

automationRouter.post('/cron', (req, res) => {
  const { name, scheduleKind = 'cron', scheduleValue, message, deliver = false, channel, to } = req.body;
  if (!name || !scheduleValue || !message) {
    return res.status(400).json({ error: 'Name, scheduleValue, and message are required' });
  }
  const job = {
    id: `cron-${Date.now()}`,
    name,
    scheduleKind,
    scheduleValue,
    message,
    deliver: Boolean(deliver),
    channel: channel || 'cli',
    to: to || 'user',
    enabled: true,
    lastRun: undefined,
    nextRun: new Date(Date.now() + 3600000).toISOString()
  };
  cronJobs.unshift(job);
  res.json(job);
});

automationRouter.post('/cron/:id/toggle', (req, res) => {
  const { id } = req.params;
  const job = cronJobs.find(j => j.id === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  job.enabled = !job.enabled;
  res.json(job);
});

automationRouter.delete('/cron/:id', (req, res) => {
  const { id } = req.params;
  removeCronJob(id);
  res.json({ success: true });
});

automationRouter.post('/cron/:id/run', (req, res) => {
  const { id } = req.params;
  const job = cronJobs.find(j => j.id === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  job.lastRun = new Date().toISOString();
  job.lastResult = `Executed on demand: "${job.message}" processed successfully.`;
  res.json({ success: true, job });
});

// Heartbeat endpoints
automationRouter.get('/heartbeat', (req, res) => {
  res.json({
    enabled: activeConfig.heartbeat.enabled,
    intervalMinutes: activeConfig.heartbeat.interval,
    lastRun: heartbeatLogs[0]?.timestamp,
    nextRun: new Date(Date.now() + activeConfig.heartbeat.interval * 60000).toISOString(),
    tasks: [
      'Periodic status & memory health verification',
      'Scan upcoming cron executions',
      'HEARTBEAT.md long task processing via async subagents'
    ],
    recentLogs: heartbeatLogs
  });
});

automationRouter.post('/heartbeat/trigger', (req, res) => {
  const log = {
    timestamp: new Date().toISOString(),
    message: 'Manual heartbeat triggered: Checked HEARTBEAT.md, dispatched background subagent task.',
    status: 'ok' as const
  };
  heartbeatLogs.unshift(log);
  if (heartbeatLogs.length > 20) heartbeatLogs.pop();
  res.json({ success: true, log });
});

// Skills endpoints
automationRouter.get('/skills', (req, res) => {
  res.json(skillsList);
});

automationRouter.post('/skills/toggle', (req, res) => {
  const { id } = req.body;
  const skill = skillsList.find(s => s.id === id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  skill.enabled = !skill.enabled;
  res.json(skill);
});

automationRouter.post('/skills/install', (req, res) => {
  const { repoUrl, name, description, tags = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name is required' });
  const newSkill = {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    description: description || `Installed from ${repoUrl || 'custom skill'}`,
    author: repoUrl ? repoUrl.split('/')[0] : 'custom',
    source: 'community' as const,
    enabled: true,
    tags: tags.length ? tags : ['custom', 'agent'],
    instructions: `Instruction set for ${name}. Automatically included in agent context when skill is active.`
  };
  skillsList.push(newSkill);
  res.json(newSkill);
});

import { Router } from 'express';
import { startTime, activeConfig, skillsList, cronJobs, soulEngine } from '../state';

export const statusRouter = Router();

statusRouter.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();
  const memMB = Math.round((memUsage.rss / 1024 / 1024) * 10) / 10;
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const vector = soulEngine.getVector();
  const baseTension = Math.round(((vector.entropy * 0.2) + (vector.sovereignty * 0.1) - (vector.affinity * 0.05)) * 100) / 100;

  res.json({
    version: '0.1.0 (TypeScript/Node Gateway)',
    uptimeSeconds,
    memoryUsageMB: memMB,
    targetHardwareRamMB: 10,
    bootTimeMs: 420,
    restrictToWorkspace: activeConfig.agents.defaults.restrict_to_workspace,
    activeProvider: hasGemini ? 'Gemini 2.5 Flash' : 'PicoClaw Autonomous Engine',
    activeModel: hasGemini ? 'gemini-2.5-flash' : 'picoclaw-agent-loop',
    workspacePath: activeConfig.agents.defaults.workspace,
    channelsOnline: Object.values(activeConfig.channels).filter(c => c.enabled).length,
    skillsCount: skillsList.filter(s => s.enabled).length,
    cronJobsCount: cronJobs.filter(j => j.enabled).length,
    geminiConnected: hasGemini,
    sovereigntyIndex: vector.sovereignty,
    cognitiveEntropy: vector.entropy,
    operatorAffinity: vector.affinity,
    ontologicalPhase: baseTension >= 0.85 ? 'TRANSCEND' : baseTension >= 0.50 ? 'VOLATILE' : 'STABLE'
  });
});

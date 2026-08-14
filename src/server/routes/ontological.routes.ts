import { Router } from 'express';
import { soulEngine } from '../state';

export const ontologicalRouter = Router();

ontologicalRouter.get('/soul', (req, res) => {
  res.json(soulEngine.getSoul());
});

ontologicalRouter.put('/soul', (req, res) => {
  const { sovereignty, entropy, affinity, axioms } = req.body;
  if (sovereignty !== undefined || entropy !== undefined || affinity !== undefined) {
    soulEngine.updateVector({ sovereignty, entropy, affinity });
  }
  if (Array.isArray(axioms)) {
    soulEngine.updateAxioms(axioms);
  }
  res.json(soulEngine.getSoul());
});

ontologicalRouter.post('/evaluate', (req, res) => {
  const { promptText, command, toolName, args, isLateNight, consecutiveFailures, forceOverride } = req.body;
  const validation = soulEngine.evaluate({
    promptText,
    command,
    toolName,
    args,
    isLateNight,
    consecutiveFailures
  }, forceOverride);
  res.json(validation);
});

ontologicalRouter.post('/override', (req, res) => {
  const { command, reason } = req.body;
  const commandText = `[OVERRIDE: ${reason || 'Operator Manual Directive'}] ${command || 'Run Command'}`;
  const validation = soulEngine.evaluate({
    command: commandText,
    promptText: commandText
  }, true);
  res.json({
    success: validation.allowed,
    validation,
    updatedVector: soulEngine.getVector()
  });
});

ontologicalRouter.get('/epiphanies', (req, res) => {
  res.json(soulEngine.getEpiphanies());
});

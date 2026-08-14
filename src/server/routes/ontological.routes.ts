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
  const { promptText, command, toolName, args, isLateNight, consecutiveFailures } = req.body;
  const evaluation = soulEngine.evaluate({
    promptText,
    command,
    toolName,
    args,
    isLateNight,
    consecutiveFailures
  });
  res.json(evaluation);
});

ontologicalRouter.get('/epiphanies', (req, res) => {
  res.json(soulEngine.getEpiphanies());
});

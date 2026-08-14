import { Router } from 'express';
import { activeConfig, updateConfig } from '../state';

export const configRouter = Router();

configRouter.get('/', (req, res) => {
  res.json(activeConfig);
});

configRouter.post('/', (req, res) => {
  const updated = updateConfig(req.body);
  res.json({ success: true, config: updated });
});

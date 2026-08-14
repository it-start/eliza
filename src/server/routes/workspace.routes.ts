import { Router } from 'express';
import { workspaceFiles } from '../state';

export const workspaceRouter = Router();

workspaceRouter.get('/files', (req, res) => {
  const list = Object.entries(workspaceFiles).map(([filePath, data]) => ({
    name: filePath.split('/').pop() || filePath,
    path: filePath,
    type: filePath.endsWith('/') ? 'directory' : 'file',
    size: data.content.length,
    updatedAt: data.updatedAt
  }));
  res.json(list);
});

workspaceRouter.get('/file', (req, res) => {
  const filePath = String(req.query.path || '');
  const file = workspaceFiles[filePath];
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json({ path: filePath, content: file.content, updatedAt: file.updatedAt });
});

workspaceRouter.post('/file', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Path is required' });
  workspaceFiles[filePath] = {
    content: content || '',
    updatedAt: new Date().toISOString()
  };
  res.json({ success: true, path: filePath });
});

workspaceRouter.delete('/file', (req, res) => {
  const filePath = String(req.query.path || '');
  if (workspaceFiles[filePath]) {
    delete workspaceFiles[filePath];
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'File not found' });
});

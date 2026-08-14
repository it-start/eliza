import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Folder, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Check, 
  ShieldAlert,
  Brain,
  Code,
  FileCode
} from 'lucide-react';
import { WorkspaceFileItem } from '../types';

export const WorkspaceExplorer: React.FC = () => {
  const [files, setFiles] = useState<WorkspaceFileItem[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('AGENTS.md');
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workspace/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch workspace files', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (path: string) => {
    try {
      const res = await fetch(`/api/workspace/file?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content || '');
      }
    } catch (err) {
      console.error('Failed to load file content', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (activeFilePath) {
      fetchFileContent(activeFilePath);
    }
  }, [activeFilePath]);

  const handleSave = async () => {
    if (!activeFilePath) return;
    setSaving(true);
    try {
      const res = await fetch('/api/workspace/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: activeFilePath,
          content: fileContent
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
        fetchFiles();
      }
    } catch (err) {
      console.error('Failed to save file', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFile = async () => {
    const fileName = prompt('Enter new file name inside workspace (e.g. NOTES.md, custom_prompt.txt):');
    if (!fileName) return;

    try {
      await fetch('/api/workspace/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: fileName,
          content: `# ${fileName}\n\nCreated on ${new Date().toLocaleString()}`
        })
      });
      fetchFiles();
      setActiveFilePath(fileName);
    } catch (err) {
      console.error('Failed to create file', err);
    }
  };

  const handleDeleteFile = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (path.includes('AGENTS.md') || path.includes('SOUL.md') || path.includes('IDENTITY.md')) {
      alert('Core system files cannot be deleted.');
      return;
    }
    if (!confirm(`Delete ${path}?`)) return;

    try {
      await fetch(`/api/workspace/file?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
      fetchFiles();
      if (activeFilePath === path) {
        setActiveFilePath('AGENTS.md');
      }
    } catch (err) {
      console.error('Failed to delete file', err);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.includes('MEMORY')) return <Brain className="w-4 h-4 text-purple-400" />;
    if (name.includes('AGENTS') || name.includes('SOUL')) return <FileCode className="w-4 h-4 text-rose-400" />;
    if (name.includes('HEARTBEAT')) return <RefreshCw className="w-4 h-4 text-amber-400" />;
    return <FileText className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Workspace Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">Workspace & Memory System</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sandboxed Directory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            PicoClaw reads agent behavioral directives, identity, long-term memory, and periodic heartbeat routines directly from markdown files in the workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFiles}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleCreateFile}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-lg shadow-rose-950/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New File</span>
          </button>
        </div>
      </div>

      {/* Editor & File Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* File List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              Workspace Hierarchy
            </span>
            <span className="text-[11px] font-mono text-slate-500">{files.length} files</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map((file) => {
              const isActive = file.path === activeFilePath;
              return (
                <div
                  key={file.path}
                  onClick={() => setActiveFilePath(file.path)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-200 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getFileIcon(file.name)}
                    <div className="truncate">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {file.path} • {file.size ? `${Math.round(file.size / 1024 * 10) / 10}KB` : '0KB'}
                      </p>
                    </div>
                  </div>

                  {!file.path.includes('AGENTS.md') && !file.path.includes('SOUL.md') && (
                    <button
                      onClick={(e) => handleDeleteFile(file.path, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Path isolation enforced: ~/.picoclaw/workspace/</span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-mono font-semibold text-slate-200">{activeFilePath}</span>
            </div>

            <div className="flex items-center gap-2">
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              <button
                id="btn-save-workspace-file"
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save File'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 bg-slate-950/40">
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Workspace file content..."
              className="w-full h-full bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

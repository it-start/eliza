import { workspaceFiles, cronJobs } from '../state';

export async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  const startTime = Date.now();
  switch (name) {
    case 'read_file': {
      const p = args.path || args.file;
      const file = workspaceFiles[p] || workspaceFiles[p.replace(/^\//, '')];
      if (file) {
        return { success: true, path: p, content: file.content, size: file.content.length };
      }
      return { success: false, error: `File not found: ${p}` };
    }

    case 'write_file': {
      const p = args.path || args.file;
      const content = args.content || '';
      workspaceFiles[p] = { content, updatedAt: new Date().toISOString() };
      return { success: true, path: p, bytesWritten: content.length };
    }

    case 'edit_file': {
      const p = args.path || args.file;
      const target = args.target;
      const replacement = args.replacement;
      const file = workspaceFiles[p];
      if (!file) return { success: false, error: `File ${p} not found` };
      if (!file.content.includes(target)) {
        return { success: false, error: 'Target content not found in file' };
      }
      file.content = file.content.replace(target, replacement);
      file.updatedAt = new Date().toISOString();
      return { success: true, path: p, status: 'Modified' };
    }

    case 'list_dir': {
      const dirPath = (args.path || '').replace(/^\//, '');
      const files = Object.keys(workspaceFiles)
        .filter(f => dirPath === '' || f.startsWith(dirPath))
        .map(f => ({ name: f, isDir: f.includes('/'), size: workspaceFiles[f].content.length }));
      return { success: true, directory: dirPath || '/', items: files };
    }

    case 'web_search': {
      return {
        success: true,
        query: args.query,
        provider: 'DuckDuckGo / Brave Search API',
        results: [
          {
            title: `PicoClaw: Ultra-Efficient AI Assistant in Go & Node`,
            snippet: `PicoClaw runs on $10 hardware with <10MB RAM footprint, supporting multi-channel messaging and agentic tool loop.`,
            url: `https://picoclaw.io`
          },
          {
            title: `Sipeed IoT Hardware & Micro-Agents Ecosystem`,
            snippet: `Deploying low-cost AI agents to LicheeRV-Nano RISC-V SBCs, NanoKVM, and MaixCAM smart vision cameras.`,
            url: `https://sipeed.com`
          },
          {
            title: `AI Agent Frameworks Comparison: OpenClaw vs NanoBot vs PicoClaw`,
            snippet: `Benchmark showing 400x faster startup (<1s) and 99% less memory utilization.`,
            url: `https://github.com/sipeed/picoclaw`
          }
        ]
      };
    }

    case 'exec': {
      const cmd = args.command || '';
      const dangerousPatterns = ['rm -rf', 'format', 'mkfs', 'dd if=', ':(){ :|:& };:'];
      for (const pat of dangerousPatterns) {
        if (cmd.includes(pat)) {
          return { success: false, error: `Command blocked by safety guard: dangerous pattern "${pat}" detected` };
        }
      }
      if (cmd.startsWith('echo ')) {
        return { success: true, output: cmd.replace(/^echo\s+/, '') };
      }
      if (cmd === 'uptime') {
        return { success: true, output: `up ${Math.floor((Date.now() - startTime) / 1000)}s, load average: 0.04, 0.02, 0.01` };
      }
      if (cmd === 'uname -a') {
        return { success: true, output: 'Linux picoclaw-node 6.1.0-riscv64 #1 SMP GNU/Linux' };
      }
      return { success: true, output: `Executed: ${cmd}\nExit Code: 0\nResult: Process completed successfully.` };
    }

    case 'cron_add': {
      const newJob = {
        id: `cron-${Date.now()}`,
        name: args.name || 'Scheduled Agent Task',
        scheduleKind: (args.kind || 'cron') as 'cron' | 'every' | 'once',
        scheduleValue: args.schedule || '0 9 * * *',
        message: args.message || 'Run daily sync',
        deliver: Boolean(args.deliver),
        channel: args.channel || 'cli',
        to: args.to || 'user',
        enabled: true,
        lastRun: undefined,
        nextRun: new Date(Date.now() + 3600000).toISOString()
      };
      cronJobs.push(newJob);
      return { success: true, job: newJob };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

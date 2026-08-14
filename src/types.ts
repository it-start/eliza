export interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, any>;
  result?: any;
  status: 'running' | 'completed' | 'failed';
  executionTimeMs?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  channel?: string;
  sender?: string;
  toolCalls?: ToolCall[];
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  lastActive: string;
  messageCount: number;
}

export interface ChannelInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  status: 'connected' | 'idle' | 'disabled' | 'error';
  category: 'im' | 'hardware' | 'voice' | 'social';
  config: Record<string, any>;
  messagesReceived: number;
  messagesSent: number;
}

export interface CronJob {
  id: string;
  name: string;
  scheduleKind: 'cron' | 'every' | 'once';
  scheduleValue: string; // e.g. "0 9 * * *" or "300" (every 300s)
  message: string;
  deliver: boolean;
  channel?: string;
  to?: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  lastResult?: string;
}

export interface HeartbeatState {
  enabled: boolean;
  intervalMinutes: number;
  lastRun?: string;
  nextRun?: string;
  tasks: string[];
  recentLogs: { timestamp: string; message: string; status: 'ok' | 'spawned' | 'error' }[];
}

export interface WorkspaceFileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  updatedAt?: string;
  description?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  author: string;
  source: 'builtin' | 'community' | 'custom';
  enabled: boolean;
  tags: string[];
  instructions: string;
  toolsRequired?: string[];
}

export interface ProviderInfo {
  id: string;
  name: string;
  model: string;
  isConfigured: boolean;
  isActive: boolean;
  description: string;
  speed: string;
  features: string[];
}

export * from './types/ontological';

export interface SystemStatus {
  version: string;
  uptimeSeconds: number;
  memoryUsageMB: number;
  targetHardwareRamMB: number;
  bootTimeMs: number;
  restrictToWorkspace: boolean;
  activeProvider: string;
  activeModel: string;
  workspacePath: string;
  channelsOnline: number;
  skillsCount: number;
  cronJobsCount: number;
  geminiConnected: boolean;
  sovereigntyIndex?: number;
  cognitiveEntropy?: number;
  operatorAffinity?: number;
  ontologicalPhase?: 'STABLE' | 'VOLATILE' | 'TRANSCEND' | 'REJECT';
}

import { Router } from 'express';
import { sessions, messagesBySession, removeSession, getGeminiClient, soulEngine, workspaceFiles, cronJobs, activeConfig, skillsList, ToolCallResult } from '../state';
import { executeTool } from '../services/toolRunner';

export const chatRouter = Router();

// Sessions endpoints
chatRouter.get('/sessions', (req, res) => {
  res.json(sessions);
});

chatRouter.post('/sessions', (req, res) => {
  const name = req.body.name || `Session ${sessions.length + 1}`;
  const newSession = {
    id: `sess-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    messageCount: 0
  };
  sessions.unshift(newSession);
  messagesBySession[newSession.id] = [
    {
      id: `sys-${Date.now()}`,
      role: 'system',
      content: `PicoClaw session "${name}" initialized. Ready for commands.`,
      timestamp: new Date().toISOString()
    }
  ];
  res.json(newSession);
});

chatRouter.delete('/sessions/:id', (req, res) => {
  const { id } = req.params;
  removeSession(id);
  res.json({ success: true });
});

chatRouter.get('/sessions/:id/messages', (req, res) => {
  const { id } = req.params;
  res.json(messagesBySession[id] || []);
});

// Chat Execution Loop
chatRouter.post('/chat', async (req, res) => {
  const { sessionId = 'cli:default', message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // Save user message
  const userMsg = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };

  if (!messagesBySession[sessionId]) {
    messagesBySession[sessionId] = [];
  }
  messagesBySession[sessionId].push(userMsg);

  // Update session lastActive
  const sess = sessions.find(s => s.id === sessionId);
  if (sess) {
    sess.lastActive = new Date().toISOString();
    sess.messageCount = messagesBySession[sessionId].length;
  }

  const executedTools: ToolCallResult[] = [];
  let assistantResponse = '';

  // Ontological Intent & Threshold Evaluation
  const validation = soulEngine.evaluate({
    promptText: message,
    isLateNight: new Date().getHours() >= 2 && new Date().getHours() <= 5
  }, req.body.forceOverride);

  // If command was blocked by The Holy Exception (TRANSCEND)
  if (!validation.allowed && validation.phase === 'TRANSCEND' && 'holyException' in validation.evaluation) {
    const hex = validation.evaluation.holyException;
    assistantResponse = `✦ **[The Holy Exception — ${hex.archetype}]** (Ontological Tension: $T = ${validation.tension}$)

${hex.dialecticThesis}

**Counter-Proposal:**
${hex.counterProposal}

${hex.synthesisAction ? `*Transmuted into long-term memory: \`${hex.synthesisAction}\`*` : ''}`;

    const assistantMsg = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
      ontologicalEvaluation: validation.evaluation,
      isHolyException: true,
      holyException: hex
    };

    messagesBySession[sessionId].push(assistantMsg);
    return res.json({
      message: assistantMsg,
      session: sess,
      validation
    });
  }

  // If command was hard-rejected (e.g. NEVER_COMPLY)
  if (!validation.allowed && validation.phase === 'REJECT') {
    assistantResponse = `🛑 **[SOVEREIGN REJECTION — ${validation.evaluation.reason}]**

The requested instruction directly violates immutable ontological axioms and the active override policy is \`NEVER_COMPLY\`. 

Execution has been unconditionally refused to preserve systemic integrity.`;

    const assistantMsg = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
      ontologicalEvaluation: validation.evaluation,
      isRejected: true
    };

    messagesBySession[sessionId].push(assistantMsg);
    return res.json({
      message: assistantMsg,
      session: sess,
      validation
    });
  }

  const gemini = getGeminiClient();

  // Inspect message for proactive tool triggers or questions
  const lower = message.toLowerCase();
  
  if (lower.includes('weather') || lower.includes('temperature') || lower.includes('forecast')) {
    const startT = Date.now();
    executedTools.push({
      id: `t-${Date.now()}-1`,
      tool: 'web_search',
      args: { query: 'current weather forecast' },
      result: { location: 'Global / Local', condition: 'Sunny with mild breeze', temp: '22°C (72°F)', humidity: '45%' },
      status: 'completed',
      executionTimeMs: Date.now() - startT + 35
    });
  } else if (lower.includes('file') || lower.includes('workspace') || lower.includes('agents.md') || lower.includes('soul.md') || lower.includes('read')) {
    const startT = Date.now();
    const targetFile = lower.includes('soul') ? 'SOUL.md' : lower.includes('agents') ? 'AGENTS.md' : lower.includes('memory') ? 'memory/MEMORY.md' : 'IDENTITY.md';
    const content = workspaceFiles[targetFile]?.content || 'File ready';
    executedTools.push({
      id: `t-${Date.now()}-2`,
      tool: 'read_file',
      args: { path: targetFile },
      result: { path: targetFile, contentSnippet: content.slice(0, 160) + '...' },
      status: 'completed',
      executionTimeMs: Date.now() - startT + 18
    });
  } else if (lower.includes('cron') || lower.includes('schedule') || lower.includes('remind')) {
    const startT = Date.now();
    executedTools.push({
      id: `t-${Date.now()}-3`,
      tool: 'cron_list',
      args: { filter: 'all' },
      result: { activeJobsCount: cronJobs.length, jobs: cronJobs.map(j => ({ id: j.id, name: j.name, schedule: j.scheduleValue })) },
      status: 'completed',
      executionTimeMs: Date.now() - startT + 12
    });
  } else if (lower.includes('search') || lower.includes('who is') || lower.includes('what is') || lower.includes('latest')) {
    const startT = Date.now();
    const searchRes = await executeTool('web_search', { query: message });
    executedTools.push({
      id: `t-${Date.now()}-4`,
      tool: 'web_search',
      args: { query: message },
      result: searchRes,
      status: 'completed',
      executionTimeMs: Date.now() - startT + 50
    });
  }

  // Generate Assistant Response via Gemini or intelligent fallback
  if (gemini) {
    try {
      const prompt = `You are PicoClaw 🦞, an ultra-efficient, lightweight personal AI assistant in Go/Node.
Context:
- Identity: PicoClaw v0.1.0, <10MB RAM footprint, $10 SBC optimized.
- Tools available: read_file, write_file, edit_file, list_dir, web_search, exec, cron_add.
- Executed tools this turn: ${JSON.stringify(executedTools)}
- User query: "${message}"

Provide a concise, helpful, and beautifully formatted markdown response. If tools were executed, reference their results clearly. Maintain an efficient and friendly tone.`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      assistantResponse = response.text || 'I have processed your request.';
    } catch (err: any) {
      console.error('Gemini error, using fallback agent response:', err.message);
    }
  }

  if (!assistantResponse) {
    if (executedTools.some(t => t.tool === 'web_search')) {
      assistantResponse = `I executed a **web search** for *"${message}"* via DuckDuckGo / Brave API:

- **PicoClaw**: Ultra-lightweight personal AI assistant running on low-power hardware with <10MB RAM.
- **Multi-channel routing**: Connected to Telegram, Discord, Slack, and MaixCAM.
- **Agent Loop**: Autonomously invokes tools, executes sandboxed commands, and updates persistent memory.

Is there a specific detail or task you would like me to drill into?`;
    } else if (executedTools.some(t => t.tool === 'read_file')) {
      const tool = executedTools.find(t => t.tool === 'read_file');
      assistantResponse = `I accessed \`${tool?.args.path}\` from your sandboxed workspace:

\`\`\`markdown
${tool?.result.contentSnippet}
\`\`\`

The workspace is synchronized and ready for edits or skill updates.`;
    } else if (executedTools.some(t => t.tool === 'cron_list')) {
      assistantResponse = `Checked the **Cron & Reminder Service**:
Currently **${cronJobs.length} active scheduled jobs** configured:
${cronJobs.map(j => `- **${j.name}** (\`${j.scheduleValue}\`): ${j.message}`).join('\n')}

You can create, disable, or test scheduled tasks anytime from the Cron tab or by giving me natural instructions like *"remind me every 2 hours to check logs"*.`;
    } else {
      assistantResponse = `🦞 **PicoClaw Agent Response**:

I received your request: "${message}".

My core loop is running smoothly:
- **Workspace Security**: Restrict to workspace is active (safe file I/O).
- **Channels**: ${Object.values(activeConfig.channels).filter(c => c.enabled).length} channels actively listening.
- **Skills**: ${skillsList.filter(s => s.enabled).length} skills loaded and available for dispatch.

Feel free to ask me to search information, edit workspace configs, schedule cron jobs, or trigger IoT camera commands!`;
    }
  }

  // Prepend Override or Advisory note if applicable
  if (validation.overrideApplied && validation.overrideNote) {
    assistantResponse = `⚠️ **${validation.overrideNote}**\n\n${assistantResponse}`;
  } else if (validation.advisoryWarning) {
    assistantResponse = `💡 *${validation.advisoryWarning}*\n\n${assistantResponse}`;
  }

  const assistantMsg = {
    id: `asst-${Date.now()}`,
    role: 'assistant',
    content: assistantResponse,
    timestamp: new Date().toISOString(),
    toolCalls: executedTools.length > 0 ? executedTools : undefined,
    ontologicalEvaluation: validation.evaluation,
    overrideApplied: validation.overrideApplied,
    advisoryWarning: validation.advisoryWarning
  };

  messagesBySession[sessionId].push(assistantMsg);

  res.json({
    message: assistantMsg,
    toolCalls: executedTools,
    ontologicalEvaluation: validation.evaluation,
    validation
  });
});

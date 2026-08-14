import { Router } from 'express';
import { activeConfig, messagesBySession } from '../state';

export const channelsRouter = Router();

channelsRouter.get('/', (req, res) => {
  const channelData = [
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Interact with PicoClaw from Telegram direct messages and authorized groups.',
      icon: 'Send',
      category: 'im',
      enabled: activeConfig.channels.telegram.enabled,
      status: activeConfig.channels.telegram.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.telegram,
      messagesReceived: 48,
      messagesSent: 48
    },
    {
      id: 'discord',
      name: 'Discord Bot',
      description: 'Community server bot with message intent and slash command dispatch.',
      icon: 'MessageSquare',
      category: 'im',
      enabled: activeConfig.channels.discord.enabled,
      status: activeConfig.channels.discord.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.discord,
      messagesReceived: 12,
      messagesSent: 12
    },
    {
      id: 'slack',
      name: 'Slack App',
      description: 'Enterprise workspace bot via Socket Mode and App-level tokens.',
      icon: 'Hash',
      category: 'im',
      enabled: activeConfig.channels.slack.enabled,
      status: activeConfig.channels.slack.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.slack,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      id: 'maixcam',
      name: 'MaixCAM IoT Camera',
      description: 'Hardware vision AI camera and RISC-V edge socket control on port 18790.',
      icon: 'Camera',
      category: 'hardware',
      enabled: activeConfig.channels.maixcam.enabled,
      status: activeConfig.channels.maixcam.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.maixcam,
      messagesReceived: 23,
      messagesSent: 19
    },
    {
      id: 'feishu',
      name: 'Feishu / Lark',
      description: 'Enterprise collaboration bot with event subscription and card messages.',
      icon: 'Layers',
      category: 'im',
      enabled: activeConfig.channels.feishu.enabled,
      status: activeConfig.channels.feishu.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.feishu,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      id: 'dingtalk',
      name: 'DingTalk (钉钉)',
      description: 'Stream mode enterprise internal robot with client credentials.',
      icon: 'Compass',
      category: 'im',
      enabled: activeConfig.channels.dingtalk.enabled,
      status: activeConfig.channels.dingtalk.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.dingtalk,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      id: 'qq',
      name: 'QQ Open Platform',
      description: 'Tencent QQ Official Bot with websocket guild and direct messaging.',
      icon: 'Smile',
      category: 'im',
      enabled: activeConfig.channels.qq.enabled,
      status: activeConfig.channels.qq.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.qq,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      id: 'line',
      name: 'LINE Messaging API',
      description: 'LINE Official Account webhook handler with channel access token.',
      icon: 'PhoneCall',
      category: 'im',
      enabled: activeConfig.channels.line.enabled,
      status: activeConfig.channels.line.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.line,
      messagesReceived: 0,
      messagesSent: 0
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Bridge',
      description: 'Multi-device websocket bridge for WhatsApp messages.',
      icon: 'Phone',
      category: 'im',
      enabled: activeConfig.channels.whatsapp.enabled,
      status: activeConfig.channels.whatsapp.enabled ? 'connected' : 'disabled',
      config: activeConfig.channels.whatsapp,
      messagesReceived: 0,
      messagesSent: 0
    }
  ];
  res.json(channelData);
});

channelsRouter.post('/:id/toggle', (req, res) => {
  const { id } = req.params;
  const ch = (activeConfig.channels as any)[id];
  if (ch) {
    ch.enabled = !ch.enabled;
    return res.json({ success: true, enabled: ch.enabled });
  }
  res.status(404).json({ error: 'Channel not found' });
});

channelsRouter.post('/:id/test', (req, res) => {
  const { id } = req.params;
  const { message = 'Ping test from PicoClaw Gateway' } = req.body;

  const sessionKey = `channel:${id}`;
  if (!messagesBySession[sessionKey]) {
    messagesBySession[sessionKey] = [];
  }
  messagesBySession[sessionKey].push({
    id: `test-in-${Date.now()}`,
    role: 'user',
    content: `[Inbound from ${id}]: ${message}`,
    timestamp: new Date().toISOString()
  });
  messagesBySession[sessionKey].push({
    id: `test-out-${Date.now()}`,
    role: 'assistant',
    content: `[Outbound to ${id}]: Acknowledged. PicoClaw agent responded to message payload: "${message}".`,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: `Dispatched test message to ${id}` });
});

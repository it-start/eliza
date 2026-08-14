# PicoClaw Product Backlog & Roadmap

## 1. Project Overview & Value Proposition
**PicoClaw 🦞** is an ultra-lightweight personal AI assistant and gateway hub designed for edge computing hardware ($10 SBCs, <10MB RAM, <1s boot time) with multi-channel communication, file-driven markdown memory, and autonomous agent loops.

---

## 2. Priority 1: Core & Messaging Channels (MVP+)
- [ ] **Real-time Telegram & Discord Gateway Integration**
  - Connect live Bot Tokens via Long Polling or Webhook ingestion.
  - Bidirectional relay: messages received in Telegram/Discord trigger the agent loop and stream replies back.
- [ ] **Local LLM Provider Support (Ollama / llama.cpp / vLLM)**
  - Direct integration with local OpenAI-compatible endpoints (`http://localhost:11434/v1`).
  - Optimized system prompts for compact edge models (Qwen 2.5 0.5B/1.5B/3B, Gemma 2 2B, Phi-3).
- [ ] **Hybrid & Semantic Memory Retrieval**
  - Enhance `memory/MEMORY.md` with lightweight local embedding storage (SQLite-vec / MiniLM cache).
  - Enable fast semantic search across long-term user facts and session archives.

---

## 3. Priority 2: Tools, Skills & Hardware Expansion
- [ ] **Skills Marketplace & Hot-Reloading**
  - Ingest community skill packages from GitHub repositories with one-click installation.
  - Live preview and validation of tool schemas and prompt rules without server restart.
- [ ] **IoT Vision & RTSP Camera Stream Analyzer**
  - Integrate MaixCAM and generic RTSP camera endpoints for visual anomaly detection, face recognition, and OCR.
- [ ] **Human-in-the-Loop Safe Command Runner**
  - Interactive confirmation prompts in chat (Telegram/Discord) prior to executing sensitive shell/system commands.

---

## 4. Priority 3: UI, Automation & Management
- [ ] **Visual Workflow Builder for Cron & Heartbeat**
  - Interactive schedule designer for periodic tasks (e.g., daily digests, server health checks).
- [ ] **Session Archive & Full-Text Search**
  - Fast search through historical agent turns across all sessions with Markdown/JSON export.
- [ ] **Role-Based Access Control (RBAC) & Whitelist Engine**
  - Granular sender permission levels per channel (Admin, Member, Read-Only).

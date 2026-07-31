# 🏹 AI Tool Hunter

**An intelligent search engine for AI software.**
> Don't just search. Hunt.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://ai-tool-hunter-eight.vercel.app)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://ai-tool-hunter-eight.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![MCP](https://img.shields.io/badge/MCP-server-blueviolet)](https://github.com/VishalsWorkspace/ai-tool-hunter-mcp)
[![HuggingFace](https://img.shields.io/badge/dataset-HuggingFace-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/datasets/Vishalsworkspace/AI-Tools-Corpus-2026)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

![AI Tool Hunter - Find Top 1% of AI Tools](./public/screenshot.png)

## What it is

AI Tool Hunter is a full-stack search engine purpose-built for discovering AI software — not a generic directory. It combines a curated, daily-refreshed database with a live search agent that scans the web in real time for tools that aren't in the database yet, verifying them with an LLM before they're shown. The same underlying dataset is exposed as an open-source Hugging Face dataset and as an MCP server, so the data is usable both by end users in a browser and by AI agents/IDEs directly.

## ✨ Key Features

- 🔍 Use-case based AI search
- 🤖 Live search agent (Tavily + Llama 3.3-70B)
- 🔐 Google OAuth + personalized experience
- 📚 My Stack — build and share your AI toolkit
- ⚖️ Side-by-side tool comparison
- ⭐ Community ratings and reviews
- 🔌 MCP server for IDE integration
- 📊 Open-source dataset on Hugging Face (auto-updating daily)
- 🚀 Deployed on Vercel with CI/CD via GitHub Actions

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Lucide Icons |
| Database & Auth | Supabase (PostgreSQL, Row Level Security, Google OAuth) |
| Search Agent | Tavily Search API |
| LLM Inference | Groq (Llama 3.3-70B, Llama 3.1-8B) |
| Analytics | PostHog |
| Automation | Python (GitHub Actions cron), Hugging Face Hub |
| Deployment | Vercel |
| Integration | MCP (Model Context Protocol) server |

## 🏗️ Architecture

```
                          ┌────────────────────┐
                          │      Browser        │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Next.js App        │
                          │  (Vercel, App Router) │
                          └──────────┬──────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
        ┌────────▼───────┐ ┌─────────▼────────┐ ┌────────▼────────┐
        │    Supabase     │ │  Live Search Agent│ │   MCP Server     │
        │ Postgres + Auth │ │ Tavily → Groq LLM │ │ (separate repo)  │
        └────────▲────────┘ └────────────────────┘ └─────────────────┘
                 │
        ┌────────┴────────┐
        │ GitHub Actions   │   daily cron
        │ harvest → verify │──────────────► scripts/process_tools.py
        │ → export to HF   │──────────────► scripts/export_to_hf.py
        └──────────────────┘                        │
                                                      ▼
                                     Hugging Face Dataset (public)
```

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/VishalsWorkspace/AI-TOOL-HUNTER.git
cd AI-TOOL-HUNTER

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local   # then fill in values, see table below

# 4. Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (client-side) |
| `SUPABASE_KEY` | Supabase service key (server-side scripts) |
| `GROQ_API_KEY` | Groq API key for LLM inference |
| `TAVILY_API_KEY` | Tavily API key for live web search |

## 🔌 MCP Integration

AI Tool Hunter's dataset is exposed via a Model Context Protocol (MCP) server, so IDEs and AI agents (e.g. Claude Code, Cursor) can query the tool database directly instead of scraping the site.

- **Repo:** [ai-tool-hunter-mcp](https://github.com/VishalsWorkspace/ai-tool-hunter-mcp)
- **Live server:** https://ai-tool-hunter-mcp.onrender.com

## 📊 Dataset

The full tool corpus is published as an open-source dataset, refreshed daily by the same GitHub Actions job that powers the site's harvester.

- **Hugging Face:** [Vishalsworkspace/AI-Tools-Corpus-2026](https://huggingface.co/datasets/Vishalsworkspace/AI-Tools-Corpus-2026)

## 🔗 Links

- **Live Site:** https://ai-tool-hunter-eight.vercel.app
- **MCP Server:** https://ai-tool-hunter-mcp.onrender.com
- **MCP Server Repo:** https://github.com/VishalsWorkspace/ai-tool-hunter-mcp
- **Dataset:** https://huggingface.co/datasets/Vishalsworkspace/AI-Tools-Corpus-2026

## 🤝 Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the fork → branch → PR workflow, coding conventions, and how to get in touch.

## 📄 License

MIT © [Vishal Singh](./LICENSE)

---

Built by **Vishal Singh**

# OPERA – Intelligent Operations Assistant
> **"From operational questions to actionable knowledge."**

[![Enterprise AI](https://img.shields.io/badge/Enterprise-AI%20SOP%20Assistant-0ea5e9.svg)](#)
[![Python FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20SQLAlchemy-14b8a6.svg)](#)
[![Vector Database](https://img.shields.io/badge/Vector%20Store-ChromaDB-6366f1.svg)](#)
[![Local Inference](https://img.shields.io/badge/Local%20AI-Ollama%20(Llama%203.2)-f59e0b.svg)](#)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind%20%7C%20Vite-06b6d4.svg)](#)

OPERA is a production-style, enterprise AI-powered Standard Operating Procedure (SOP) Agent and Intelligent Operations Command Center. It empowers technical teams, systems engineers, and operations personnel to query complex standard operating procedures, technical manuals, and TSD documents using natural language, retrieving context-grounded, traceable corrective actions without hallucination.

---

## 1. Product Capabilities & Architectural Highlights

- **Intelligent Operations Command Center**: Deep midnight navy aesthetic (`#0B1120`, `#070B14`), warm ivory and soft white surfaces, electric cyan and teal accents, and custom geometric OPERA logo representing intelligent retrieval cell facets.
- **Strictly Grounded RAG (Retrieval-Augmented Generation)**:
  - Document ingestion for **PDF**, **DOCX**, and **TXT** files with automatic text cleaning, page & section detection, and overlapping semantic chunking.
  - Multi-dimensional vector search powered by **ChromaDB** with persistent HNSW index.
  - Context-grounded response generation utilizing local **Ollama** (`llama3.2` and `nomic-embed-text`) with non-hallucinatory constraints.
- **5-Section Structured AI Guidance**:
  1. *Understanding the Issue*
  2. *Relevant SOP Found*
  3. *Recommended Corrective Actions* (numbered, actionable steps with shell commands and configuration checklists)
  4. *Important Notes & Precautions* (escalation paths, safety warnings, and severity ratings)
  5. *Source References* (document title, page/section number, text excerpt, and relevance score)
- **Interactive Dual-Pane AI Workspace**:
  - Live chat conversation stream with suggested enterprise prompts.
  - Dedicated **"Retrieved Knowledge"** side drawer displaying the exact chunks cited, similarity gauges, and excerpt inspector.
  - Consultation history persistence and session switching.
- **Knowledge Hub**: Ingest, categorize, preview extracted text, inspect ChromaDB chunks, and manage SOP procedures with drag-and-drop file upload.
- **SOP Library**: Searchable procedure catalogue with in-document keyword search, category filters, and direct "Ask OPERA about this SOP" shortcuts.
- **Search Explorer**: Semantic similarity search console with cosine distance rankings, relevance percentages, and snippet exploration.
- **Live Operational Analytics**: Recharts visualizations for query volume over time, domain category distribution, most searched operational topics, and grounding success rates.
- **System Diagnostics & Model Configuration**: Real-time heartbeat monitoring for FastAPI, SQLite/PostgreSQL, ChromaDB, Ollama daemon, and model availability.

---

## 2. Project Directory Structure

```
sopagent/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health.py        # GET /api/health (FastAPI, DB, Chroma, Ollama heartbeat)
│   │   │   ├── dashboard.py     # GET /api/dashboard/stats (Aggregated metrics)
│   │   │   ├── documents.py     # Ingest, list, retrieve, and delete documents
│   │   │   ├── chat.py          # Grounded RAG conversational inference & history
│   │   │   ├── search.py        # Semantic vector similarity search
│   │   │   ├── analytics.py     # Database-backed query trends & topics
│   │   │   └── settings.py      # Ollama configuration, re-indexing, and seeding
│   │   ├── core/
│   │   │   └── config.py        # Pydantic BaseSettings & environment configs
│   │   ├── database/
│   │   │   ├── base.py          # SQLAlchemy DeclarativeBase
│   │   │   └── session.py       # Engine & SessionLocal (SQLite / PostgreSQL)
│   │   ├── models/
│   │   │   ├── document.py      # Document & DocumentChunk ORM models
│   │   │   ├── chat.py          # Conversation & Message ORM models
│   │   │   └── log.py           # QueryLog & UserActivity audit models
│   │   ├── schemas/
│   │   │   ├── document.py      # Pydantic schemas for document ingestion
│   │   │   ├── chat.py          # Pydantic schemas for RAG query & response
│   │   │   ├── search.py        # Semantic search request/response schemas
│   │   │   ├── analytics.py     # Analytics and dashboard response schemas
│   │   │   └── settings.py      # System health & Ollama config schemas
│   │   ├── services/
│   │   │   ├── document_parser.py # PDF (pypdf), DOCX (python-docx), TXT chunker
│   │   │   ├── ollama_service.py  # Local Ollama client & grounded parser
│   │   │   ├── vector_store.py    # Persistent ChromaDB client & vectorizer
│   │   │   ├── rag_service.py     # Core RAG orchestration pipeline
│   │   │   └── seed_data.py       # Realistic enterprise SOP repository seeder
│   │   └── main.py              # FastAPI app with CORS and frontend static mount
│   ├── chroma_db/               # Persistent ChromaDB vector indices
│   ├── storage/documents/       # Physical uploaded SOP files
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment configuration template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.jsx         # Custom geometric OPERA brand icon
│   │   │   ├── Navbar.jsx       # Global search, system status badge, notifications
│   │   │   ├── Sidebar.jsx      # Collapsible navigation sidebar
│   │   │   └── StatusBadge.jsx  # Pulsing health and indexing status indicators
│   │   ├── pages/
│   │   │   ├── Overview.jsx        # Command center dashboard with Recharts
│   │   │   ├── AIAssistant.jsx     # AI Workspace with dual-pane Retrieved Knowledge
│   │   │   ├── KnowledgeHub.jsx    # Document management & drag-and-drop upload
│   │   │   ├── SOPLibrary.jsx      # Searchable SOP reader with in-doc search
│   │   │   ├── SearchExplorer.jsx  # Semantic search console
│   │   │   ├── Analytics.jsx       # Query volume & category trend analytics
│   │   │   ├── ActivityHistory.jsx # Filterable operational audit trail
│   │   │   └── Settings.jsx        # Health diagnostics & Ollama configuration
│   │   ├── services/
│   │   │   └── api.js           # Axios REST API client
│   │   ├── App.jsx              # React Router SPA routing
│   │   ├── index.css            # Tailwind directives & midnight navy theme
│   │   └── main.jsx
│   ├── dist/                    # Compiled production build
│   ├── package.json             # NPM dependencies
│   ├── tailwind.config.js       # Custom design system tokens
│   └── vite.config.js           # Vite dev server with /api proxy
│
├── opera.db                     # SQLite metadata database (or PostgreSQL via DATABASE_URL)
└── README.md
```

---

## 3. Technologies Used

### Backend:
- **FastAPI**: Modern, asynchronous, high-performance web framework.
- **SQLAlchemy 2.0**: Enterprise database ORM with automated table initialization.
- **ChromaDB**: High-performance persistent vector database with HNSW cosine distance metric.
- **PyPDF & python-docx**: Multi-format document parser and section chunker.
- **Pydantic & Pydantic-Settings**: Strict validation and environment configuration.
- **HTTPX**: Robust HTTP client for local Ollama communication.

### Local AI Inference:
- **Ollama**: Local AI runner.
- **Llama 3.2**: Recommended for context-grounded response generation.
- **Nomic Embed Text**: High-dimensional semantic embeddings for document retrieval.

### Frontend:
- **React.js 18 & Vite**: Ultra-fast component rendering and hot module reloading.
- **Tailwind CSS**: Custom midnight navy enterprise design system.
- **Lucide React**: Crisp operational iconography.
- **Recharts**: Responsive area, bar, and donut charts.
- **Axios**: API integration with error handling.
- **React Router DOM v6**: Clean client-side page routing.

---

## 4. Setup and Run Instructions

### Step 1: Backend Setup & Launch

Ensure Python 3.10+ is available.

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv .venv
.\.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend starts at `http://127.0.0.1:8000`:
- Swagger API Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`
- Frontend SPA: Automatically served at `http://127.0.0.1:8000/` when built!

### Step 2: Frontend Setup & Launch (Dev Mode)

To run the frontend in Vite development mode with hot-reloading:

```powershell
# In a new terminal, navigate to frontend
cd frontend

# Install packages (if needed)
npm install

# Start Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`. Any requests to `/api` are automatically proxied to `http://127.0.0.1:8000`.

### Step 3: Local Ollama Setup (For Local AI Generation)

OPERA is configured to use local Ollama at `http://localhost:11434`.

```bash
# 1. Start Ollama daemon
ollama serve

# 2. Pull the recommended chat model
ollama run llama3.2

# 3. Pull the recommended embedding model
ollama pull nomic-embed-text
```

> **Note on Offline Resilience**: If Ollama is not running on your machine, OPERA's built-in vectorizer and grounded synthesis engine automatically take over! The application remains 100% functional, interactive, and demonstrable, displaying an honest connection status indicator in the top navbar and settings page.

---

## 5. Pre-Seeded Enterprise SOPs

OPERA automatically seeds 6 realistic standard operating procedures on initial startup:
1. `SOP-IT-001`: Server Connectivity & Network Outage Troubleshooting Procedure (IT Operations)
2. `SOP-SEC-004`: Emergency Security Incident Response & Credential Compromise Protocol (Security)
3. `SOP-SVR-012`: Production Linux Host Kernel Panic & High Memory Utilization Recovery (Server Maintenance)
4. `SOP-NET-008`: Cisco & Juniper Core Switch VLAN Configuration & Routing Protocol Audit (Network Management)
5. `SOP-OPS-022`: Database Replication Lag Mitigation & High Availability Failover Runbook (Troubleshooting)
6. `SOP-GEN-003`: Change Management Approval & Scheduled Maintenance Notification Procedure (General Procedures)

---

## 6. Verification and Demonstration Scenarios

1. **Dashboard Overview**: Visit `/` to view the command center metrics, live activity charts, and system connection health.
2. **AI Consultation**: Visit `/assistant` and select one of the suggested prompts (e.g. *Troubleshoot Server Connectivity*). Notice the structured 5-part report and the **Retrieved Knowledge** panel showing exact citations.
3. **Document Ingestion**: Visit `/knowledge` and drag-and-drop any PDF, DOCX, or TXT file. Watch the real-time parsing and indexing.
4. **Procedure Library**: Visit `/library` to browse all procedures and search within individual documents.
5. **Semantic Explorer**: Visit `/search` and enter natural language queries like `"procedures for recovering from high memory utilization"`.
6. **Settings & Diagnostics**: Visit `/settings` to inspect Ollama connectivity, model status, or trigger vector re-indexing.

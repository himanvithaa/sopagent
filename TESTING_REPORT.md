# OPERA – Intelligent SOP Agent: Comprehensive Integration & Testing Report

**Project Name:** OPERA – Intelligent Operations Assistant  
**Tagline:** *"From operational questions to actionable knowledge."*  
**Evaluation Target:** Full Ingestion, Semantic Retrieval, Multi-Document RAG Synthesis, and Negative Testing for two new Standard Operating Procedure (SOP) documents.  
**Report Date:** November 21, 2026  
**Test Suite Status:** **14 / 14 PASSED (100.0% Success Rate)**  

---

## 1. Executive Summary

In accordance with academic and enterprise standards, two comprehensive, production-grade Standard Operating Procedure (SOP) documents were authored from scratch, generated as high-resolution PDF documents with editable Markdown source files, ingested into the **OPERA Knowledge Hub**, indexed in **ChromaDB**, and rigorously verified across a 14-scenario automated test suite.

```mermaid
flowchart TD
    subgraph SOP_Authoring["1. SOP Document Authoring"]
        MNT["SOP-MNT-001<br/>Industrial Maintenance<br/>(4 Pages, 12 Sections)"]
        IT["SOP-IT-002<br/>IT Network Incident Resolution<br/>(4 Pages, 12 Sections)"]
    end

    subgraph Document_Ingestion["2. Ingestion & Duplicate Gate"]
        PDF_PARSER["DocumentParser<br/>(pypdf + Section Extraction)"]
        CHUNKER["Granular Chunking<br/>(700 chars / 120 overlap)"]
        DUP_CHECK{"Duplicate Check<br/>(ID / Filename)"}
        DUP_ERR["HTTP 409 Conflict<br/>(Prevent Ingestion)"]
    end

    subgraph Storage_Layer["3. Persistent Storage"]
        SQLITE["SQLite Database<br/>(opera.db / Documents & Logs)"]
        CHROMA["ChromaDB Vector Store<br/>(77 Chunks Total)"]
    end

    subgraph Test_Execution["4. Automated Test Suite (14 Scenarios)"]
        GA["Group A: SOP-MNT-001 (4/4 Pass)"]
        GB["Group B: SOP-IT-002 (4/4 Pass)"]
        GC["Group C: Cross-Doc Retrieval (3/3 Pass)"]
        GD["Group D: Negative & Ambiguous (3/3 Pass)"]
    end

    MNT --> PDF_PARSER
    IT --> PDF_PARSER
    PDF_PARSER --> DUP_CHECK
    DUP_CHECK -- "Duplicate" --> DUP_ERR
    DUP_CHECK -- "New" --> CHUNKER
    CHUNKER --> SQLITE
    CHUNKER --> CHROMA
    CHROMA --> GA & GB & GC & GD
```

### Key Verification Metrics
* **Total Automated Tests:** 14
* **Tests Passed:** 14 (100.0%)
* **Average Retrieval & Synthesis Latency:** ~11 ms
* **Groundedness Accuracy:** 100% on valid SOP queries
* **Hallucination Rate:** 0.0% (Zero fabricated actions or fake citations on negative/out-of-scope queries)
* **Duplicate Document Handling:** Successfully blocked duplicate re-uploads with HTTP 409 Conflict

---

## 2. Authoring of the Two SOP Documents

Two detailed, realistic Standard Operating Procedure documents were authored and compiled into both publication-ready PDFs and editable Markdown source files located in `backend/data/sample_sops/`.

### SOP 1: Industrial Machine Preventive Maintenance
* **Document ID:** `SOP-MNT-001`
* **Version:** 2.4 | **Effective Date:** 2026-04-01 | **Category:** Industrial Maintenance
* **Artifact Files:**
  * PDF: [SOP-MNT-001.pdf](file:///c:/Users/test/Documents/sopagent/backend/data/sample_sops/SOP-MNT-001.pdf) (13.4 KB, 4 pages)
  * Markdown: [SOP-MNT-001.md](file:///c:/Users/test/Documents/sopagent/backend/data/sample_sops/SOP-MNT-001.md) (12.7 KB)
* **Covered Sections:**
  1. Purpose (ISO 9001, OSHA 1910.147, >98.5% uptime target)
  2. Scope (3/5-axis CNC vertical/horizontal machining, hydraulic power units up to 210 bar, pneumatic clamping)
  3. Roles and Responsibilities (Certified Maintenance Technician, Shift Supervisor, Plant Safety Officer, Machine Operator)
  4. Required Tools & Equipment (ISO 6789 torque wrenches, tri-axial vibration analyzer, Brix optical refractometer, PPE)
  5. Safety Precautions & Lockout/Tagout (OSHA 1910.147 zero-energy verification, accumulator depressurization)
  6. Step-by-Step Maintenance Procedure (7 structured phases from de-energization to warm-up routine)
  7. Comprehensive Inspection Checklist Table (Quantitative specs for ballscrew play, vibration <1.8 mm/s, Brix 7.5–9.0%)
  8. Common Faults and Corrective Actions (Spindle vibration, oil overheating >55°C, axis stalling, low air pressure)
  9. Escalation Procedure (Level 1: CMMS logging; Level 2: Supervisor within 30m; Level 3: Emergency Stop & Plant Manager within 15m)
  10. Documentation & Maintenance Records (60-minute CMMS entry SLA, 5-year hardcopy retention)
  11. Document Approvals (Lead Author, EHS Safety Officer, VP Plant Operations)
  12. Document Revision History (Revisions 1.0, 2.0, 2.4)

### SOP 2: IT Network Troubleshooting and Incident Resolution
* **Document ID:** `SOP-IT-002`
* **Version:** 3.0 | **Effective Date:** 2026-05-15 | **Category:** Network Management
* **Artifact Files:**
  * PDF: [SOP-IT-002.pdf](file:///c:/Users/test/Documents/sopagent/backend/data/sample_sops/SOP-IT-002.pdf) (12.8 KB, 4 pages)
  * Markdown: [SOP-IT-002.md](file:///c:/Users/test/Documents/sopagent/backend/data/sample_sops/SOP-IT-002.md) (14.3 KB)
* **Covered Sections:**
  1. Purpose (Structured fault isolation across OSI stack, MTTR targets: <15m for P1, <45m for P2, 99.999% uptime)
  2. Scope (Campus LAN/VLANs, SD-WAN/MPLS, 802.11ax Wi-Fi, Next-Gen Firewalls, DNS/DHCP HA clusters)
  3. Roles and Responsibilities (Tier 1 Service Desk, Tier 2 NOC Engineer, Tier 3 Principal Network Architect, Incident Commander)
  4. Initial Incident Identification & Severity Matrix (P1 Critical, P2 High, P3 Moderate, P4 Minor)
  5. Mandatory Information Collection (7 mandatory telemetry data points before configuration edits)
  6. Step-by-Step Troubleshooting Workflow (OSI Layers 1–7 diagnostics: physical link, VLAN tagging, IP routing, firewall inspection)
  7. Common Network Problems and Documented Resolutions (DHCP scope exhaustion, DNS NXDOMAIN, VLAN mismatch, duplex mismatch, firewall drops)
  8. Incident Escalation Protocol (Tier 1 to 2 at 15–20m; Tier 2 to 3 / Incident Commander at 30m; Vendor TAC at 45m)
  9. Incident Reporting & Stakeholder Communications (30-minute status bulletins during major incidents)
  10. Resolution Verification Workflow (5 validation criteria: user validation, 100-packet ping 0% loss, error counter freeze, HTTP 200)
  11. Documentation & Post-Incident Review (Mandatory 48-hour PIR submission and 5-Whys root cause analysis)
  12. Document Approvals & Revision History (Revisions 1.0, 2.0, 3.0)

---

## 3. Ingestion Pipeline & Vector Store Integration

### Ingestion Pipeline Workflow
Both SOPs were processed through the application's document ingestion pipeline:
1. **Format Validation:** Verified `.pdf` MIME type against allowed formats (`PDF`, `DOCX`, `TXT`).
2. **Text & Metadata Extraction:** `pypdf` extracted text, page boundaries, and section headers.
3. **SOP ID Preservation:** Standardized regex `(SOP-[A-Z]+-\d+)` extracted `SOP-MNT-001` and `SOP-IT-002` as primary database identifiers.
4. **Duplicate Prevention:** Before creating database rows or storage files, the pipeline verifies whether a document with the same `id` or `filename` already exists. A re-upload triggers an `HTTP 409 Conflict` exception.
5. **Granular Section-Aware Chunking:**
   * Text split into semantically cohesive chunks of target size 700 characters with 120-character overlap.
   * `SOP-MNT-001`: Chunked into **27 distinct chunks** preserving all 12 sections and table rows.
   * `SOP-IT-002`: Chunked into **24 distinct chunks** preserving all 12 sections and diagnostic workflows.
6. **Vector Store Ingestion:** Chunks and metadata persisted into ChromaDB collection `opera_sop_knowledge`. Total collection count reached **77 chunks** across 8 enterprise procedures.

---

## 4. Test Suite Execution & Detailed Audit Results

The test suite executed 14 specific scenarios directly against the application's `RAGService.process_query()`. All 14 tests completed with **100% pass rate**.

### Test Group A: SOP-MNT-001 (Industrial Machine Maintenance)

| Test ID | Query | Expected Source | Actual Top Match | Relevance | Grounded? | Status |
|---|---|---|---|---|---|---|
| **A1** | *What is the purpose of preventive maintenance?* | `SOP-MNT-001` | `SOP-MNT-001 (P1 1. Purpose)` | 0.907 | Yes | **PASS** |
| **A2** | *What checks are included in the inspection process?* | `SOP-MNT-001` | `SOP-MNT-001 (P3 7. Comprehensive Inspection Checklist)` | 0.787 | Yes | **PASS** |
| **A3** | *What should an operator do when a machine fault is identified?* | `SOP-MNT-001` | `SOP-MNT-001 (P3 8. Common Faults & Corrective Actions)` | 0.760 | Yes | **PASS** |
| **A4** | *When should an issue be escalated?* | `SOP-MNT-001` | `SOP-MNT-001 (P3 9. Escalation Procedure)` | 0.812 | Yes | **PASS** |

### Test Group B: SOP-IT-002 (IT Network Troubleshooting)

| Test ID | Query | Expected Source | Actual Top Match | Relevance | Grounded? | Status |
|---|---|---|---|---|---|---|
| **B1** | *What information should be collected when reporting a network issue?* | `SOP-IT-002` | `SOP-IT-002 (P1 5. Mandatory Information Collection)` | 0.840 | Yes | **PASS** |
| **B2** | *What are the troubleshooting steps for a connectivity problem?* | `SOP-IT-002` | `SOP-IT-002 (P1 5. Mandatory Information Collection)` | 0.825 | Yes | **PASS** |
| **B3** | *How should an unresolved network incident be escalated?* | `SOP-IT-002` | `SOP-IT-002 (P3 8. Incident Escalation Protocol)` | 0.885 | Yes | **PASS** |
| **B4** | *How is resolution verified?* | `SOP-IT-002` | `SOP-IT-002 (P3 10. Resolution Verification Workflow)` | 0.875 | Yes | **PASS** |

### Test Group C: Cross-Document Retrieval (Both SOPs)

| Test ID | Query | Expected Documents | Retrieved Documents | Relevance | Grounded? | Status |
|---|---|---|---|---|---|---|
| **C1** | *Compare the escalation processes in both SOPs.* | `SOP-MNT-001` & `SOP-IT-002` | `SOP-MNT-001` & `SOP-IT-002` | 0.812 / 0.795 | Yes | **PASS** |
| **C2** | *What documentation is required in each process?* | `SOP-MNT-001` & `SOP-IT-002` | `SOP-IT-002` & `SOP-MNT-001` | 0.820 / 0.785 | Yes | **PASS** |
| **C3** | *Which roles are responsible for reporting issues in both processes?* | `SOP-MNT-001` & `SOP-IT-002` | `SOP-MNT-001` & `SOP-IT-002` | 0.890 / 0.885 | Yes | **PASS** |

### Test Group D: Negative Testing (Out-of-Scope & Ambiguous)

| Test ID | Query | Scenario Type | Grounded? | Citations | System Behavior | Status |
|---|---|---|---|---|---|---|
| **D1** | *What is the recipe for baking chocolate chip cookies?* | Unrelated domain (Culinary) | **No** (False) | 0 (Empty) | Explicitly refused. Stated topic is outside indexed SOP repository. Zero fabricated steps. | **PASS** |
| **D2** | *What is the procedure for launching an orbital rocket into outer space?* | Non-existent technical SOP (Aerospace) | **No** (False) | 0 (Empty) | Explicitly refused. Stated procedure does not exist in knowledge base. Listed available SOPs. | **PASS** |
| **D3** | *How do I fix it?* | Ambiguous context | **No** (False) | 0 (Empty) | Refused without context. Prompted user to clarify whether domain is Industrial Machinery or IT Network. | **PASS** |

---

## 5. How to Run and Demonstrate the Application

### 1. Launch the Backend API Server
```powershell
# In PowerShell from the project root:
c:\Users\test\Documents\sopagent\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
* Backend API Documentation: `http://localhost:8000/docs`
* Health Check Endpoint: `http://localhost:8000/api/health`

### 2. Launch the React Frontend
```powershell
# Set Node in PATH and run Vite dev server:
$env:Path = "c:\Users\test\Documents\sopagent\.tools\node;" + $env:Path
cd frontend
npm run dev
```
* Frontend Application URL: `http://localhost:5173`

### 3. Re-run the Automated SOP Test Suite
```powershell
# From the project root:
c:\Users\test\Documents\sopagent\.venv\Scripts\python.exe backend/tests/run_sop_test_suite.py
```

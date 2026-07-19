# Demo Dataset

This folder contains a synthetic EPC dataset for demonstrating NexusEPC AI without needing confidential project files.

## Why synthetic data?

For this prototype, you do not need to train a model from scratch. The current architecture is based on:

- RAG over project documents.
- Structured compliance test cases.
- Schedule risk analytics.
- LLM reasoning over retrieved or submitted context.

Real data centre EPC documents are usually confidential, so a synthetic dataset is the safest and fastest way to build a convincing hackathon demo. Later, this dataset can be replaced or extended with real project specifications, vendor submittals, RFI logs, schedules, commissioning records, and procurement trackers.

## Dataset Files

### Core Structured CSV Registers (in `/datasets/`)

*   `vendor_register.csv`: 40 vendors with contact info, lead times, and ratings.
*   `project_schedule.csv`: 60 Primavera-style CPM activities with float and dependencies.
*   `equipment_register.csv`: 500 hyperscale assets with tag IDs, rooms, voltage, dimensions, and weights.
*   `document_control_register.csv`: 300 engineering drawings, revisions, and approval statuses.
*   `rfi_register.csv`: 50 RFIs mapping questions, answers, and linked equipment.
*   `commissioning_register.csv`: 200 Level 1 to 5 commissioning logs.
*   `procurement_tracker.csv`: Shipping containers, shipment logs, and customs delays.
*   `ncr_register.csv`: NCR quality registers.
*   `inspection_register.csv`: Checklists for MEP walkdowns.
*   `risk_register.csv`: Risk scoring.
*   `meeting_register.csv`: Coordination MOM registers.

### RAG Technical Document Corpus (in `/datasets/knowledge_base/`)

*   `01` to `22` `.txt` files containing:
    *   `01_project_information_register.txt`: Main project master data.
    *   `02_ups_technical_specification.txt`: 14-clause UPS specification (N+1 requirement, 15m runtime).
    *   `03_vendor_submittal_ups_powergridsystems.txt`: The non-compliant proposal with 5 hidden deviations.
    *   `04_rfi_log.txt` & `05_meeting_minutes_mom013.txt`: Project communication and FAT failure reports.
    *   `06_ncr_el_001_ups_submittal.txt`: Active non-conformance logging.
    *   `07_project_schedule_cpm.txt` & `09_procurement_status_register.txt`: Schedule path logic and delay tracking.
    *   `11_company_profile_and_org_chart.txt` to `19_daily_site_diary.txt`: Site diary logs, TIMELINE narration, WSP/Tata Projects org chart, Cummins generator submittals, and emails.
    *   `20_judge_demo_questions_200.txt` & `21_end_to_end_demo_story_script.txt`: Demo guides.
    *   `22_ground_truth_and_citations_benchmark.txt`: Ground truth RAG benchmarks and adversarial questions.


## How to Use

### 1. Compliance Agent

Open the frontend compliance page and paste:

- Specification: `project_specification_ups_switchgear.txt`
- Vendor submittal: `vendor_submittal_ups_noncompliant.txt`

Expected findings:

- UPS redundancy is `N` instead of required `N+1`.
- Battery autonomy is 10 minutes instead of required 15 minutes.
- Bypass synchronization tolerance is wider than allowed.
- Factory witness test documentation is incomplete.

### 2. Schedule Risk Engine

Use `api_payloads/schedule_payload.json` as the request body for:

```http
POST /api/v1/schedule/analyze
```

Expected findings:

- Delayed switchgear procurement affects installation and integrated systems testing.
- Open RFI on short-circuit rating creates an approval risk.
- UPS compliance issue can delay commissioning readiness.

### 3. Knowledge Copilot

Upload or ingest these files as project documents:

- `project_specification_ups_switchgear.txt`
- `rfi_log.csv`
- `procurement_status.csv`
- `commissioning_checklist.csv`

Then ask:

```text
What is the required UPS autonomy?
Which equipment is at risk for commissioning?
What RFIs affect electrical procurement?
What commissioning tests are required before IST?
```

## How to Expand This Dataset

Add more examples in five categories:

1. **Specifications**: UPS, switchgear, generators, cooling towers, chillers, fire detection, BMS, structured cabling.
2. **Vendor submittals**: compliant and non-compliant versions for each equipment package.
3. **Schedule records**: activities, dependencies, float, baseline dates, forecast dates, delay reasons.
4. **Quality records**: inspection checklists, NCRs, test reports, commissioning scripts.
5. **RFI/change records**: questions, answers, affected clauses, affected schedule activities.

For a stronger evaluation dataset, label each compliance case with:

- Requirement ID.
- Expected vendor value.
- Expected compliance status.
- Expected severity.
- Ground-truth explanation.


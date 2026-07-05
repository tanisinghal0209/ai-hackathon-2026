# Demo Dataset

This folder contains a synthetic EPC dataset for demonstrating the AI Intelligence Platform without needing confidential project files.

## Why synthetic data?

For this prototype, you do not need to train a model from scratch. The current architecture is based on:

- RAG over project documents.
- Structured compliance test cases.
- Schedule risk analytics.
- LLM reasoning over retrieved or submitted context.

Real data centre EPC documents are usually confidential, so a synthetic dataset is the safest and fastest way to build a convincing hackathon demo. Later, this dataset can be replaced or extended with real project specifications, vendor submittals, RFI logs, schedules, commissioning records, and procurement trackers.

## Dataset Files

| File | Purpose |
| --- | --- |
| `project_specification_ups_switchgear.txt` | Project requirements for UPS, switchgear, generators, cooling, commissioning, and documentation. Use this for RAG ingestion and compliance testing. |
| `vendor_submittal_ups_noncompliant.txt` | Vendor submittal with intentional deviations. Use this with the compliance agent. |
| `schedule_activities.json` | EPC activity list with dependencies, procurement status, RFIs, and compliance issue signals. Use this with the schedule risk endpoint. |
| `rfi_log.csv` | Example RFI register for project knowledge and schedule-risk context. |
| `procurement_status.csv` | Example procurement tracker for long-lead equipment. |
| `commissioning_checklist.csv` | Example commissioning QA checklist. |
| `api_payloads/compliance_payload.json` | Ready-to-send request body for `/api/v1/compliance/analyze`. |
| `api_payloads/schedule_payload.json` | Ready-to-send request body for `/api/v1/schedule/analyze`. |

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


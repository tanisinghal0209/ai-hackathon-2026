/**
 * Single source of truth for EPC AI Platform — Phoenix DC-01 project.
 * Documents, Compliance Findings, and Risks all cross-reference each other
 * via document_id and requirement_id fields.
 */

// ─── Project Metadata ───────────────────────────────────────────────────────

export const PROJECT = {
  name: 'Phoenix DC-01',
  code: 'PHX-DC-01',
  client: 'NxtGen Cloud Infrastructure Ltd',
  contractor: 'Tata Projects Limited',
  consultant: 'Jacobs Engineering Group',
  location: 'Navi Mumbai, Maharashtra',
  capacity: '10MW IT Load, Tier IV',
};

// ─── Team Members ───────────────────────────────────────────────────────────

export const TEAM = {
  electrical_engineer: { name: 'Deepak Nambiar', id: 'TPL-006', hash: 'ea82d091' },
  lead_mep: { name: 'Rahul Desai', id: 'JAC-001', hash: 'cf8762a4' },
  project_manager: { name: 'Vikram Sharma', id: 'TPL-002', hash: 'b492ef01' },
  qa_manager: { name: 'Kavya Reddy', id: 'TPL-005', hash: '99c7fde2' },
  civil_engineer: { name: 'Suresh Pillai', id: 'TPL-008', hash: 'a341bc09' },
  mechanical_engineer: { name: 'Ananya Iyer', id: 'TPL-010', hash: 'f72de341' },
  doc_controller: { name: 'Shreya Joshi', id: 'TPL-011', hash: 'd8c3fa12' },
};

// ─── Documents ──────────────────────────────────────────────────────────────

export interface DocMeta {
  projectId?: string;
  document_id: string;
  filename: string;
  title: string;
  category: 'Specification' | 'Submittal' | 'Testing Report' | 'Inspection Report' | 'Commissioning Procedure' | 'Procurement Register' | 'NCR' | 'Meeting Minutes' | 'RFI Log' | 'Schedule';
  status: 'indexed' | 'processing' | 'failed';
  page_count: number;
  file_size: number;         // bytes
  rev: string;
  discipline: string;
  prepared_by: keyof typeof TEAM;
  checked_by: keyof typeof TEAM;
  approved_by: keyof typeof TEAM;
  doc_ref: string;
  date_issued: string;
  ai_chunks: number;
  stamp: 'APPROVED FOR CONSTRUCTION' | 'ISSUED FOR REVIEW' | 'FOR INFORMATION ONLY' | 'APPROVED AS NOTED';
  controlled_copy: string;
  /** Short summary of what this document contains (shown on cover page) */
  abstract: string;
  /** Sections/headings used to populate inner pages */
  sections: { heading: string; body: string }[];
  /** Which compliance requirements this doc covers */
  related_requirements: string[];
  /** Which risk IDs this doc is evidence for */
  related_risks: string[];
}

export const DOCUMENTS: DocMeta[] = [
  {
    document_id: 'doc-001',
    filename: 'PHX-DC-01-EL-SPEC-002_UPS_Specification.pdf',
    title: 'TECHNICAL SPECIFICATION FOR UNINTERRUPTIBLE POWER SUPPLY (UPS)',
    category: 'Specification',
    status: 'indexed',
    page_count: 24,
    file_size: 21535,
    rev: 'B',
    discipline: 'Electrical',
    prepared_by: 'electrical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-EL-SPEC-002',
    date_issued: '22 Oct 2025',
    ai_chunks: 154,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CONTROLLED COPY NO: 04 | SHREYA JOSHI (DOC CONTROL)',
    abstract: 'Specifies technical requirements for the 2N UPS system serving IT loads at Phoenix DC-01. Covers redundancy topology, battery autonomy, output voltage, IEC compliance, FAT/SAT requirements and O&M handover.',
    sections: [
      { heading: '1.0 SCOPE OF SUPPLY', body: 'This specification covers the supply, installation, testing and commissioning of the Uninterruptible Power Supply (UPS) system for Phoenix DC-01 data centre. The system shall be rated for a minimum 2MW IT load with N+1 module redundancy.' },
      { heading: '2.0 APPLICABLE STANDARDS', body: 'IEC 62040-1: Safety Requirements. IEC 62040-2: EMC Requirements. IEC 62040-3: Performance Classification VFI-SS-111. EN 50091-1. IS 16046.' },
      { heading: '3.0 REDUNDANCY REQUIREMENTS', body: 'REQ-UPS-001: The UPS system shall be configured in N+1 module redundancy to ensure continuous power delivery under single-point-of-failure conditions. Static bypass shall be included.' },
      { heading: '4.0 BATTERY AUTONOMY', body: 'REQ-UPS-002: Battery string shall provide a minimum 15-minute backup at 100% IT load (2MW). End-of-life capacity at 80% DoD, 20°C ambient. VRLA or Li-Ion cells acceptable.' },
      { heading: '5.0 ELECTRICAL OUTPUT', body: 'REQ-UPS-003: Output voltage shall be 415V ±1%, 3-phase, 4-wire + PE, 50Hz ±0.1%. Total Harmonic Distortion (THDv) shall not exceed 2% at linear load.' },
      { heading: '6.0 STANDARDS COMPLIANCE', body: 'REQ-UPS-004: Vendor must provide test certificates confirming compliance with IEC 62040-3 VFI-SS-111 classification. Both IEC 62040-1 (safety) and IEC 62040-2 (EMC) certificates required at submittal stage.' },
    ],
    related_requirements: ['REQ-UPS-001', 'REQ-UPS-002', 'REQ-UPS-003', 'REQ-UPS-004', 'REQ-UPS-005'],
    related_risks: ['R-EL-01', 'R-EL-03'],
  },
  {
    document_id: 'doc-002',
    filename: 'PHX-DC-01-EL-SUB-002_Vertiv_UPS_Submittal.pdf',
    title: 'VENDOR TECHNICAL SUBMITTAL — VERTIV LIEBERT EXL S1 UPS SYSTEM',
    category: 'Submittal',
    status: 'indexed',
    page_count: 18,
    file_size: 18907,
    rev: '01',
    discipline: 'Electrical',
    prepared_by: 'electrical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-EL-SUB-002',
    date_issued: '10 Nov 2025',
    ai_chunks: 112,
    stamp: 'ISSUED FOR REVIEW',
    controlled_copy: 'CONTROLLED COPY NO: 01 | RAHUL DESAI (MEP LEAD)',
    abstract: 'Technical submittal from Vertiv for the Liebert EXL S1 2000kVA UPS. Details proposed configuration, battery runtime data sheets, test declarations and deviation register.',
    sections: [
      { heading: '1.0 PROPOSED CONFIGURATION', body: 'Vertiv proposes three (3) × 800kVA Liebert EXL S1 modules in parallel-N configuration. Note: specification requires N+1 — this submittal presents N topology as standard lead-time option. Revised N+1 pricing enclosed as Appendix C.' },
      { heading: '2.0 BATTERY DATA', body: 'VRLA batteries, 10-minute autonomy at 100% load (2000kVA / 0.9 PF = 1800kW). Extended runtime kit (ERK-200) adds 5 additional minutes for a total of 15 min — ERK-200 is available as optional line item (see Appendix B BOM).' },
      { heading: '3.0 OUTPUT SPECIFICATIONS', body: 'Output: 415V ±1%, 3Φ, 4W+PE, 50Hz ±0.05Hz. THDv < 1% linear, < 3% non-linear. Compliant with IEC 62040-3 VFI-SS-111.' },
      { heading: '4.0 DEVIATIONS REGISTER', body: 'DEV-001: Redundancy topology — N proposed vs N+1 specified. Cost impact for N+1: +₹48 Lakhs. Lead time for additional module: 14 weeks. DEV-002: Battery autonomy — 10 min base vs 15 min required. ERK-200 resolves this.' },
    ],
    related_requirements: ['REQ-UPS-001', 'REQ-UPS-002', 'REQ-UPS-003', 'REQ-UPS-004'],
    related_risks: ['R-EL-01', 'R-EL-03'],
  },
  {
    document_id: 'doc-003',
    filename: 'PHX-DC-01-EL-FAT-002_UPS_FAT_Test_Report.pdf',
    title: 'FACTORY ACCEPTANCE TEST REPORT — UPS SYSTEM (VERTIV LIEBERT EXL S1)',
    category: 'Testing Report',
    status: 'indexed',
    page_count: 15,
    file_size: 14308,
    rev: 'A',
    discipline: 'Electrical',
    prepared_by: 'electrical_engineer',
    checked_by: 'qa_manager',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-EL-FAT-002',
    date_issued: '05 Jan 2026',
    ai_chunks: 88,
    stamp: 'APPROVED AS NOTED',
    controlled_copy: 'CONTROLLED COPY NO: 02 | KAVYA REDDY (QA/QC)',
    abstract: 'FAT conducted at Vertiv Pune facility on 02–03 January 2026. Witnesses: Deepak Nambiar (TPL), Kavya Reddy (TPL QA), Rahul Desai (Jacobs). Results: PASSED with 2 open observations.',
    sections: [
      { heading: '1.0 TEST OVERVIEW', body: 'FAT performed at Vertiv Manufacturing, Pune, India. Date: 02–03 Jan 2026. Tests conducted per IEC 62040-3 and PHX-DC-01-EL-SPEC-002 requirements.' },
      { heading: '2.0 LOAD TEST RESULTS', body: '100% full-load test: PASS. Output voltage 414.8V (within ±1%). THDv: 0.8% (Pass). Efficiency at full load: 96.2% (exceeds 96% minimum). Bypass transfer time: 2ms (Pass).' },
      { heading: '3.0 BATTERY AUTONOMY TEST', body: 'Battery discharge test performed at 100% load. Autonomy measured: 10 min 22 sec. Specification requirement: 15 min. OBSERVATION OBS-FAT-001: Autonomy shortfall confirmed — ERK-200 extension kits to be procured and factory-fitted before dispatch.' },
      { heading: '4.0 OPEN OBSERVATIONS', body: 'OBS-FAT-001 (OPEN): Battery autonomy 10 min vs 15 min required. Resolution: ERK-200 to be fitted. OBS-FAT-002 (OPEN): Minor paint defect on cabinet panel — cosmetic rework required before dispatch.' },
    ],
    related_requirements: ['REQ-UPS-002', 'REQ-UPS-003'],
    related_risks: ['R-EL-03'],
  },
  {
    document_id: 'doc-004',
    filename: 'PHX-DC-01-EL-NCR-001_UPS_Battery_NCR.pdf',
    title: 'NON-CONFORMANCE REPORT — UPS BATTERY AUTONOMY DEFICIT (NCR-EL-001)',
    category: 'NCR',
    status: 'indexed',
    page_count: 8,
    file_size: 13481,
    rev: 'A',
    discipline: 'Electrical',
    prepared_by: 'qa_manager',
    checked_by: 'electrical_engineer',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-EL-NCR-001',
    date_issued: '08 Jan 2026',
    ai_chunks: 54,
    stamp: 'FOR INFORMATION ONLY',
    controlled_copy: 'CONTROLLED COPY NO: 01 | KAVYA REDDY (QA/QC)',
    abstract: 'NCR raised following FAT finding that UPS battery autonomy (10 min) does not meet specification requirement of 15 min (REQ-UPS-002). Corrective action: procurement of ERK-200 battery extension kits.',
    sections: [
      { heading: '1.0 NON-CONFORMANCE DESCRIPTION', body: 'During FAT (ref: PHX-DC-01-EL-FAT-002), UPS battery autonomy measured at 10 minutes 22 seconds at 100% IT load (2MW). Specification PHX-DC-01-EL-SPEC-002 REQ-UPS-002 requires minimum 15 minutes. Shortfall: 4 min 38 sec.' },
      { heading: '2.0 ROOT CAUSE', body: 'Vendor Vertiv submitted base configuration without Extended Runtime Kit (ERK-200). ERK-200 was noted as optional item in submittal DEV-002 but was not included in PO scope. BOM omission at procurement stage.' },
      { heading: '3.0 CORRECTIVE ACTION', body: 'CA-001: Raise change order for ERK-200 battery extension kits (Qty: 6 strings per UPS frame). CA-002: Vendor to re-test autonomy post-installation at Pune facility. CA-003: Updated FAT report to be issued as Rev B.' },
    ],
    related_requirements: ['REQ-UPS-002'],
    related_risks: ['R-EL-03'],
  },
  {
    document_id: 'doc-005',
    filename: 'PHX-DC-01-CX-SCH-001_IST_Master_Procedure.pdf',
    title: 'INTEGRATED SYSTEMS TESTING (IST) MASTER PROCEDURE — ELECTRICAL & MECHANICAL',
    category: 'Commissioning Procedure',
    status: 'indexed',
    page_count: 32,
    file_size: 28900,
    rev: 'A',
    discipline: 'Commissioning',
    prepared_by: 'electrical_engineer',
    checked_by: 'mechanical_engineer',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-CX-SCH-001',
    date_issued: '15 Dec 2025',
    ai_chunks: 198,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CONTROLLED COPY NO: 03 | SHREYA JOSHI (DOC CONTROL)',
    abstract: 'Master IST procedure for full integrated testing of UPS, switchgear, cooling, fire suppression and BMS. Defines test sequence, hold points, witness requirements, and pass/fail criteria.',
    sections: [
      { heading: '1.0 IST SEQUENCE', body: 'Phase 1: Individual system pre-commissioning. Phase 2: Subsystem integration checks. Phase 3: Full black-start test. Phase 4: Resilience and failover testing. Phase 5: 72-hour operational soak.' },
      { heading: '2.0 HOLD POINTS', body: 'HP-01: Civil structure signed off before MEP installation. HP-02: All electrical FAT completed before SAT. HP-03: Fire suppression system commissioned before IT load energisation. HP-04: Client witness required for black-start.' },
      { heading: '3.0 PASS/FAIL CRITERIA', body: 'All systems must achieve: Power path continuity verified. Switchover time UPS-to-Bypass ≤ 4ms. Generator start-to-load ≤ 10 seconds. Cooling redundancy demonstrated. BMS alarms verified.' },
    ],
    related_requirements: ['REQ-IST-001', 'REQ-IST-002', 'REQ-CX-001'],
    related_risks: ['R-PR-01'],
  },
  {
    document_id: 'doc-006',
    filename: 'PHX-DC-01-EL-SPEC-001_MV_Switchgear_Specification.pdf',
    title: 'TECHNICAL SPECIFICATION FOR 11kV MEDIUM VOLTAGE SWITCHGEAR',
    category: 'Specification',
    status: 'indexed',
    page_count: 20,
    file_size: 18400,
    rev: 'B',
    discipline: 'Electrical',
    prepared_by: 'electrical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-EL-SPEC-001',
    date_issued: '18 Sep 2025',
    ai_chunks: 130,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CONTROLLED COPY NO: 05 | SHREYA JOSHI (DOC CONTROL)',
    abstract: 'Technical specification for the 11kV MV switchgear serving the primary and secondary distribution rings. Covers fault level ratings, protection relays, IEC standards, busbar sizing and arc flash mitigation.',
    sections: [
      { heading: '1.0 SWITCHGEAR RATINGS', body: 'Rated voltage: 11kV. Rated current: 1250A. Short-circuit withstand: 25kA for 1 second. IP54 ingress protection. SF6-free VCB technology required.' },
      { heading: '2.0 PROTECTION RELAY', body: 'Each feeder shall have a numerical multifunction relay. Minimum functions: overcurrent (50/51), earth fault (50N/51N), distance (21), auto-reclose (79). SCADA interface: IEC 61850 GOOSE messaging.' },
      { heading: '3.0 DELIVERY CONCERN', body: 'RFI-EL-003 raised: Supplier ABB confirms 18-week manufacturing lead time from date of PO. Current programme requires delivery in 12 weeks. Expedite measures under evaluation.' },
    ],
    related_requirements: ['REQ-MV-001', 'REQ-MV-002', 'REQ-MV-003'],
    related_risks: ['R-EL-02'],
  },
  {
    document_id: 'doc-007',
    filename: 'PHX-DC-01-ME-SPEC-001_Chiller_Specification.pdf',
    title: 'CENTRIFUGAL CHILLER TECHNICAL SPECIFICATION — COOLING PLANT',
    category: 'Specification',
    status: 'indexed',
    page_count: 22,
    file_size: 21000,
    rev: 'A',
    discipline: 'Mechanical',
    prepared_by: 'mechanical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-ME-SPEC-001',
    date_issued: '30 Aug 2025',
    ai_chunks: 143,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CONTROLLED COPY NO: 02 | ANANYA IYER (MECH LEAD)',
    abstract: 'Specification for centrifugal chillers serving the PHX-DC-01 cooling plant. 2N+1 redundancy topology. Covers COP targets, IPLV, refrigerant type (R-134a), VFD requirements and chiller controls integration.',
    sections: [
      { heading: '1.0 CAPACITY AND REDUNDANCY', body: 'Total cooling load: 8.5MW. Three (3) × 3MW chillers in 2N+1 configuration. Each chiller independently served with primary and standby chilled water pumps.' },
      { heading: '2.0 EFFICIENCY REQUIREMENTS', body: 'COP at AHRI rated conditions: minimum 6.1. IPLV: minimum 9.2. Compressor: variable-speed magnetic bearing centrifugal. Refrigerant: R-134a (low GWP transition to HFO-1234ze on next procurement cycle).' },
      { heading: '3.0 CONTROLS AND BMS', body: 'Each chiller shall be provided with factory-fitted controls panel with Modbus TCP and BACnet/IP interfaces. Integration with site BMS (Schneider EcoStruxure) via BACnet/IP. Demand-based load balancing algorithm required.' },
    ],
    related_requirements: ['REQ-ME-001', 'REQ-ME-002', 'REQ-ME-003'],
    related_risks: ['R-ME-01'],
  },
  {
    document_id: 'doc-008',
    filename: 'PHX-DC-01-FP-SPEC-001_Fire_Protection_Specification.pdf',
    title: 'FIRE PROTECTION & CLEAN AGENT SUPPRESSION SYSTEM SPECIFICATION',
    category: 'Specification',
    status: 'indexed',
    page_count: 16,
    file_size: 15200,
    rev: 'A',
    discipline: 'Fire & Life Safety',
    prepared_by: 'qa_manager',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-FP-SPEC-001',
    date_issued: '05 Sep 2025',
    ai_chunks: 104,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CONTROLLED COPY NO: 01 | SHREYA JOSHI (DOC CONTROL)',
    abstract: 'Specifies fire detection (VESDA HSSD), clean agent suppression (FM-200 / Novec 1230), manual call points, and integration with BMS and access control for all critical spaces.',
    sections: [
      { heading: '1.0 DETECTION SYSTEM', body: 'Very Early Smoke Detection Apparatus (VESDA) LaserPLUS to be installed in all data halls, MV rooms, UPS rooms and battery rooms. Alarm thresholds: Alert at 0.05% obs/m, Action at 0.1% obs/m.' },
      { heading: '2.0 SUPPRESSION SYSTEM', body: 'Clean agent FM-200 (HFC-227ea) primary. Novec 1230 considered as alternate. Concentration: 7% by volume (design 8.5% for 10% safety margin). Hold time: 10 minutes post-discharge.' },
      { heading: '3.0 BMS INTEGRATION', body: 'Suppression panel to provide volt-free contacts to BMS for: Pre-alarm, Alarm, Discharge, Fault. BMS to trigger AHU shutdown and damper closure on discharge command.' },
    ],
    related_requirements: ['REQ-FP-001', 'REQ-FP-002'],
    related_risks: [],
  },
  {
    document_id: 'doc-009',
    filename: 'PHX-DC-01-CV-RPT-001_Civil_Structural_Inspection.pdf',
    title: 'CIVIL STRUCTURAL INSPECTION REPORT — FOUNDATIONS & RAISED FLOOR',
    category: 'Inspection Report',
    status: 'indexed',
    page_count: 14,
    file_size: 12800,
    rev: 'A',
    discipline: 'Civil',
    prepared_by: 'civil_engineer',
    checked_by: 'qa_manager',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-CV-RPT-001',
    date_issued: '20 Nov 2025',
    ai_chunks: 76,
    stamp: 'APPROVED AS NOTED',
    controlled_copy: 'CONTROLLED COPY NO: 01 | SURESH PILLAI (CIVIL)',
    abstract: 'Structural inspection of raft foundations, slab-on-grade and raised floor system. Confirms curing progress, slab levelness tolerances and capacity for UPS battery bank weight loading.',
    sections: [
      { heading: '1.0 FOUNDATION STATUS', body: 'Raft foundation: Complete. 28-day cube compressive strength achieved 38.5 MPa (design: 35 MPa). No visible cracks or settlement observed. Waterproofing membrane (Sika Proof) applied and tested.' },
      { heading: '2.0 RAISED FLOOR', body: 'Raised floor pedestals installed at 600mm grid. Uniformly distributed load (UDL) capacity: 12 kN/m². Concentrated load capacity: 4.5 kN per pedestal. UPS battery bank maximum floor loading: 11.8 kN/m² — within allowable limits.' },
      { heading: '3.0 OPEN ITEMS', body: 'CI-001 (OPEN): Curing of secondary slab in generator yard still in progress. Estimated completion: 15 Jan 2026. Generator installation cannot commence until CI-001 is closed. This creates a 5-day delay to critical path.' },
    ],
    related_requirements: ['REQ-CV-001'],
    related_risks: ['R-CV-01'],
  },
  {
    document_id: 'doc-010',
    filename: 'PHX-DC-01-PMO-RFI-LOG_v3.pdf',
    title: 'REQUEST FOR INFORMATION LOG — PHX-DC-01 (ALL DISCIPLINES)',
    category: 'RFI Log',
    status: 'indexed',
    page_count: 12,
    file_size: 10900,
    rev: '3',
    discipline: 'PMO',
    prepared_by: 'doc_controller',
    checked_by: 'project_manager',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-PMO-RFI-LOG',
    date_issued: '10 Jan 2026',
    ai_chunks: 68,
    stamp: 'FOR INFORMATION ONLY',
    controlled_copy: 'CONTROLLED COPY NO: 03 | SHREYA JOSHI (DOC CONTROL)',
    abstract: 'Master RFI log tracking all formal requests for information across civil, electrical, mechanical and commissioning disciplines. 12 RFIs open, 6 closed.',
    sections: [
      { heading: 'RFI-EL-001 (CLOSED)', body: 'Query: Confirm grounding arrangement for UPS neutral. Response: Solid earthing per IS 3043. Status: CLOSED 12 Oct 2025.' },
      { heading: 'RFI-EL-002 (OPEN)', body: 'Query: UPS redundancy module — N+1 or N configuration for final order? Status: OPEN. Due: 20 Jan 2026. Owner: Deepak Nambiar.' },
      { heading: 'RFI-EL-003 (OPEN)', body: 'Query: MV switchgear delivery — can 18-week lead be expedited to 12 weeks? ABB Response: Possible with premium freight surcharge. Cost: +₹12 Lakhs. Status: OPEN — pending commercial approval.' },
      { heading: 'RFI-ME-001 (OPEN)', body: 'Query: Confirm chiller COP at 35°C ambient (vs AHRI standard 29°C). Response pending from Carrier. Status: OPEN. Due: 25 Jan 2026.' },
    ],
    related_requirements: ['REQ-UPS-001', 'REQ-MV-001'],
    related_risks: ['R-EL-01', 'R-EL-02'],
  },
  {
    document_id: 'doc-011',
    filename: 'PHX-DC-01-PMO-PROC-REG_Procurement_Register.pdf',
    title: 'PROCUREMENT STATUS REGISTER — LONG-LEAD EQUIPMENT',
    category: 'Procurement Register',
    status: 'indexed',
    page_count: 10,
    file_size: 9800,
    rev: '5',
    discipline: 'PMO',
    prepared_by: 'doc_controller',
    checked_by: 'project_manager',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-PMO-PROC-REG',
    date_issued: '12 Jan 2026',
    ai_chunks: 62,
    stamp: 'FOR INFORMATION ONLY',
    controlled_copy: 'CONTROLLED COPY NO: 05 | VIKRAM SHARMA (PM)',
    abstract: 'Tracks purchase order status, delivery dates, and critical lead items for the project. 3 items on critical path. Generator set procurement delayed by customs clearance.',
    sections: [
      { heading: 'ITEM 1: UPS System (Vertiv Liebert EXL S1)', body: 'PO No: TPL-PO-EL-0021. Vendor: Vertiv India Pvt Ltd. Value: ₹3.8 Cr. Delivery: 14 Feb 2026. Status: Manufacturing. Issue: ERK-200 battery kit add-on under change order CO-EL-003.' },
      { heading: 'ITEM 2: MV Switchgear (ABB UniGear ZS1)', body: 'PO No: TPL-PO-EL-0019. Vendor: ABB Ltd. Value: ₹2.1 Cr. Lead time: 18 weeks from PO date (21 Oct 2025). Delivery: 20 Feb 2026. Programme requires 12 Feb. DELAY RISK: 8 days.' },
      { heading: 'ITEM 3: Diesel Generator Sets (Cummins C2500D5)', body: 'PO No: TPL-PO-EL-0023. Vendor: Cummins India. Value: ₹5.6 Cr. Status: DELAYED. Customs clearance at JNPT delayed 3 weeks. Current ETA: 28 Feb 2026. Critical path impact: 15 days.' },
    ],
    related_requirements: [],
    related_risks: ['R-PR-01', 'R-EL-02'],
  },
  {
    document_id: 'doc-012',
    filename: 'PHX-DC-01-PMO-MOM-003_Weekly_Meeting_Minutes.pdf',
    title: 'WEEKLY PROGRESS MEETING MINUTES — MEETING 003',
    category: 'Meeting Minutes',
    status: 'indexed',
    page_count: 8,
    file_size: 7600,
    rev: 'A',
    discipline: 'PMO',
    prepared_by: 'doc_controller',
    checked_by: 'project_manager',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-PMO-MOM-003',
    date_issued: '13 Jan 2026',
    ai_chunks: 48,
    stamp: 'FOR INFORMATION ONLY',
    controlled_copy: 'CONTROLLED COPY NO: 01 | SHREYA JOSHI (DOC CONTROL)',
    abstract: 'Minutes of weekly progress meeting held 13 Jan 2026. Attendees: TPL, NxtGen client team, Jacobs consultant. Key decisions: expedite generator customs, escalate NCR-EL-001 to vendor MD level.',
    sections: [
      { heading: 'AGENDA ITEM 1: UPS NCR Resolution', body: 'NCR-EL-001 discussed. Vertiv committed to fit ERK-200 extension kits at factory by 30 Jan 2026. Re-FAT date agreed: 02 Feb 2026. Client NxtGen team to be invited as witness.' },
      { heading: 'AGENDA ITEM 2: Generator Delivery', body: 'Customs clearance delay discussed. TPL procurement team to engage a licensed customs agent (CHA) to expedite. Cost: ₹1.5 Lakhs. Expected clearance: 18 Jan 2026 (revised). Site arrival: 22 Jan 2026.' },
      { heading: 'AGENDA ITEM 3: Schedule Review', body: 'Current overall programme: 8 days behind baseline. Critical path: Generator installation → Cabling → IST. Civil yard curing delay adds 5 days. Action: Overlap generator installation with parallel cable pulling where possible.' },
    ],
    related_requirements: [],
    related_risks: ['R-PR-01', 'R-CV-01'],
  },
  {
    document_id: 'doc-013',
    filename: 'PHX-DC-01-ME-SUB-001_Carrier_Chiller_Submittal.pdf',
    title: 'VENDOR TECHNICAL SUBMITTAL — CARRIER 19XR CENTRIFUGAL CHILLER',
    category: 'Submittal',
    status: 'indexed',
    page_count: 20,
    file_size: 19200,
    rev: '01',
    discipline: 'Mechanical',
    prepared_by: 'mechanical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-ME-SUB-001',
    date_issued: '15 Nov 2025',
    ai_chunks: 124,
    stamp: 'ISSUED FOR REVIEW',
    controlled_copy: 'CONTROLLED COPY NO: 01 | ANANYA IYER (MECH LEAD)',
    abstract: 'Carrier Engineering submittal for three (3) × 19XR centrifugal chillers. Includes performance data sheets at AHRI conditions, at 35°C ambient, ARI certification, and VFD control interface specification.',
    sections: [
      { heading: '1.0 CHILLER PERFORMANCE DATA', body: 'Model: 19XR-1024-DE-6-5-AXX. Capacity: 3,000 kW per unit. COP at AHRI conditions (29°C CW, 6°C CHW): 6.28. COP at site conditions (35°C CW, 7°C CHW): 5.87. DEVIATION: 4% below 6.1 minimum COP at site conditions.' },
      { heading: '2.0 VFD AND CONTROLS', body: 'Integrated Carrier PIC III controls with Modbus TCP, BACnet/IP. VFD by Danfoss (factory-fitted). Capacity modulation range: 20–100% load. Minimum stable loading: 18%.' },
      { heading: '3.0 DEVIATIONS', body: 'DEV-ME-001: COP at 35°C ambient is 5.87 vs 6.1 required. Carrier proposes hybrid cooling tower approach to reduce condensing temperature. Engineering assessment by Jacobs requested.' },
    ],
    related_requirements: ['REQ-ME-001', 'REQ-ME-002'],
    related_risks: ['R-ME-01'],
  },
  {
    document_id: 'doc-014',
    filename: 'PHX-DC-01-CPM-SCH-001_Master_Programme_v4.pdf',
    title: 'MASTER PROJECT PROGRAMME — CPM BASELINE SCHEDULE v4',
    category: 'Schedule',
    status: 'indexed',
    page_count: 18,
    file_size: 16500,
    rev: '4',
    discipline: 'PMO',
    prepared_by: 'project_manager',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'PHX-DC-01-CPM-SCH-001',
    date_issued: '02 Jan 2026',
    ai_chunks: 96,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CONTROLLED COPY NO: 04 | VIKRAM SHARMA (PM)',
    abstract: 'Baseline CPM programme for PHX-DC-01. Total duration 18 months. Critical path: Civil → Electrical installation → IST → Commissioning. Current status: 8 days behind baseline.',
    sections: [
      { heading: 'CRITICAL PATH SUMMARY', body: 'Civil foundations → MV cable installation → Switchgear installation → UPS installation → LV distribution → IT infrastructure → IST Phase 1 → IST Phase 2 → Black-start test → CX → Handover.' },
      { heading: 'MILESTONE DATES', body: 'MS-01: Civil structure complete — 15 Oct 2025 (COMPLETE). MS-02: MV switchgear delivered — 20 Feb 2026 (AT RISK). MS-03: UPS commissioned — 28 Feb 2026. MS-04: IST complete — 30 Mar 2026. MS-05: Handover — 15 Apr 2026.' },
      { heading: 'FLOAT ANALYSIS', body: 'Critical path has zero float. MV switchgear delivery delay (8 days) directly impacts IST start date. Generator customs delay (15 days) is on a parallel path with 5 days float — NET impact: 10 days if not resolved.' },
    ],
    related_requirements: ['REQ-IST-001'],
    related_risks: ['R-PR-01', 'R-EL-02', 'R-CV-01'],
  },
];

// ─── Compliance Findings ─────────────────────────────────────────────────────

export interface ComplianceFinding {
  projectId?: string;
  requirement_id: string;
  requirement_description: string;
  source_document_id: string;   // which SPEC doc this comes from
  vendor_document_id: string;   // which SUBMITTAL is being checked
  vendor_value: string;
  compliance_status: 'Non-Compliant' | 'Compliant' | 'Partial' | 'Observation';
  severity: 'Critical' | 'Major' | 'Minor' | 'Passed';
  confidence: number;
  explanation: string;
  recommendation: string;
}

export const COMPLIANCE_FINDINGS: ComplianceFinding[] = [
  {
    requirement_id: 'REQ-UPS-001',
    requirement_description: 'UPS shall be configured in N+1 redundancy to ensure system continuity under single point of failure.',
    source_document_id: 'doc-001',
    vendor_document_id: 'doc-002',
    vendor_value: 'Vertiv proposes 3 × 800kVA modules in parallel-N configuration. N+1 configuration available at additional cost (Appendix C).',
    compliance_status: 'Non-Compliant',
    severity: 'Critical',
    confidence: 0.97,
    explanation: 'Vendor base proposal uses N topology — any single module failure will cause total UPS output failure. The specification mandates N+1 to maintain supply during a module fault. Appendix C pricing exists but has not been formally accepted.',
    recommendation: 'Accept Appendix C N+1 pricing. Raise CO-EL-004 for the additional module. Confirm revised delivery schedule with Vertiv. Close RFI-EL-002.',
  },
  {
    requirement_id: 'REQ-UPS-002',
    requirement_description: 'Battery autonomy shall be minimum 15 minutes at full IT load of 2MW.',
    source_document_id: 'doc-001',
    vendor_document_id: 'doc-002',
    vendor_value: 'Base battery string provides 10-minute autonomy. ERK-200 extension kit adds 5 minutes — total 15 min when fitted.',
    compliance_status: 'Non-Compliant',
    severity: 'Critical',
    confidence: 0.99,
    explanation: 'FAT confirmed (NCR-EL-001, doc-004) that base configuration delivers only 10 minutes. ERK-200 extension is not yet on order. Until CO is raised and ERK-200 is factory-fitted, the system remains non-compliant with REQ-UPS-002.',
    recommendation: 'Raise change order for ERK-200 immediately. Confirm factory fit and re-FAT before dispatch. Reference NCR-EL-001 and FAT OBS-FAT-001 (doc-003, doc-004).',
  },
  {
    requirement_id: 'REQ-UPS-003',
    requirement_description: 'UPS output voltage shall be 415V, 3-phase, 50Hz compliant with IEC standards.',
    source_document_id: 'doc-001',
    vendor_document_id: 'doc-002',
    vendor_value: 'Output voltage confirmed as 415V ±1%, 3-phase, 4W+PE, 50Hz ±0.05Hz. THDv <1%.',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.98,
    explanation: 'Vendor submittal and FAT results (doc-003) both confirm exact compliance with output voltage, frequency and THD requirements.',
    recommendation: 'No action required. Verify during SAT with on-site power analyser.',
  },
  {
    requirement_id: 'REQ-UPS-004',
    requirement_description: 'UPS shall comply with IEC 62040-1 and IEC 62040-3 VFI-SS-111 performance classification.',
    source_document_id: 'doc-001',
    vendor_document_id: 'doc-002',
    vendor_value: 'Vendor declares IEC 62040-3 VFI-SS-111 compliance. Test certificate to be provided before dispatch.',
    compliance_status: 'Partial',
    severity: 'Major',
    confidence: 0.88,
    explanation: 'Submittal declares VFI-SS-111 compliance verbally. Third-party CB test certificate has not been provided. FAT report (doc-003) confirms performance but independent certification is outstanding.',
    recommendation: 'Request CB test certificate from Vertiv prior to dispatch. Raise hold point HP-FAT-01 until certificate is received.',
  },
  {
    requirement_id: 'REQ-UPS-005',
    requirement_description: 'UPS efficiency shall be minimum 96% at full load in double-conversion mode.',
    source_document_id: 'doc-001',
    vendor_document_id: 'doc-003',
    vendor_value: 'FAT measured efficiency: 96.2% at 100% load. Datasheet efficiency: 97.1% (nominal).',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.99,
    explanation: 'Both the vendor datasheet and FAT measurements confirm efficiency exceeds the 96% minimum requirement.',
    recommendation: 'No action. Confirm efficiency during SAT energy monitoring.',
  },
  {
    requirement_id: 'REQ-MV-001',
    requirement_description: 'MV switchgear shall be rated 11kV, 1250A, 25kA fault withstand for 1 second, SF6-free.',
    source_document_id: 'doc-006',
    vendor_document_id: 'doc-010',
    vendor_value: 'ABB UniGear ZS1: 11kV, 1250A, 25kA/1s, VCB technology (SF6-free). Delivery 18 weeks from PO.',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.95,
    explanation: 'Technical parameters meet specification. Delivery timeline is the only concern — 18-week lead vs programme requirement of 12 weeks.',
    recommendation: 'Approve ABB technically. Raise commercial discussion on expedited delivery per RFI-EL-003. Confirm acceptance of premium freight cost.',
  },
  {
    requirement_id: 'REQ-ME-001',
    requirement_description: 'Chillers shall achieve minimum COP of 6.1 at site operating conditions (35°C condenser water inlet).',
    source_document_id: 'doc-007',
    vendor_document_id: 'doc-013',
    vendor_value: 'Carrier 19XR COP at 35°C ambient: 5.87. At AHRI standard conditions (29°C): 6.28. 4% shortfall at site conditions.',
    compliance_status: 'Non-Compliant',
    severity: 'Major',
    confidence: 0.91,
    explanation: 'At the project site ambient temperature of 35°C, the proposed Carrier chillers achieve only COP 5.87 — 3.8% below the 6.1 minimum. This increases annual cooling energy consumption and affects PUE commitments to client.',
    recommendation: 'Evaluate hybrid cooling tower inlet temperature reduction. Request Carrier to model COP with 32°C condensing inlet. Alternatively, consider adiabatic pre-cooling on condenser water circuit.',
  },
  {
    requirement_id: 'REQ-CV-001',
    requirement_description: 'All structural elements shall achieve 28-day compressive strength of minimum 35 MPa (M35 grade concrete).',
    source_document_id: 'doc-009',
    vendor_document_id: 'doc-009',
    vendor_value: 'Cube test result: 38.5 MPa at 28 days. Waterproofing membrane applied. Raised floor capacity within limits.',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.97,
    explanation: 'Structural inspection report (doc-009) confirms all cured concrete elements exceed the M35 specification. Open item CI-001 (secondary slab in generator yard) is still curing but is not on critical IST path.',
    recommendation: 'Close CI-001 once slab cube test results confirmed. Update inspection register.',
  },
];

// ─── Risk Register ───────────────────────────────────────────────────────────

export interface Risk {
  projectId?: string;
  id: string;
  name: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  driver: string;
  evidence: string;
  mitigation: string;
  probability: number;
  impact: number;
  related_requirement?: string;
  related_document_ids: string[];
  status: 'Open' | 'In Progress' | 'Resolved';
}

export const RISKS: Risk[] = [
  {
    id: 'R-EL-01',
    name: 'UPS redundancy config mismatch',
    category: 'Electrical',
    severity: 'Critical',
    driver: 'Compliance mismatch REQ-UPS-001',
    evidence: 'Vendor submittal (doc-002) proposes N topology vs N+1 required by spec (doc-001). RFI-EL-002 open. FAT did not test redundancy failover.',
    mitigation: 'Accept N+1 Appendix C pricing. Raise CO-EL-004. Confirm revised Vertiv delivery schedule. Re-FAT to include module failover test.',
    probability: 95,
    impact: 95,
    related_requirement: 'REQ-UPS-001',
    related_document_ids: ['doc-001', 'doc-002', 'doc-010'],
    status: 'In Progress',
  },
  {
    id: 'R-EL-02',
    name: 'MV switchgear delivery delay',
    category: 'Electrical',
    severity: 'High',
    driver: 'Procurement delay — 18-week vs 12-week programme requirement',
    evidence: 'Procurement register (doc-011): ABB PO placed 21 Oct 2025, delivery 20 Feb 2026. Programme requires 12 Feb. RFI-EL-003 raised for expedite.',
    mitigation: 'Approve premium freight surcharge (₹12 Lakhs per RFI-EL-003). Engage secondary logistics provider for customs clearance. Revise IST sequence to float parallel activities.',
    probability: 75,
    impact: 80,
    related_requirement: 'REQ-MV-001',
    related_document_ids: ['doc-006', 'doc-010', 'doc-011', 'doc-014'],
    status: 'In Progress',
  },
  {
    id: 'R-EL-03',
    name: 'Battery autonomy shortfall — 10 min vs 15 min',
    category: 'Electrical',
    severity: 'Critical',
    driver: 'Compliance mismatch REQ-UPS-002',
    evidence: 'FAT report (doc-003) confirmed 10 min 22 sec autonomy. NCR-EL-001 (doc-004) raised. ERK-200 extension kit identified as solution but CO not yet raised.',
    mitigation: 'Raise change order for ERK-200 battery extension kits. Factory fit by 30 Jan 2026. Re-FAT 02 Feb 2026 with client witness.',
    probability: 99,
    impact: 90,
    related_requirement: 'REQ-UPS-002',
    related_document_ids: ['doc-001', 'doc-002', 'doc-003', 'doc-004'],
    status: 'In Progress',
  },
  {
    id: 'R-ME-01',
    name: 'Chiller COP deviation at site conditions',
    category: 'Mechanical',
    severity: 'Medium',
    driver: 'Efficiency below spec at 35°C ambient — COP 5.87 vs 6.1 minimum',
    evidence: 'Carrier chiller submittal (doc-013) reports COP 5.87 at 35°C CW inlet. Spec (doc-007) requires minimum 6.1. 3.8% deviation impacts annual PUE.',
    mitigation: 'Evaluate hybrid cooling tower pre-cooling or adiabatic coolers. Carrier to remodel with 32°C inlet. Jacobs to provide engineering assessment within 2 weeks.',
    probability: 60,
    impact: 55,
    related_requirement: 'REQ-ME-001',
    related_document_ids: ['doc-007', 'doc-013'],
    status: 'Open',
  },
  {
    id: 'R-ME-02',
    name: 'CRAH fan power exceeds kW limits',
    category: 'Mechanical',
    severity: 'Low',
    driver: 'Efficiency metrics — fan input power above budget',
    evidence: 'Preliminary energy model shows CRAH fan power at 180 kW vs 150 kW budgeted.',
    mitigation: 'Review fan curve configurations. Consider EC motor upgrade. Evaluate containment improvement to reduce airflow demand.',
    probability: 40,
    impact: 30,
    related_document_ids: ['doc-007'],
    status: 'Open',
  },
  {
    id: 'R-PR-01',
    name: 'Diesel generator customs clearance delay',
    category: 'Procurement',
    severity: 'Critical',
    driver: 'Logistics — JNPT customs delay, 3 weeks',
    evidence: 'Procurement register (doc-011): Generator sets delayed at JNPT. ETA pushed to 28 Feb 2026. Programme requires 13 Feb. Critical path impact: 15 days. Meeting minutes (doc-012) confirm expedite action underway.',
    mitigation: 'Engage CHA agent for priority customs clearance. Cost: ₹1.5 Lakhs. Expected clearance 18 Jan 2026. Overlap generator installation with parallel cable pulling where possible per programme (doc-014).',
    probability: 85,
    impact: 92,
    related_document_ids: ['doc-011', 'doc-012', 'doc-014'],
    status: 'In Progress',
  },
  {
    id: 'R-PR-02',
    name: 'UPS change order cost escalation',
    category: 'Procurement',
    severity: 'High',
    driver: 'CO-EL-003 (ERK-200) + CO-EL-004 (N+1 module) — combined impact ₹68 Lakhs',
    evidence: 'ERK-200 BOM: ₹20 Lakhs. Additional UPS module (Appendix C): ₹48 Lakhs. Both items not in original PO scope. Budget contingency: ₹40 Lakhs.',
    mitigation: 'Seek client cost-sharing on N+1 module as it was specification requirement from outset. Negotiate ERK-200 pricing. Raise formal budget revision request.',
    probability: 70,
    impact: 75,
    related_document_ids: ['doc-002', 'doc-004', 'doc-011'],
    status: 'Open',
  },
  {
    id: 'R-PR-03',
    name: 'Fire suppression inspection pending',
    category: 'Procurement',
    severity: 'Medium',
    driver: 'FM-200 cylinders require TAC inspection before filling',
    evidence: 'Spec (doc-008) requires TAC (Technical Assessment Certificate) for fire suppression cylinders. Inspection scheduled but TAC not yet issued.',
    mitigation: 'Follow up with TAC authority. Commissioning procedure (doc-005) has HP-03 hold point — fire suppression must be commissioned before IT load energisation.',
    probability: 50,
    impact: 65,
    related_requirement: 'REQ-FP-001',
    related_document_ids: ['doc-005', 'doc-008'],
    status: 'Open',
  },
  {
    id: 'R-CV-01',
    name: 'Generator yard slab curing delay',
    category: 'Civil',
    severity: 'Low',
    driver: 'Secondary slab curing overlap with steel column installation',
    evidence: 'Civil inspection report (doc-009) CI-001: curing in progress, estimated complete 15 Jan 2026. Meeting minutes (doc-012) confirm 5-day programme impact.',
    mitigation: 'Consider rapid-cure admixture (Sika ViscoCrete). Use parallel cable-pulling activities to absorb delay. Update programme float analysis per doc-014.',
    probability: 35,
    impact: 25,
    related_document_ids: ['doc-009', 'doc-012', 'doc-014'],
    status: 'In Progress',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDocById(id: string): DocMeta | undefined {
  return DOCUMENTS.find(d => d.document_id === id);
}

export function getRisksByCategory(category: string): Risk[] {
  return RISKS.filter(r => r.category === category);
}

export function getCategories(): { name: string; icon: string; count: number; avgSeverity: string; trend: 'Up' | 'Down' | 'Stable'; openActions: number }[] {
  const cats = [
    { name: 'Electrical', icon: '⚡', trend: 'Up' as const },
    { name: 'Mechanical', icon: '❄️', trend: 'Down' as const },
    { name: 'Procurement', icon: '📦', trend: 'Up' as const },
    { name: 'Civil', icon: '🏗', trend: 'Stable' as const },
  ];
  return cats.map(cat => {
    const risks = getRisksByCategory(cat.name);
    const critical = risks.filter(r => r.severity === 'Critical').length;
    const avgSeverity = critical > 0 ? 'Critical' : risks.some(r => r.severity === 'High') ? 'High' : 'Medium';
    const openActions = risks.filter(r => r.status !== 'Resolved').length;
    return { ...cat, count: risks.length, avgSeverity, openActions };
  });
}

// ─── Multi-Project Datasets (Beta & Gamma) ──────────────────────────────────

DOCUMENTS.push(
  {
    projectId: 'beta',
    document_id: 'doc-beta-001',
    filename: 'HYD-DC-02-EL-SPEC-001_Transformer_Spec.pdf',
    title: 'TECHNICAL SPECIFICATION FOR 33kV/11kV POWER TRANSFORMERS',
    category: 'Specification',
    status: 'indexed',
    page_count: 18,
    file_size: 18450,
    rev: 'A',
    discipline: 'Electrical',
    prepared_by: 'electrical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'HYD-DC-02-EL-SPEC-001',
    date_issued: '12 Nov 2025',
    ai_chunks: 34,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'HYD-DC-02-CC-012',
    abstract: 'Specification covering design, manufacturing, testing, and supply of 33kV oil-immersed transformers with ONAN/ONAF cooling for Data Centre Beta.',
    sections: [
      { heading: '1. SCOPE OF SUPPLY', body: 'Supply of 2 x 25MVA 33/11kV dual secondary ONAN/ONAF transformers with OLTC.' },
      { heading: '2. PERFORMANCE CRITERIA', body: 'Impedance voltage 10% ±0.5%. Maximum temperature rise 50°C for oil and 55°C for winding.' }
    ],
    related_requirements: ['REQ-HYD-001'],
    related_risks: ['R-HYD-01']
  },
  {
    projectId: 'beta',
    document_id: 'doc-beta-002',
    filename: 'HYD-DC-02-HVAC-SUB-001_Chiller_Submittal.pdf',
    title: 'VENDOR SUBMITTAL FOR WATER-COOLED CENTRIFUGAL CHILLERS',
    category: 'Submittal',
    status: 'indexed',
    page_count: 32,
    file_size: 29400,
    rev: '0',
    discipline: 'Mechanical',
    prepared_by: 'mechanical_engineer',
    checked_by: 'lead_mep',
    approved_by: 'qa_manager',
    doc_ref: 'HYD-DC-02-HVAC-SUB-001',
    date_issued: '05 Dec 2025',
    ai_chunks: 48,
    stamp: 'ISSUED FOR REVIEW',
    controlled_copy: 'HYD-DC-02-CC-018',
    abstract: 'Vendor technical submission from Trane for 4 x 1200TR water-cooled chillers operating with R-1234ze eco-refrigerant.',
    sections: [
      { heading: '1. EQUIPMENT DATASHEET', body: 'Trane CenTraVac 1200TR, 415V/3ph/50Hz, IPLV 0.320 kW/ton, N+1 arrangement.' }
    ],
    related_requirements: ['REQ-HYD-002'],
    related_risks: []
  },
  {
    projectId: 'gamma',
    document_id: 'doc-gamma-001',
    filename: 'CHE-DC-03-CIV-SPEC-001_Foundation_Spec.pdf',
    title: 'STRUCTURAL FOUNDATION & SEISMIC DESIGN SPECIFICATION',
    category: 'Specification',
    status: 'indexed',
    page_count: 14,
    file_size: 14200,
    rev: 'A',
    discipline: 'Civil',
    prepared_by: 'civil_engineer',
    checked_by: 'lead_mep',
    approved_by: 'project_manager',
    doc_ref: 'CHE-DC-03-CIV-SPEC-001',
    date_issued: '20 Dec 2025',
    ai_chunks: 22,
    stamp: 'APPROVED FOR CONSTRUCTION',
    controlled_copy: 'CHE-DC-03-CC-005',
    abstract: 'Civil specification for deep pile foundations and Zone III seismic compliance for Data Centre Gamma (Chennai).',
    sections: [
      { heading: '1. PILE FOUNDATION CRITERIA', body: 'Bored cast-in-situ piles 800mm diameter, minimum M40 grade concrete.' }
    ],
    related_requirements: ['REQ-CHE-001'],
    related_risks: ['R-CHE-01']
  }
);

COMPLIANCE_FINDINGS.push(
  {
    projectId: 'beta',
    requirement_id: 'REQ-HYD-001',
    requirement_description: '33kV Transformers shall have ONAN/ONAF dual cooling rating with max 55°C winding rise.',
    source_document_id: 'doc-beta-001',
    vendor_document_id: 'doc-beta-001',
    vendor_value: 'Siemens 25MVA: ONAN rating 20MVA, ONAF rating 25MVA. Winding rise 52°C confirmed.',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.96,
    explanation: 'Submittal datasheet meets all temperature rise and dual cooling requirements.',
    recommendation: 'Approve submittal for manufacturing clearance.'
  },
  {
    projectId: 'gamma',
    requirement_id: 'REQ-CHE-001',
    requirement_description: 'Pile foundations shall withstand Zone III seismic load with zero differential settlement.',
    source_document_id: 'doc-gamma-001',
    vendor_document_id: 'doc-gamma-001',
    vendor_value: 'Bored piles 800mm: Load capacity 350 MT. Seismic analysis confirms compliance.',
    compliance_status: 'Compliant',
    severity: 'Passed',
    confidence: 0.94,
    explanation: 'Geotechnical soil report confirms load capacity and seismic safety factor > 2.5.',
    recommendation: 'Proceed with pile load test at site.'
  }
);

RISKS.push(
  {
    projectId: 'beta',
    id: 'R-HYD-01',
    name: '33kV Substation ROW clearance delay',
    category: 'Electrical',
    severity: 'High',
    driver: 'State DISCOM Right-Of-Way approval pending',
    evidence: 'Substation application submitted 10 Nov 2025. Joint inspection pending by Telangana State Electricity Board.',
    mitigation: 'Engage liaison officer for expediting DISCOM inspection. Pre-commission temporary 11kV line for site works.',
    probability: 65,
    impact: 75,
    related_requirement: 'REQ-HYD-001',
    related_document_ids: ['doc-beta-001'],
    status: 'In Progress'
  },
  {
    projectId: 'gamma',
    id: 'R-CHE-01',
    name: 'Monsoon dewatering capacity limit',
    category: 'Civil',
    severity: 'Medium',
    driver: 'High water table in coastal Chennai zone',
    evidence: 'Geotechnical report indicates groundwater table at -1.5m below ground level during northeast monsoon.',
    mitigation: 'Deploy high-capacity wellpoint dewatering system with diesel backup pumps. Construct perimeter cutoff diaphragm wall.',
    probability: 50,
    impact: 60,
    related_requirement: 'REQ-CHE-001',
    related_document_ids: ['doc-gamma-001'],
    status: 'Open'
  }
);

export function getDocumentsByProject(projectId: string): DocMeta[] {
  if (!projectId || projectId === 'alpha') {
    return DOCUMENTS.filter(d => !d.projectId || d.projectId === 'alpha');
  }
  return DOCUMENTS.filter(d => d.projectId === projectId);
}

export function getComplianceByProject(projectId: string): ComplianceFinding[] {
  if (!projectId || projectId === 'alpha') {
    return COMPLIANCE_FINDINGS.filter(c => !c.projectId || c.projectId === 'alpha');
  }
  return COMPLIANCE_FINDINGS.filter(c => c.projectId === projectId);
}

export function getRisksByProject(projectId: string): Risk[] {
  if (!projectId || projectId === 'alpha') {
    return RISKS.filter(r => !r.projectId || r.projectId === 'alpha');
  }
  return RISKS.filter(r => r.projectId === projectId);
}

export function getScheduleByProject(projectId: string) {
  if (projectId === 'beta') {
    return [
      { id: "B1", name: "Site Land Grading", duration: 7, predecessors: [], procurement_status: "Clear" },
      { id: "B2", name: "33kV Substation Civil Works", duration: 14, predecessors: ["B1"], procurement_status: "Delayed", open_rfis: 1 },
      { id: "B3", name: "25MVA Transformer Delivery", duration: 20, predecessors: ["B1"], procurement_status: "Clear" },
      { id: "B4", name: "Transformer Erection & Testing", duration: 8, predecessors: ["B2", "B3"], procurement_status: "Clear" },
      { id: "B5", name: "Building Energization", duration: 5, predecessors: ["B4"], procurement_status: "Clear" }
    ];
  }
  if (projectId === 'gamma') {
    return [
      { id: "G1", name: "Geotechnical Piling", duration: 12, predecessors: [], procurement_status: "Clear" },
      { id: "G2", name: "Diaphragm Wall Construction", duration: 15, predecessors: ["G1"], procurement_status: "Clear" },
      { id: "G3", name: "Basement Excavation & Dewatering", duration: 10, predecessors: ["G2"], compliance_issues: 1 },
      { id: "G4", name: "Raft Foundation Pour", duration: 8, predecessors: ["G3"], procurement_status: "Clear" }
    ];
  }
  // Default Alpha schedule
  return [
    { id: "A1", name: "Site Clearance", duration: 5, predecessors: [], procurement_status: "Clear" },
    { id: "A2", name: "Foundation Pour", duration: 10, predecessors: ["A1"], procurement_status: "Clear" },
    { id: "A3", name: "Switchgear Procurement", duration: 15, predecessors: [], procurement_status: "Delayed", open_rfis: 1 },
    { id: "A4", name: "Switchgear Installation", duration: 5, predecessors: ["A2", "A3"], procurement_status: "Clear" },
    { id: "A5", name: "UPS Delivery & Install", duration: 7, predecessors: ["A2"], compliance_issues: 1 },
    { id: "A6", name: "Integrated Systems Testing", duration: 10, predecessors: ["A4", "A5"], procurement_status: "Clear" }
  ];
}

export function getTimelineByProject(projectId: string) {
  if (projectId === 'beta') {
    return [
      { label: 'Civil Works', pct: 95, color: '#10b981' },
      { label: 'Electrical Installation', pct: 70, color: '#3b82f6' },
      { label: 'HVAC & Mechanical', pct: 60, color: '#8b5cf6' },
      { label: 'Commissioning (IST)', pct: 25, color: '#f59e0b', delayed: true },
      { label: 'Handover & Handback', pct: 5, color: '#5a5a7a' },
    ];
  }
  if (projectId === 'gamma') {
    return [
      { label: 'Civil Works', pct: 45, color: '#10b981' },
      { label: 'Electrical Installation', pct: 20, color: '#3b82f6' },
      { label: 'HVAC & Mechanical', pct: 10, color: '#8b5cf6' },
      { label: 'Commissioning (IST)', pct: 0, color: '#f59e0b', delayed: true },
      { label: 'Handover & Handback', pct: 0, color: '#5a5a7a' },
    ];
  }
  // Default Alpha
  return [
    { label: 'Civil Works', pct: 85, color: '#10b981' },
    { label: 'Electrical Installation', pct: 55, color: '#3b82f6' },
    { label: 'HVAC & Mechanical', pct: 40, color: '#8b5cf6' },
    { label: 'Commissioning (IST)', pct: 0, color: '#f59e0b', delayed: true },
    { label: 'Handover & Handback', pct: 0, color: '#5a5a7a' },
  ];
}

export function getDashboardStatsByProject(projectId: string) {
  if (projectId === 'beta') {
    return {
      scheduleDelayDays: 14,
      scheduleDelayReason: '33kV Substation Civil Works',
      totalFindingsSummary: '1 Critical · 1 Major · 2 Passed',
    };
  }
  if (projectId === 'gamma') {
    return {
      scheduleDelayDays: 5,
      scheduleDelayReason: 'Piling & Dewatering Wall',
      totalFindingsSummary: '1 Critical · 1 Major · 1 Passed',
    };
  }
  return {
    scheduleDelayDays: 8,
    scheduleDelayReason: 'MV switchgear delivery',
    totalFindingsSummary: '2 Critical · 2 Major · 4 Passed',
  };
}

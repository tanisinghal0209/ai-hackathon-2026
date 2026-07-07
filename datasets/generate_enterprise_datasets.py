import csv
import random
from datetime import datetime, timedelta
import json
import os

# Project Configuration
PROJECT_NAME = "Phoenix DC-01"
PROJECT_CODE = "PHX-DC-01"
CLIENT = "NxtGen Cloud Infrastructure Ltd"
CONTRACTOR = "Tata Projects Limited"

# Base Dates
START_DATE = datetime(2025, 7, 15)
END_DATE = datetime(2026, 9, 1)

# Personnel List (Tata Projects, Jacobs, WSP, NxtGen)
PEOPLE = [
    {"name": "Priya Nair", "role": "Divisional Director", "dept": "Executive Management", "id": "TPL-001", "email": "p.nair@tataprojects.com"},
    {"name": "Vikram Sharma", "role": "Project Manager", "dept": "Project Management", "id": "TPL-002", "email": "v.sharma@tataprojects.com"},
    {"name": "Rajan Mehta", "role": "Project Controls Manager", "dept": "Project Controls", "id": "TPL-003", "email": "r.mehta@tataprojects.com"},
    {"name": "Aditya Singh", "role": "Procurement Manager", "dept": "Procurement", "id": "TPL-004", "email": "a.singh@tataprojects.com"},
    {"name": "Kavya Reddy", "role": "QA/QC Manager", "dept": "QA/QC", "id": "TPL-005", "email": "k.reddy@tataprojects.com"},
    {"name": "Deepak Nambiar", "role": "Site Engineer - Electrical", "dept": "Electrical Engineering", "id": "TPL-006", "email": "d.nambiar@tataprojects.com"},
    {"name": "Shreya Joshi", "role": "Document Controller", "dept": "Document Control", "id": "TPL-007", "email": "s.joshi@tataprojects.com"},
    {"name": "Nikhil Rao", "role": "Planning Engineer", "dept": "Planning", "id": "TPL-008", "email": "n.rao@tataprojects.com"},
    {"name": "Sunita Krishnan", "role": "Contracts Manager", "dept": "Contracts", "id": "TPL-009", "email": "s.krishnan@tataprojects.com"},
    {"name": "Ajay Verma", "role": "Safety Manager", "dept": "Safety", "id": "TPL-010", "email": "a.verma@tataprojects.com"},
    {"name": "Manish Patel", "role": "Site Engineer - Mechanical", "dept": "Mechanical Engineering", "id": "TPL-011", "email": "m.patel@tataprojects.com"},
    {"name": "Rohini Gupta", "role": "Commissioning Engineer", "dept": "Commissioning", "id": "TPL-012", "email": "r.gupta@tataprojects.com"},
    {"name": "Rahul Desai", "role": "Lead Electrical Engineer", "dept": "Electrical Engineering", "id": "JAC-001", "email": "r.desai@jacobs.com"},
    {"name": "Anita Pillai", "role": "Lead Mechanical Engineer", "dept": "Mechanical Engineering", "id": "JAC-002", "email": "a.pillai@jacobs.com"},
    {"name": "Sanjay Thakur", "role": "Lead CxA", "dept": "Commissioning", "id": "WSP-001", "email": "s.thakur@wsp.com"},
    {"name": "Dr. Meera Iyer", "role": "Principal Engineer", "dept": "Client Operations", "id": "NXT-002", "email": "m.iyer@nxtgencloud.in"},
]

def get_random_person(dept=None):
    if dept:
        candidates = [p for p in PEOPLE if p["dept"] == dept]
        if candidates:
            return random.choice(candidates)
    return random.choice(PEOPLE)

# Create Datasets Directory
os.makedirs("datasets", exist_ok=True)

# ==========================================
# 1. VENDOR REGISTER (40 Vendors)
# ==========================================
print("Generating Vendor Register...")
VENDORS = []
COUNTRIES = ["India", "Germany", "USA", "Singapore", "Japan", "France"]
PRODUCTS = [
    "UPS Systems", "Medium Voltage Switchgear", "Diesel Generators", "Centrifugal Chillers",
    "CRAH Units", "Fire Suppression Systems", "BMS Software", "Power Cables", "Busducts",
    "Transformers", "Cooling Towers", "Server Racks", "Access Control", "CCTV Systems",
    "Structured Cabling", "Raised Floor Panels", "Air Handling Units", "VRLA Batteries"
]

# Primary known vendors to ensure alignment with story
primary_vendors = [
    {"id": "VND-EL-001", "name": "PowerGrid Systems Pvt Ltd", "prod": "UPS Systems", "country": "India", "rep": "Ramesh Khanna", "compliance": 23, "delivery": 72, "rating": "F"},
    {"id": "VND-EL-002", "name": "Schneider Electric India", "prod": "Medium Voltage Switchgear", "country": "India", "rep": "Vijay Nambiar", "compliance": 82, "delivery": 58, "rating": "C"},
    {"id": "VND-EL-003", "name": "Cummins India Ltd", "prod": "Diesel Generators", "country": "India", "rep": "Prakash Rao", "compliance": 95, "delivery": 100, "rating": "A"},
    {"id": "VND-ME-001", "name": "Carrier India Pvt Ltd", "prod": "Centrifugal Chillers", "country": "India", "rep": "Sunit Mehrotra", "compliance": 90, "delivery": 75, "rating": "B"},
    {"id": "VND-ME-002", "name": "Vertiv India Pvt Ltd", "prod": "CRAH Units", "country": "India", "rep": "Arun Desai", "compliance": 96, "delivery": 100, "rating": "A"},
    {"id": "VND-FP-001", "name": "Kidde India Pvt Ltd", "prod": "Fire Suppression Systems", "country": "India", "rep": "Dinesh Pai", "compliance": 88, "delivery": 95, "rating": "B"},
]

for pv in primary_vendors:
    VENDORS.append({
        "Vendor ID": pv["id"],
        "Company": pv["name"],
        "Representative": pv["rep"],
        "Country": pv["country"],
        "Products": pv["prod"],
        "Lead Time (Weeks)": random.randint(8, 20),
        "Performance Score": pv["delivery"],
        "Compliance Score": pv["compliance"],
        "Delayed Shipments": random.randint(1, 3) if pv["rating"] in ["C", "F"] else 0,
        "Current Purchase Orders": random.randint(1, 4),
        "Open NCRs": 1 if pv["id"] == "VND-EL-001" else 0,
        "Open RFIs": 1 if pv["id"] == "VND-EL-002" else 0,
        "Preferred Vendor": "YES" if pv["rating"] in ["A", "B"] else "NO"
    })

for i in range(7, 41):
    comp_name = f"Industrial Tech Corp {i}"
    prod = random.choice(PRODUCTS)
    perf = random.randint(50, 99)
    comp = random.randint(60, 99)
    VENDORS.append({
        "Vendor ID": f"VND-GEN-{i:03d}",
        "Company": comp_name,
        "Representative": f"Contact Rep {i}",
        "Country": random.choice(COUNTRIES),
        "Products": prod,
        "Lead Time (Weeks)": random.randint(6, 24),
        "Performance Score": perf,
        "Compliance Score": comp,
        "Delayed Shipments": random.choice([0, 1, 2]),
        "Current Purchase Orders": random.choice([0, 1, 2]),
        "Open NCRs": random.choice([0, 0, 1]) if comp < 80 else 0,
        "Open RFIs": random.choice([0, 1]),
        "Preferred Vendor": "YES" if perf > 80 and comp > 85 else "NO"
    })

with open("datasets/vendor_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=VENDORS[0].keys())
    writer.writeheader()
    writer.writerows(VENDORS)

# ==========================================
# 2. PROJECT SCHEDULE (60 Activities)
# ==========================================
print("Generating Project Schedule...")
ACTIVITIES = []
act_templates = [
    ("A010", "Site Possession and Survey", 10, [], "Civil", "Clear", 0),
    ("A020", "Civil Excavation and Piling", 25, ["A010"], "Civil", "Clear", 0),
    ("A030", "Slab Pour Data Hall 1 and 2", 15, ["A020"], "Civil", "Clear", 0),
    ("A040", "Structural Steel Erection DH1/DH2", 20, ["A030"], "Civil", "Clear", 0),
    ("A050", "Roof Envelope and Decking DH1/DH2", 12, ["A040"], "Civil", "Clear", 0),
    ("A060", "Raised Floor Installation DH1/DH2", 14, ["A050"], "Civil", "Clear", 0),
    ("A070", "UPS Room Civil Prep and Flooring", 10, ["A030"], "Civil", "Clear", 0),
    ("A080", "Battery Room Civil Prep", 8, ["A030"], "Civil", "Clear", 0),
    ("A090", "Generator Building Foundations", 15, ["A020"], "Civil", "Clear", 0),
    ("A100", "Generator Plinths and Enclosures", 12, ["A090"], "Civil", "Clear", 0),
    
    # Electrical Package (Critical Path)
    ("A110", "MV Switchgear PO Placement", 5, ["A010"], "Procurement", "Clear", 0),
    ("A120", "MV Switchgear Manufacturing", 90, ["A110"], "Procurement", "Clear", 0),
    ("A130", "MV Switchgear Shipment and Customs", 36, ["A120"], "Procurement", "Delayed", 1), # Switchgear delay
    ("A140", "MV Switchgear Delivery to Site", 2, ["A130"], "Procurement", "Clear", 0),
    ("A150", "MV Switchgear Base Install", 7, ["A070", "A140"], "Electrical", "Clear", 0),
    ("A160", "MV Switchgear Wiring and Terminations", 8, ["A150"], "Electrical", "Clear", 1), # Rating query RFI
    ("A170", "MV Switchgear Level 3 Cold Commissioning", 5, ["A160"], "Commissioning", "Clear", 0),
    
    ("A180", "UPS PO Placement", 5, ["A010"], "Procurement", "Clear", 0),
    ("A190", "UPS Module Manufacturing", 80, ["A180"], "Procurement", "Clear", 0),
    ("A200", "UPS Factory Acceptance Testing (Pune)", 3, ["A190"], "Procurement", "At Risk", 1), # FAT Fail
    ("A210", "UPS Battery Remediation Cycle", 28, ["A200"], "Procurement", "At Risk", 0), # Remediation delay
    ("A220", "UPS Shipment and Port Delivery", 10, ["A210"], "Procurement", "Clear", 0),
    ("A230", "UPS Delivery and Positioning Site", 3, ["A220"], "Procurement", "Clear", 0),
    ("A240", "UPS Module Positioning in Room A/B", 5, ["A070", "A230"], "Electrical", "Clear", 0),
    ("A250", "UPS Battery Cabinet Assembly", 7, ["A080", "A230"], "Electrical", "Clear", 0),
    ("A260", "UPS Cabling and Power Terminations", 10, ["A240", "A250"], "Electrical", "Clear", 0),
    ("A270", "UPS Level 3 Cold Testing", 6, ["A260"], "Commissioning", "Clear", 0),
    
    ("A280", "Diesel Generator PO Placement", 5, ["A010"], "Procurement", "Clear", 0),
    ("A290", "Diesel Generator Manufacturing", 100, ["A280"], "Procurement", "Clear", 0),
    ("A300", "Diesel Generator Factory Witness Test", 3, ["A290"], "Procurement", "Clear", 0),
    ("A310", "Diesel Generator Site Delivery", 5, ["A300"], "Procurement", "Clear", 0),
    ("A320", "Generator Positioning on Plinths", 4, ["A100", "A310"], "Electrical", "Clear", 0),
    ("A330", "Generator Auxiliary Connections", 8, ["A320"], "Electrical", "Clear", 0),
    ("A340", "Generator Control Cabling to AGC", 6, ["A330"], "Electrical", "Clear", 0),
    ("A350", "Generator Pre-commissioning Checks", 5, ["A340"], "Commissioning", "Clear", 0),
    
    # Mechanical Cooling Package
    ("A360", "Centrifugal Chiller PO Placement", 5, ["A010"], "Procurement", "Clear", 0),
    ("A370", "Centrifugal Chiller Manufacturing", 95, ["A360"], "Procurement", "Delayed", 0), # Chiller manufacturing delay
    ("A380", "Chiller Site Delivery & Positioning", 6, ["A370"], "Procurement", "Clear", 0),
    ("A390", "Chilled Water Piping Pre-fab", 20, ["A030"], "Mechanical", "Clear", 0),
    ("A400", "Chiller Connection & Pipe Hookup", 12, ["A380", "A390"], "Mechanical", "Clear", 0),
    ("A410", "Cooling Tower Foundation & Install", 15, ["A020"], "Civil", "Clear", 0),
    ("A420", "Condenser Water Piping Hookup", 10, ["A400", "A410"], "Mechanical", "Clear", 0),
    ("A430", "CRAH Units Delivery to site", 5, ["A010"], "Procurement", "Clear", 0),
    ("A440", "CRAH Positioning in Data Halls", 8, ["A060", "A430"], "Mechanical", "Clear", 0),
    ("A450", "CHW Valve Train Connections", 10, ["A440", "A400"], "Mechanical", "Clear", 0),
    ("A460", "Mechanical Pre-commissioning Checks", 6, ["A420", "A450"], "Commissioning", "Clear", 0),
    
    # BMS / Integration
    ("A470", "BMS Software Architecture Draft", 15, ["A010"], "Mechanical", "Clear", 0),
    ("A480", "Modbus Point List Mapping", 10, ["A470"], "Mechanical", "Clear", 1), # BMS Open RFI
    ("A490", "BMS Server Room Fitting", 5, ["A030"], "Mechanical", "Clear", 0),
    ("A500", "Control Loop Termination Site", 15, ["A480", "A490"], "Mechanical", "Clear", 0),
    ("A510", "BMS Point-to-Point Testing", 10, ["A170", "A270", "A350", "A460", "A500"], "Commissioning", "Clear", 0),
    
    # Level 4/5 Commissioning & Handover
    ("A520", "Primary Utility Substation Energisation", 5, ["A170"], "Commissioning", "Clear", 0),
    ("A530", "Level 4 Functional Testing - MV SWG", 4, ["A520"], "Commissioning", "Clear", 0),
    ("A540", "Level 4 Functional Testing - UPS", 5, ["A270", "A520"], "Commissioning", "Clear", 0),
    ("A550", "Level 4 Functional Testing - Generators", 4, ["A350"], "Commissioning", "Clear", 0),
    ("A560", "Level 4 Functional Testing - Chillers/CRAH", 6, ["A460", "A520"], "Commissioning", "Clear", 0),
    ("A570", "Integrated Systems Testing Level 5 Prep", 5, ["A530", "A540", "A550", "A560", "A510"], "Commissioning", "Clear", 0),
    ("A580", "Level 5 Integrated Systems Testing (IST)", 10, ["A570"], "Commissioning", "Clear", 0),
    ("A590", "De-mobilisation and Site Cleanup", 5, ["A580"], "Civil", "Clear", 0),
    ("A600", "Client Handover & Final Acceptance", 1, ["A590"], "Executive Management", "Clear", 0)
]

# Calculate topological order & simple Gantt durations
current_dates = {}
for code, name, dur, preds, disc, status, rfis in act_templates:
    # es calculation
    es = 0
    if preds:
        es = max(current_dates[p]["ef"] for p in preds)
    ef = es + dur
    current_dates[code] = {"es": es, "ef": ef}

# Determine project duration
proj_dur = max(current_dates[c]["ef"] for c in current_dates)

# Backwards pass for simple float calculation
latest_dates = {}
for code, name, dur, preds, disc, status, rfis in reversed(act_templates):
    # lf calculation
    successors = [c for c, _, _, p_list, _, _, _ in act_templates if code in p_list]
    if not successors:
        lf = proj_dur
    else:
        lf = min(latest_dates[s]["ls"] for s in successors)
    ls = lf - dur
    latest_dates[code] = {"ls": ls, "lf": lf}

for code, name, dur, preds, disc, status, rfis in act_templates:
    es = current_dates[code]["es"]
    ef = current_dates[code]["ef"]
    ls = latest_dates[code]["ls"]
    lf = latest_dates[code]["lf"]
    tot_float = ls - es
    is_crit = tot_float == 0
    
    start_date = START_DATE + timedelta(days=es)
    finish_date = START_DATE + timedelta(days=ef)
    
    ACTIVITIES.append({
        "Activity ID": code,
        "Activity Name": name,
        "Duration": dur,
        "Predecessors": ",".join(preds),
        "Start": start_date.strftime("%Y-%m-%d"),
        "Finish": finish_date.strftime("%Y-%m-%d"),
        "Float": tot_float,
        "Critical Path": "YES" if is_crit else "NO",
        "Responsible Contractor": CONTRACTOR if disc != "Procurement" else "Vendor",
        "Progress": "100%" if es < 150 else "0%" if es > 180 else "35%"
    })

with open("datasets/project_schedule.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=ACTIVITIES[0].keys())
    writer.writeheader()
    writer.writerows(ACTIVITIES)

# ==========================================
# 3. EQUIPMENT REGISTER (500 Records)
# ==========================================
print("Generating Equipment Register...")
EQUIPMENT = []
BUILDINGS = ["Data Centre Building 01", "Utility Block Building", "Transformer Yard", "Generator Yard"]
SYSTEMS = {
    "Electrical": ["UPS System", "MV Switchgear", "LV Switchgear", "Power Transformers", "Diesel Generators", "Busduct Systems"],
    "Mechanical": ["Chilled Water Plant", "CRAH System", "Acoustic Exhaust", "Condenser Cooling Towers"],
    "Fire Protection": ["FM-200 Clean Agent System", "VESDA Aspiration", "CO2 Flooding System", "Pre-action Sprinklers"],
    "BMS": ["BMS Software System", "BMS Server Panel", "BMS Control Network"]
}

# Sizing properties
volts = {
    "UPS System": "415V AC",
    "MV Switchgear": "11 kV AC",
    "LV Switchgear": "415V AC",
    "Power Transformers": "110 kV / 11 kV",
    "Diesel Generators": "415V AC",
    "Busduct Systems": "415V AC",
    "Chilled Water Plant": "415V AC",
    "CRAH System": "415V AC",
    "Acoustic Exhaust": "415V AC",
    "Condenser Cooling Towers": "415V AC",
}

capacity = {
    "UPS System": "1600 kW",
    "MV Switchgear": "31.5 kA",
    "LV Switchgear": "3200 A",
    "Power Transformers": "5 MVA",
    "Diesel Generators": "3500 kW",
    "Busduct Systems": "3200 A",
    "Chilled Water Plant": "2500 kW",
    "CRAH System": "85 kW",
    "Acoustic Exhaust": "35 dB Attenuation",
    "Condenser Cooling Towers": "3000 GPM",
}

manufacturers = {
    "UPS System": "Vertiv",
    "MV Switchgear": "Schneider Electric",
    "LV Switchgear": "ABB",
    "Power Transformers": "Kirloskar",
    "Diesel Generators": "Cummins",
    "Busduct Systems": "Godrej",
    "Chilled Water Plant": "Carrier",
    "CRAH System": "Vertiv",
    "Fire Suppression System": "Kidde"
}

pos = {
    "UPS System": "PHX-DC-01-PO-EL-002",
    "MV Switchgear": "PHX-DC-01-PO-EL-001",
    "LV Switchgear": "PHX-DC-01-PO-EL-005",
    "Power Transformers": "PHX-DC-01-PO-EL-004",
    "Diesel Generators": "PHX-DC-01-PO-EL-003",
    "Busduct Systems": "PHX-DC-01-PO-EL-006",
    "Chilled Water Plant": "PHX-DC-01-PO-ME-001",
    "CRAH System": "PHX-DC-01-PO-ME-002",
    "Fire Suppression System": "PHX-DC-01-PO-FP-001"
}

# Generate primary ones
primary_assets = [
    # UPS Modules
    {"id": "UPS-A1-01", "name": "UPS-PA-01", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned - awaiting battery remediation", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-A1-02", "name": "UPS-PA-02", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-A1-03", "name": "UPS-PA-03", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-A1-04", "name": "UPS-PA-04", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-B1-01", "name": "UPS-PB-01", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-B1-02", "name": "UPS-PB-02", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-B1-03", "name": "UPS-PB-03", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    {"id": "UPS-B1-04", "name": "UPS-PB-04", "sys": "Electrical", "sub": "UPS System", "bld": "Data Centre Building 01", "flr": "Level 1", "status": "AT VENDOR PUNE - FAT FAIL - DISPATCH HOLD", "cx_status": "Not commissioned", "po": "PHX-DC-01-PO-EL-002", "act": "A200"},
    
    # Switchgear
    {"id": "SWG-MV-A", "name": "SWG-A-MAIN", "sys": "Electrical", "sub": "MV Switchgear", "bld": "Utility Block Building", "flr": "Level 1", "status": "EN ROUTE TO SITE - ETA 15-16 Jan 2026", "cx_status": "Not installed", "po": "PHX-DC-01-PO-EL-001", "act": "A130"},
    {"id": "SWG-MV-B", "name": "SWG-B-MAIN", "sys": "Electrical", "sub": "MV Switchgear", "bld": "Utility Block Building", "flr": "Level 1", "status": "EN ROUTE TO SITE - ETA 15-16 Jan 2026", "cx_status": "Not installed", "po": "PHX-DC-01-PO-EL-001", "act": "A130"},
]

for pa in primary_assets:
    EQUIPMENT.append({
        "Equipment ID": pa["id"],
        "Asset Number": f"AST-{pa['id']}",
        "Description": f"{pa['sub']} Module {pa['name']}",
        "Location": f"{pa['bld']}, {pa['flr']}",
        "Building": pa["bld"],
        "Floor": pa["flr"],
        "System": pa["sys"],
        "Subsystem": pa["sub"],
        "Manufacturer": manufacturers.get(pa["sub"], "OEM"),
        "Model": f"MOD-{pa['id'].split('-')[0]}-X",
        "Serial Number": f"SER-{pa['id']}-2025",
        "Voltage": volts.get(pa["sub"], "415V AC"),
        "Capacity": capacity.get(pa["sub"], "1600 kW"),
        "Weight": f"{random.randint(1200, 4800)} kg",
        "Dimensions": "2200x800x1200 mm",
        "Delivery Status": pa["status"],
        "Installation Status": "Awaiting Delivery" if "AT VENDOR" in pa["status"] or "EN ROUTE" in pa["status"] else "Installed",
        "Commissioning Status": pa["cx_status"],
        "Maintenance Status": "Warranty Period",
        "Warranty": "24 Months",
        "Criticality": "CRITICAL",
        "Vendor": primary_vendors[0]["name"] if pa["sub"] == "UPS System" else primary_vendors[1]["name"],
        "Purchase Order": pa["po"],
        "Linked Schedule Activity": pa["act"]
    })

# Add other critical items (Generators, Chillers, CRAHs)
for g in range(1, 5):
    gid = f"GEN-A-{g:02d}"
    EQUIPMENT.append({
        "Equipment ID": gid,
        "Asset Number": f"AST-{gid}",
        "Description": f"Diesel Generator {g}",
        "Location": "Generator Yard, Ground",
        "Building": "Generator Yard",
        "Floor": "Ground",
        "System": "Electrical",
        "Subsystem": "Diesel Generators",
        "Manufacturer": "Cummins",
        "Model": "QSK60G18",
        "Serial Number": f"SER-{gid}-2025",
        "Voltage": "415V AC",
        "Capacity": "3500 kW",
        "Weight": "18000 kg",
        "Dimensions": "6200x2400x3100 mm",
        "Delivery Status": "In Manufacturing",
        "Installation Status": "Awaiting Delivery",
        "Commissioning Status": "Not commissioned",
        "Maintenance Status": "Not Commenced",
        "Warranty": "24 Months",
        "Criticality": "CRITICAL",
        "Vendor": "Cummins India Ltd",
        "Purchase Order": "PHX-DC-01-PO-EL-003",
        "Linked Schedule Activity": "A310"
    })

# Chillers
for c in range(1, 5):
    cid = f"CHL-{c:02d}"
    EQUIPMENT.append({
        "Equipment ID": cid,
        "Asset Number": f"AST-{cid}",
        "Description": f"Centrifugal Chiller {c}",
        "Location": "Utility Block Building, Ground",
        "Building": "Utility Block Building",
        "Floor": "Ground",
        "System": "Mechanical",
        "Subsystem": "Chilled Water Plant",
        "Manufacturer": "Carrier",
        "Model": "AquaForce 30XW-V",
        "Serial Number": f"SER-{cid}-2025",
        "Voltage": "415V AC",
        "Capacity": "2500 kW",
        "Weight": "8500 kg",
        "Dimensions": "4800x1800x2200 mm",
        "Delivery Status": "Delayed Manufacturing",
        "Installation Status": "Awaiting Delivery",
        "Commissioning Status": "Not commissioned",
        "Maintenance Status": "Not Commenced",
        "Warranty": "24 Months",
        "Criticality": "CRITICAL",
        "Vendor": "Carrier India Pvt Ltd",
        "Purchase Order": "PHX-DC-01-PO-ME-001",
        "Linked Schedule Activity": "A380"
    })

# Add mock records to pad up to 500 records (e.g. CRAH units, distribution boards, server racks, valves, sensors)
for i in range(len(EQUIPMENT) + 1, 501):
    sys = random.choice(list(SYSTEMS.keys()))
    sub = random.choice(SYSTEMS[sys])
    bld = random.choice(BUILDINGS)
    manufacturer = manufacturers.get(sub, "OEM Standard")
    po_num = pos.get(sub, f"PHX-DC-01-PO-GEN-{i:03d}")
    
    EQUIPMENT.append({
        "Equipment ID": f"EQP-{sys[:3].upper()}-{i:03d}",
        "Asset Number": f"AST-{sys[:3].upper()}-{i:03d}",
        "Description": f"{sub} Asset Item {i}",
        "Location": f"{bld}, Floor {random.choice([1, 2, 3])}",
        "Building": bld,
        "Floor": f"Floor {random.choice([1, 2, 3])}",
        "System": sys,
        "Subsystem": sub,
        "Manufacturer": manufacturer,
        "Model": f"MOD-{sys[:3].upper()}-{i:03d}",
        "Serial Number": f"SN-{sys[:3].upper()}-{i:03d}-99",
        "Voltage": volts.get(sub, "230V AC"),
        "Capacity": capacity.get(sub, "Standard Load"),
        "Weight": f"{random.randint(5, 500)} kg",
        "Dimensions": "600x600x1200 mm",
        "Delivery Status": "Delivered" if i < 350 else "In Manufacturing" if i < 480 else "Delayed",
        "Installation Status": "Installed" if i < 300 else "Awaiting Installation" if i < 350 else "Awaiting Delivery",
        "Commissioning Status": "Pending" if i < 300 else "Awaiting Installation",
        "Maintenance Status": "Setup Phase",
        "Warranty": "12 Months",
        "Criticality": random.choice(["HIGH", "MEDIUM", "LOW"]),
        "Vendor": "Standard Supplies Ltd",
        "Purchase Order": po_num,
        "Linked Schedule Activity": random.choice(["A150", "A240", "A320", "A440", "A500"])
    })

with open("datasets/equipment_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=EQUIPMENT[0].keys())
    writer.writeheader()
    writer.writerows(EQUIPMENT)

# ==========================================
# 4. DOCUMENT CONTROL REGISTER (300 Entries)
# ==========================================
print("Generating Document Control Register...")
DOCUMENTS_REG = []
disciplines = ["Electrical", "Mechanical", "Civil", "Commissioning", "Instrumentation", "QA/QC", "Project Management"]
types = ["Specification", "Method Statement", "Inspection Report", "Site Instruction", "Vendor Drawing", "Commissioning Procedure", "Testing Report", "Meeting Minutes", "Risk Register"]
statuses = ["Approved", "Superseded", "Draft", "Issued For Construction", "Issued For Review", "Issued For Tender"]

# Seed key documents first
primary_docs = [
    {"doc": "PHX-DC-01-EL-SPEC-001", "title": "Medium Voltage Switchgear Specification", "disc": "Electrical", "type": "Specification", "ref_rfi": "RFI-EL-003", "ref_sch": "A110"},
    {"doc": "PHX-DC-01-EL-SPEC-002", "title": "Uninterruptible Power Supply (UPS) Specification", "disc": "Electrical", "type": "Specification", "ref_rfi": "RFI-EL-001", "ref_sch": "A180"},
    {"doc": "PHX-DC-01-ME-SPEC-001", "title": "Centrifugal Chiller Technical Specification", "disc": "Mechanical", "type": "Specification", "ref_rfi": "NONE", "ref_sch": "A360"},
    {"doc": "PHX-DC-01-FP-SPEC-001", "title": "Fire Detection and Clean Agent Suppression Spec", "disc": "Mechanical", "type": "Specification", "ref_rfi": "NONE", "ref_sch": "A560"},
    {"doc": "PHX-DC-01-EL-SUB-002", "title": "Vertiv UPS Technical Submittal Package", "disc": "Electrical", "type": "Vendor Drawing", "ref_rfi": "RFI-EL-005", "ref_sch": "A200"},
    {"doc": "PHX-DC-01-EL-FAT-002", "title": "Factory Acceptance Test Report - UPS Pune", "disc": "Electrical", "type": "Testing Report", "ref_rfi": "NONE", "ref_sch": "A200"},
    {"doc": "PHX-DC-01-EL-NCR-001", "title": "Non-Conformance Report - UPS Battery Capacity Shortfall", "disc": "QA/QC", "type": "Inspection Report", "ref_rfi": "RFI-EL-005", "ref_sch": "A210"},
    {"doc": "PHX-DC-01-CX-SCH-001", "title": "Integrated Systems Testing (IST) Master Procedure", "disc": "Commissioning", "type": "Commissioning Procedure", "ref_rfi": "RFI-CX-001", "ref_sch": "A580"},
]

for pd in primary_docs:
    DOCUMENTS_REG.append({
        "Document Number": pd["doc"],
        "Revision": "B",
        "Discipline": pd["disc"],
        "Author": "Deepak Nambiar" if pd["disc"] == "Electrical" else "Manish Patel",
        "Reviewer": "Rahul Desai" if pd["disc"] == "Electrical" else "Anita Pillai",
        "Approver": "Vikram Sharma",
        "Issue Date": (START_DATE + timedelta(days=20)).strftime("%Y-%m-%d"),
        "Current Status": "Approved" if "SPEC" in pd["doc"] else "Issued For Review",
        "Linked Drawing": f"DWG-{pd['doc'].split('-')[-1]}",
        "Linked Vendor": "PowerGrid Systems Pvt Ltd" if "UPS" in pd["title"] else "Schneider Electric India",
        "Linked RFI": pd["ref_rfi"],
        "Linked Schedule Activity": pd["ref_sch"]
    })

# Pad up to 300 entries
for i in range(len(DOCUMENTS_REG) + 1, 301):
    disc = random.choice(disciplines)
    dtype = random.choice(types)
    status = random.choice(statuses)
    DOCUMENTS_REG.append({
        "Document Number": f"PHX-DC-01-{disc[:2].upper()}-{dtype[:3].upper()}-{i:03d}",
        "Revision": random.choice(["A", "B", "C", "01", "02"]),
        "Discipline": disc,
        "Author": get_random_person(disc)["name"],
        "Reviewer": get_random_person(disc)["name"],
        "Approver": get_random_person("Project Management")["name"],
        "Issue Date": (START_DATE + timedelta(days=random.randint(10, 180))).strftime("%Y-%m-%d"),
        "Current Status": status,
        "Linked Drawing": f"PHX-DC-01-DWG-{disc[:2].upper()}-{i:03d}",
        "Linked Vendor": random.choice(VENDORS)["Company"],
        "Linked RFI": f"RFI-{disc[:2].upper()}-{random.randint(1, 30):03d}" if random.choice([True, False]) else "NONE",
        "Linked Schedule Activity": f"A{random.randint(10, 60)*10}"
    })

with open("datasets/document_control_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=DOCUMENTS_REG[0].keys())
    writer.writeheader()
    writer.writerows(DOCUMENTS_REG)

# ==========================================
# 5. RFI REGISTER (50 RFIs)
# ==========================================
print("Generating RFI Register...")
RFIS = []
rfi_templates = [
    ("RFI-EL-001", "N+1 Redundancy Clarification", "Confirm N+1 active standby redundancy matches spec.", "Closed", "REQ-UPS-001", "A180", "VND-EL-001"),
    ("RFI-EL-002", "Battery sizing end-of-life calculation basis", "Confirm end-of-life temperature derating factor.", "Closed", "REQ-UPS-002", "A200", "VND-EL-001"),
    ("RFI-EL-003", "Short circuit withstand rating on switchgear panels", "Schneider proposes 25 kA instead of 31.5 kA. Clarify suitability.", "Closed", "REQ-SWG-002", "A160", "VND-EL-002"),
    ("RFI-EL-005", "Battery autonomy witness tests at FAT", "Confirm witness procedures for discharge tests under full load.", "Closed", "REQ-UPS-008", "A200", "VND-EL-001"),
    ("RFI-CX-001", "Integrated systems testing fuel storage checks", "Clarify bulk tank volume levels required at start of Level 5 tests.", "Closed", "REQ-CX-002", "A580", "NONE"),
    ("RFI-BMS-001", "BMS points configuration register map on Vertiv Liebert", "Confirm UPS Modbus register mapping for cooling warnings.", "Closed", "REQ-UPS-007", "A480", "VND-EL-001"),
]

for r in rfi_templates:
    RFIS.append({
        "RFI ID": r[0],
        "Date": (START_DATE + timedelta(days=random.randint(10, 100))).strftime("%Y-%m-%d"),
        "Raised By": "Deepak Nambiar",
        "Raised To": "Rahul Desai",
        "Priority": "CRITICAL" if "EL" in r[0] else "MEDIUM",
        "Status": r[3],
        "Question": r[2],
        "Response": "Engineer confirmed specification requirement is rigid. Sizing recalculated.",
        "Linked Drawing": f"DWG-{r[0].split('-')[-1]}",
        "Linked Equipment": "UPS-A1-01" if "UPS" in r[2] else "SWG-MV-A",
        "Linked Schedule": r[5],
        "Linked Vendor": r[6]
    })

# Pad up to 50 entries
for i in range(len(RFIS) + 1, 51):
    disc = random.choice(disciplines)
    author = get_random_person(disc)
    reviewer = get_random_person(disc)
    RFIS.append({
        "RFI ID": f"RFI-{disc[:2].upper()}-{i:03d}",
        "Date": (START_DATE + timedelta(days=random.randint(10, 150))).strftime("%Y-%m-%d"),
        "Raised By": author["name"],
        "Raised To": reviewer["name"],
        "Priority": random.choice(["HIGH", "MEDIUM", "LOW"]),
        "Status": random.choice(["Open", "Closed"]),
        "Question": f"Technical clarification request regarding {disc} standard specifications on section {i}.",
        "Response": "Standard engineering design guide applies. Please refer to drawings." if random.choice([True, False]) else "Awaiting team alignment.",
        "Linked Drawing": f"PHX-DC-01-DWG-{disc[:2].upper()}-{i:03d}",
        "Linked Equipment": f"EQP-{disc[:3].upper()}-{random.randint(10, 99):03d}",
        "Linked Schedule": f"A{random.randint(10, 50)*10}",
        "Linked Vendor": random.choice(VENDORS)["Company"]
    })

with open("datasets/rfi_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=RFIS[0].keys())
    writer.writeheader()
    writer.writerows(RFIS)

# ==========================================
# 6. COMMISSIONING REGISTER (200 Entries)
# ==========================================
print("Generating Commissioning Register...")
COMMISSIONING = []
systems_list = ["Electrical", "Mechanical", "Fire Protection", "BMS"]
tests = {
    "Electrical": ["Insulation Resistance Test", "Contact Resistance Test", "Static Bypass Transfer", "Inverter Step Load", "Battery Discharge Autonomy", "Generator Step Load", "Differential Protection Trip"],
    "Mechanical": ["Chilled Water Hydrostatic Test", "Chiller Compressor Calibration", "CRAH Fan Velocity Sweep", "Cooling Tower GPM Test", "Water Loop Chemical Verification"],
    "Fire Protection": ["VESDA Detection Sweep", "FM-200 Enclosure Leak Test", "CO2 Total Flooding Trigger", "Pre-action Sprinkler Hold"],
    "BMS": ["Modbus Point Communication Check", "Analog Input Scaling Verify", "Alarm Escalation Protocol", "HMI Visual Sync"]
}

# Seed UPS battery discharge test
COMMISSIONING.append({
    "System": "Electrical",
    "Subsystem": "UPS System",
    "Test": "Battery Discharge Autonomy Test",
    "Result": "FAIL",
    "Engineer": "Anand Krishnaswamy",
    "Witness": "Dr. Meera Iyer",
    "Date": "2026-01-07",
    "Status": "Failed - Witness hold",
    "Linked Equipment": "UPS-A1-01"
})

# Add other core Level 3 functional tests
core_tests = [
    ("Electrical", "MV Switchgear", "Insulation Resistance Check", "PASS", "Deepak Nambiar", "2026-01-15", "SWG-MV-A"),
    ("Electrical", "MV Switchgear", "Protection Relay Test", "PASS", "Deepak Nambiar", "2026-01-15", "SWG-MV-B"),
    ("Mechanical", "Chilled Water Plant", "Hydrostatic Test", "PASS", "Manish Patel", "2026-01-12", "CHL-01"),
]

for ct in core_tests:
    COMMISSIONING.append({
        "System": ct[0],
        "Subsystem": ct[1],
        "Test": ct[2],
        "Result": ct[3],
        "Engineer": ct[4],
        "Witness": "Sanjay Thakur",
        "Date": ct[5],
        "Status": "Completed",
        "Linked Equipment": ct[6]
    })

# Pad up to 200 entries
for i in range(len(COMMISSIONING) + 1, 201):
    sys = random.choice(systems_list)
    sub = random.choice(list(SYSTEMS[sys]))
    t_name = random.choice(tests[sys])
    comm_eng = get_random_person("Commissioning")
    client_eng = get_random_person("Client Operations")
    
    # Calculate a realistic test date
    t_date = (START_DATE + timedelta(days=random.randint(100, 220))).strftime("%Y-%m-%d")
    
    res = random.choice(["PASS", "PASS", "PASS", "FAIL"]) if i > 150 else "PASS"
    COMMISSIONING.append({
        "System": sys,
        "Subsystem": sub,
        "Test": t_name,
        "Result": res,
        "Engineer": comm_eng["name"],
        "Witness": client_eng["name"],
        "Date": t_date,
        "Status": "Completed" if res == "PASS" else "Under NCR",
        "Linked Equipment": f"EQP-{sys[:3].upper()}-{random.randint(10, 99):03d}"
    })

with open("datasets/commissioning_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=COMMISSIONING[0].keys())
    writer.writeheader()
    writer.writerows(COMMISSIONING)

# ==========================================
# 7. PROCUREMENT TRACKER
# ==========================================
print("Generating Procurement Tracker...")
PROCUREMENT = []
po_list = [
    ("PHX-DC-01-PO-EL-001", "Schneider Electric India", "Medium Voltage Switchgear", "Completed", "Customs clearance resolved JNPT 10 Jan 2026", "A130", "HIGH"),
    ("PHX-DC-01-PO-EL-002", "PowerGrid Systems Pvt Ltd", "UPS Systems", "Manufacturing Complete", "FAT Battery test failed - Dispatch hold active", "A200", "CRITICAL"),
    ("PHX-DC-01-PO-EL-003", "Cummins India Ltd", "Diesel Generators", "Manufacturing Complete", "FAT scheduled Balewadi 10-12 Feb 2026", "A300", "LOW"),
    ("PHX-DC-01-PO-EL-004", "Kirloskar Electric Ltd", "Power Transformers", "Delivered Site", "PFC in progress on site Transformer yard", "A520", "LOW"),
    ("PHX-DC-01-PO-ME-001", "Carrier India Pvt Ltd", "Centrifugal Chillers", "Delayed Manufacturing", "Compressor supply delays from Carrier USA - 2 weeks delay", "A370", "MEDIUM"),
    ("PHX-DC-01-PO-ME-002", "Vertiv India Pvt Ltd", "CRAH Units", "Manufacturing Complete", "FAT passed 12 Jan 2026. Delivery 15 Feb 2026.", "A430", "LOW"),
]

for p in po_list:
    PROCUREMENT.append({
        "PO Number": p[0],
        "Vendor": p[1],
        "Equipment": p[2],
        "Manufacturing": "100%" if p[3] != "Delayed Manufacturing" else "85%",
        "Inspection": "Passed" if p[0] in ["PHX-DC-01-PO-EL-001", "PHX-DC-01-PO-EL-004", "PHX-DC-01-PO-ME-002"] else "Failed" if p[0] == "PHX-DC-01-PO-EL-002" else "Scheduled",
        "Shipment": "Arrived Site" if p[0] in ["PHX-DC-01-PO-EL-001", "PHX-DC-01-PO-EL-004"] else "Dispatch Hold" if p[0] == "PHX-DC-01-PO-EL-002" else "In Transit" if p[3] == "Manufacturing Complete" else "Pending",
        "Container": f"CONT-PHX-{random.randint(100, 999):03d}" if "Shipment" != "Pending" else "NONE",
        "Expected Delivery": (START_DATE + timedelta(days=120)).strftime("%Y-%m-%d"),
        "Actual Delivery": (START_DATE + timedelta(days=130)).strftime("%Y-%m-%d") if p[0] in ["PHX-DC-01-PO-EL-001", "PHX-DC-01-PO-EL-004"] else "NONE",
        "Current Status": p[3],
        "Schedule Impact": "Delayed" if p[5] in ["A130", "A200", "A370"] else "Clear",
        "Risk Level": p[6],
        "Linked Activities": p[5]
    })

# Add minor procurement packages
for i in range(7, 21):
    po_code = f"PHX-DC-01-PO-GEN-{i:03d}"
    vend = random.choice(VENDORS)
    PROCUREMENT.append({
        "PO Number": po_code,
        "Vendor": vend["Company"],
        "Equipment": vend["Products"],
        "Manufacturing": "100%",
        "Inspection": "Passed",
        "Shipment": "Arrived Site",
        "Container": f"CONT-PHX-GEN-{i:03d}",
        "Expected Delivery": (START_DATE + timedelta(days=random.randint(40, 120))).strftime("%Y-%m-%d"),
        "Actual Delivery": (START_DATE + timedelta(days=random.randint(45, 125))).strftime("%Y-%m-%d"),
        "Current Status": "Delivered Site",
        "Schedule Impact": "Clear",
        "Risk Level": "LOW",
        "Linked Activities": "A510"
    })

with open("datasets/procurement_tracker.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=PROCUREMENT[0].keys())
    writer.writeheader()
    writer.writerows(PROCUREMENT)

# ==========================================
# 8. NCR REGISTER
# ==========================================
print("Generating NCR Register...")
NCRS = [
    {
        "NCR ID": "PHX-DC-01-NCR-EL-001",
        "Issue": "UPS Battery Discharge Autonomy Failure at FAT",
        "Root Cause": "Battery sizing calculations did not apply end-of-life derating factor per Spec Rev B.",
        "Severity": "CRITICAL",
        "Owner": "Aditya Singh",
        "Corrective Action": "Add Battery Extension Cabinets (BEC) VRLA to all modules.",
        "Status": "OPEN",
        "Due Date": "2026-01-19",
        "Linked Equipment": "UPS-A1-01"
    },
    {
        "NCR ID": "PHX-DC-01-NCR-ME-001",
        "Issue": "Chiller Compressor Gasket Defect during Hydrostatic Test",
        "Root Cause": "Incorrect material grade installed at factory assembly.",
        "Severity": "MAJOR",
        "Owner": "Manish Patel",
        "Corrective Action": "Replace with high-tensile silicone gaskets.",
        "Status": "CLOSED",
        "Due Date": "2026-01-20",
        "Linked Equipment": "CHL-01"
    },
    {
        "NCR ID": "PHX-DC-01-NCR-CIV-001",
        "Issue": "Data Hall 3 Raised Floor Leveling Deviation",
        "Root Cause": "Sub-floor pedestal anchors loosened during electrical tray works.",
        "Severity": "MINOR",
        "Owner": "Deepak Nambiar",
        "Corrective Action": "Re-level pedestals and tighten locknuts.",
        "Status": "CLOSED",
        "Due Date": "2026-01-10",
        "Linked Equipment": "EQP-CIV-003"
    }
]

with open("datasets/ncr_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=NCRS[0].keys())
    writer.writeheader()
    writer.writerows(NCRS)

# ==========================================
# 9. INSPECTION REGISTER
# ==========================================
print("Generating Inspection Register...")
INSPECTIONS = [
    {
        "Inspection ID": "IR-EL-043",
        "Inspector": "Deepak Nambiar",
        "Area": "UPS Room A",
        "Equipment": "UPS-A1-01",
        "Checklist": "Level 1 Structural and Cabling",
        "Status": "FAILED",
        "Comments": "Battery autonomy is insufficient. Modbus map missing.",
        "Linked NCR": "PHX-DC-01-NCR-EL-001",
        "Date": "2026-01-07"
    },
    {
        "Inspection ID": "IR-EL-047",
        "Inspector": "Deepak Nambiar",
        "Area": "MV Room Level 1",
        "Equipment": "SWG-MV-A",
        "Checklist": "Visual and Dimensions Check",
        "Status": "PASSED",
        "Comments": "All panels inspected on site delivery. No damage.",
        "Linked NCR": "NONE",
        "Date": "2026-01-15"
    },
    {
        "Inspection ID": "IR-ME-012",
        "Inspector": "Manish Patel",
        "Area": "Central Plant Room",
        "Equipment": "CHL-01",
        "Checklist": "Weld UT Scan & Piping",
        "Status": "PASSED",
        "Comments": "CHW pipework hydrostatic pressure test complete. Weld UT result accepted.",
        "Linked NCR": "NONE",
        "Date": "2026-01-12"
    }
]

with open("datasets/inspection_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=INSPECTIONS[0].keys())
    writer.writeheader()
    writer.writerows(INSPECTIONS)

# ==========================================
# 10. RISK REGISTER
# ==========================================
print("Generating Risk Register...")
RISKS = [
    {
        "Risk ID": "RISK-01",
        "Category": "Procurement / Technical",
        "Probability": 5,
        "Impact": 5,
        "Mitigation": "Procure Battery Extension Cabinets to bridge the 5-minute autonomy deficit. Negotiate cost offset with vendor.",
        "Owner": "Aditya Singh",
        "Status": "MATERIALISED",
        "Linked Procurement": "PHX-DC-01-PO-EL-002",
        "Linked Schedule": "A200",
        "Linked Vendor": "VND-EL-001",
        "Linked RFI": "RFI-EL-005"
    },
    {
        "Risk ID": "RISK-02",
        "Category": "Technical / Procurement",
        "Probability": 4,
        "Impact": 5,
        "Mitigation": "Verify addition of 9th UPS module in the battery remediation proposal. If rejected, engage alternate vendor ABB.",
        "Owner": "Aditya Singh",
        "Status": "ACTIVE",
        "Linked Procurement": "PHX-DC-01-PO-EL-002",
        "Linked Schedule": "A200",
        "Linked Vendor": "VND-EL-001",
        "Linked RFI": "RFI-EL-001"
    },
    {
        "Risk ID": "RISK-03",
        "Category": "Technical / Design",
        "Probability": 3,
        "Impact": 4,
        "Mitigation": "Obtain formal waiver or rating confirmation from Jacobs engineering. KPTCL fault level connection data indicates 21.4 kA maximum.",
        "Owner": "Rahul Desai",
        "Status": "ACTIVE",
        "Linked Procurement": "PHX-DC-01-PO-EL-001",
        "Linked Schedule": "A160",
        "Linked Vendor": "VND-EL-002",
        "Linked RFI": "RFI-EL-003"
    },
    {
        "Risk ID": "RISK-04",
        "Category": "Procurement / Schedule",
        "Probability": 2,
        "Impact": 4,
        "Mitigation": "Pre-fabricate CHW piping hookups to accelerate Chiller installation on site. Monitor Carrier weekly shipping logs.",
        "Owner": "Manish Patel",
        "Status": "ACTIVE",
        "Linked Procurement": "PHX-DC-01-PO-ME-001",
        "Linked Schedule": "A370",
        "Linked Vendor": "VND-ME-001",
        "Linked RFI": "NONE"
    }
]

with open("datasets/risk_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=RISKS[0].keys())
    writer.writeheader()
    writer.writerows(RISKS)

# ==========================================
# 11. MEETING REGISTER
# ==========================================
print("Generating Meeting Register...")
MEETINGS = [
    {
        "Meeting ID": "MOM-PHX-012",
        "Date": "2025-12-17",
        "Attendees": "Vikram Sharma, Aditya Singh, Rajan Mehta, Deepak Nambiar, Vijay Nambiar",
        "Action Items": "12-01: Establish customs clearance tracker. 12-02: Escalated KPTCL switchgear HS classification.",
        "Status": "Closed",
        "Owner": "Rajan Mehta",
        "Deadline": "2025-12-24",
        "Linked RFI": "RFI-PROC-001",
        "Linked Schedule": "A130",
        "Linked Procurement": "PHX-DC-01-PO-EL-001"
    },
    {
        "Meeting ID": "MOM-PHX-013",
        "Date": "2026-01-08",
        "Attendees": "Vikram Sharma, Priya Nair, Kavya Reddy, Dr. Meera Iyer, Ramesh Khanna",
        "Action Items": "13-01: Issue formal dispatch hold. 13-02: Order battery remediation proposal from PowerGrid Systems.",
        "Status": "Open",
        "Owner": "Aditya Singh",
        "Deadline": "2026-01-19",
        "Linked RFI": "RFI-EL-005",
        "Linked Schedule": "A200",
        "Linked Procurement": "PHX-DC-01-PO-EL-002"
    },
    {
        "Meeting ID": "MOM-PHX-014",
        "Date": "2026-01-15",
        "Attendees": "Vikram Sharma, Rajan Mehta, Deepak Nambiar, Rahul Desai, Arjun Kapoor",
        "Action Items": "14-01: Close RFI-EL-003 since switchgear rating is compliant. 14-02: Present CPM scenario slides.",
        "Status": "Open",
        "Owner": "Rajan Mehta",
        "Deadline": "2026-01-20",
        "Linked RFI": "RFI-EL-003",
        "Linked Schedule": "A160",
        "Linked Procurement": "PHX-DC-01-PO-EL-001"
    }
]

with open("datasets/meeting_register.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=MEETINGS[0].keys())
    writer.writeheader()
    writer.writerows(MEETINGS)

print("All registers generated successfully in datasets/ directory.")

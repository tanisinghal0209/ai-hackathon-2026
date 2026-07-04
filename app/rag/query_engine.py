"""
Chapter 20.32 — Query Understanding
Chapter 20.33 — Query Expansion

Analyses the user's question to identify engineering intent signals, then
generates synonym-expanded search variants using the built-in ontology.
These expansions are invisible to the user and exist solely to improve
retrieval coverage (EDR 20-P).
"""
import re
from typing import List, Dict

from app.services.entity_extractor import ENGINEERING_ONTOLOGY


# ---------------------------------------------------------------------------
# 20.32: Intent signals — what discipline / category / document type / operation
# ---------------------------------------------------------------------------
DISCIPLINE_SIGNALS: Dict[str, List[str]] = {
    "Electrical": [
        "ups", "generator", "switchgear", "transformer", "cable", "earthing",
        "battery", "inverter", "rectifier", "voltage", "current", "kva", "kw",
        "power", "ats", "mdb", "pdu",
    ],
    "Mechanical": [
        "hvac", "chiller", "cooling", "pump", "valve", "pipe", "duct", "fan",
        "crah", "crac", "refrigerant", "airflow",
    ],
    "Fire Protection": [
        "suppression", "sprinkler", "fm200", "novec", "detection", "alarm",
        "gaseous", "fire",
    ],
    "Civil": [
        "foundation", "concrete", "steel", "structural", "reinforcement",
        "slab", "column", "trench",
    ],
    "ICT": [
        "network", "fibre", "fiber", "patch", "rack", "cabling", "data centre",
        "data center", "server",
    ],
}

CATEGORY_SIGNALS: Dict[str, List[str]] = {
    "UPS": ["ups", "uninterruptible", "battery", "inverter", "rectifier", "autonomy", "runtime"],
    "Generator": ["generator", "genset", "diesel", "alternator", "dg"],
    "Switchgear": ["switchgear", "switchboard", "mcc", "motor control", "breaker"],
    "Transformer": ["transformer", "tx", "substation"],
    "Cooling": ["chiller", "crah", "crac", "hvac", "cooling tower", "airside", "waterside"],
    "Fire Safety": ["suppression", "fm200", "novec", "sprinkler", "detection"],
}

OPERATION_SIGNALS: Dict[str, List[str]] = {
    "approval_check": ["approved", "approval", "signed off", "accepted", "confirmed", "compliant"],
    "specification_lookup": ["requirement", "shall", "must", "specify", "rated", "rating"],
    "procurement_status": ["delivered", "delivery", "purchase", "order", "po", "shipment"],
    "rfi_status": ["rfi", "request for information", "clarification", "query", "pending"],
    "compliance_check": ["compliant", "non-conformance", "ncr", "deviation", "discrepancy"],
    "schedule_status": ["delayed", "on schedule", "risk", "completion", "milestone"],
}

DOCUMENT_TYPE_SIGNALS: Dict[str, List[str]] = {
    "specification": ["specification", "spec", "requirement", "clause"],
    "vendor_submittal": ["submittal", "datasheet", "vendor", "supplier", "proposed"],
    "rfi": ["rfi", "query", "clarification", "question"],
    "commissioning": ["commissioning", "testing", "sat", "fat", "procedure"],
    "procurement": ["purchase order", "po", "delivery", "shipping"],
}


def analyse_query(query: str) -> Dict:
    """
    20.32: Identify primary discipline, equipment category, document type, and operation
    from the user's question. Returns intent signals used to narrow metadata filters.
    """
    q = query.lower()
    intent: Dict = {
        "discipline": None,
        "equipment_category": None,
        "document_types": [],
        "operations": [],
    }

    for disc, keywords in DISCIPLINE_SIGNALS.items():
        if any(k in q for k in keywords):
            intent["discipline"] = disc
            break

    for cat, keywords in CATEGORY_SIGNALS.items():
        if any(k in q for k in keywords):
            intent["equipment_category"] = cat
            break

    for dtype, keywords in DOCUMENT_TYPE_SIGNALS.items():
        if any(k in q for k in keywords):
            intent["document_types"].append(dtype)

    for op, keywords in OPERATION_SIGNALS.items():
        if any(k in q for k in keywords):
            intent["operations"].append(op)

    return intent


def expand_query(query: str) -> List[str]:
    """
    20.33: Generate synonym-expanded search variants using the engineering ontology.
    Returns the original query plus all synonyms for any matched concepts.
    Expansions are invisible to the user (EDR 20-P).
    """
    expansions = [query]  # always include original
    q_lower = query.lower()

    for canonical, meta in ENGINEERING_ONTOLOGY.items():
        # Check if canonical name or any synonym appears in the query
        all_terms = [canonical.lower()] + [s.lower() for s in meta["synonyms"]]
        matched = any(term in q_lower for term in all_terms)
        if matched:
            # Add all synonyms as additional search queries
            for synonym in meta["synonyms"]:
                variant = re.sub(
                    r'\b' + re.escape(canonical.lower()) + r'\b',
                    synonym.lower(),
                    q_lower,
                    flags=re.IGNORECASE,
                )
                if variant not in [e.lower() for e in expansions]:
                    expansions.append(variant)

    return expansions

"""
Chapter 20.25 — Engineering Entity Recognition
Chapter 20.26 — Engineering Ontology Mapping

Extracts engineering-specific entities from chunk text using deterministic regex patterns.
Maps extracted entities onto canonical names via a built-in ontology.
This augments semantic retrieval with exact lexical matching (EDR 20-L).
"""
import re
from typing import List, Dict

# ---------------------------------------------------------------------------
# 20.26: Built-in ontology for the hackathon prototype.
# In production this lives in the database (OntologyEntry table).
# ---------------------------------------------------------------------------
ENGINEERING_ONTOLOGY: Dict[str, Dict] = {
    "Battery Runtime": {
        "synonyms": ["battery autonomy", "hold-up time", "holdover time", "back-up time", "backup time"],
        "discipline": "Electrical",
        "category": "UPS",
    },
    "Uninterruptible Power Supply": {
        "synonyms": ["ups", "uninterruptible power supply", "uninterruptable power supply"],
        "discipline": "Electrical",
        "category": "UPS",
    },
    "Generator": {
        "synonyms": ["diesel generator", "genset", "standby generator", "emergency generator", "dg set"],
        "discipline": "Electrical",
        "category": "Generator",
    },
    "Switchgear": {
        "synonyms": ["switchboard", "mcc", "motor control centre", "lv switchgear", "mv switchgear"],
        "discipline": "Electrical",
        "category": "Switchgear",
    },
    "Cooling System": {
        "synonyms": ["hvac", "crah", "crac", "chiller", "cooling tower", "air conditioning"],
        "discipline": "Mechanical",
        "category": "Cooling",
    },
    "Fire Suppression": {
        "synonyms": ["fm200", "novec", "clean agent", "fire suppression", "gaseous suppression"],
        "discipline": "Fire Protection",
        "category": "Fire Safety",
    },
}

# ---------------------------------------------------------------------------
# 20.25: Entity patterns
# ---------------------------------------------------------------------------
ENTITY_PATTERNS = [
    # Standards: IEC 62040, TIA-942, IEEE 1100, BICSI 002
    {
        "type": "STANDARD",
        "pattern": re.compile(
            r'\b(IEC|IEEE|NFPA|TIA|ANSI|BS|EN|ISO|ASHRAE|BICSI|UL)\s*[\-–]?\s*\d+[\w\-\.]*\b',
            re.IGNORECASE
        )
    },
    # Electrical ratings: 415V, 11kV, 2000kVA, 800kW, 200Ah, 48VDC
    {
        "type": "RATING",
        "pattern": re.compile(
            r'\b\d+(?:\.\d+)?\s*(?:kV|V|kW|MW|kVA|MVA|Ah|kAh|A|Hz|VDC|VAC)\b',
            re.IGNORECASE
        )
    },
    # Durations / runtimes: 15 minutes, 1 hour
    {
        "type": "DURATION",
        "pattern": re.compile(
            r'\b\d+(?:\.\d+)?\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)\b',
            re.IGNORECASE
        )
    },
    # Cable types: XLPE, SWA, NYY, LSZH, BS 6491
    {
        "type": "CABLE_TYPE",
        "pattern": re.compile(
            r'\b(?:XLPE|SWA|LSZH|NYY|NYCY|CY|LSF|PVC|FP200|MICC)\b',
            re.IGNORECASE
        )
    },
    # Temperature/environment: -10°C, 45 deg C, IP54, IP65
    {
        "type": "ENVIRONMENT",
        "pattern": re.compile(
            r'\b(?:IP\s*\d{2}|IK\s*\d{2}|-?\d+(?:\.\d+)?\s*°?C(?:\s*to\s*-?\d+\s*°?C)?)\b',
            re.IGNORECASE
        )
    },
]


def _map_to_ontology(entity_value: str) -> str:
    """
    20.26: Maps an extracted entity value to a canonical ontology name.
    Returns the canonical name or the original value if no match.
    """
    lower_val = entity_value.lower().strip()
    for canonical, meta in ENGINEERING_ONTOLOGY.items():
        if lower_val == canonical.lower() or lower_val in [s.lower() for s in meta["synonyms"]]:
            return canonical
    return entity_value  # no match — return as-is


def extract_entities(chunk_id: str, document_id: str, text: str) -> List[Dict]:
    """
    20.25: Runs all entity patterns against chunk text.
    Returns a list of entity dicts ready for insertion into EngineeringEntity table.
    """
    found: List[Dict] = []
    seen = set()

    for pattern_def in ENTITY_PATTERNS:
        for match in pattern_def["pattern"].finditer(text):
            value = match.group().strip()
            key = (pattern_def["type"], value.lower())
            if key in seen:
                continue
            seen.add(key)
            canonical = _map_to_ontology(value)
            found.append({
                "chunk_id": chunk_id,
                "document_id": document_id,
                "entity_type": pattern_def["type"],
                "entity_value": value,
                "canonical_name": canonical,
            })

    return found


def infer_discipline_and_category(text: str) -> Dict[str, str]:
    """
    Lightweight heuristic to infer engineering discipline and equipment category
    from chunk text — used to populate Chunk.engineering_discipline and
    Chunk.equipment_category (Chapter 20.24).
    """
    text_lower = text.lower()

    discipline_keywords = {
        "Electrical": ["ups", "generator", "switchgear", "transformer", "cable", "earthing",
                       "voltage", "current", "power", "battery", "inverter", "rectifier"],
        "Mechanical": ["hvac", "chiller", "cooling", "pump", "pipe", "valve", "ductwork", "fan"],
        "Fire Protection": ["suppression", "sprinkler", "fm200", "novec", "detection", "alarm"],
        "Civil": ["foundation", "concrete", "steel", "structural", "reinforcement"],
        "ICT": ["network", "fibre", "patch panel", "rack", "cabling", "data centre"],
    }
    category_keywords = {
        "UPS": ["ups", "uninterruptible", "battery", "inverter", "rectifier"],
        "Generator": ["generator", "genset", "diesel", "alternator"],
        "Switchgear": ["switchgear", "switchboard", "mcc", "motor control"],
        "Transformer": ["transformer", "tx", "substation"],
        "Cooling": ["chiller", "crah", "crac", "hvac", "cooling tower"],
        "Fire Safety": ["suppression", "fm200", "novec", "sprinkler", "detection"],
    }

    discipline = "General"
    for disc, words in discipline_keywords.items():
        if any(w in text_lower for w in words):
            discipline = disc
            break

    category = "General"
    for cat, words in category_keywords.items():
        if any(w in text_lower for w in words):
            category = cat
            break

    return {"discipline": discipline, "category": category}

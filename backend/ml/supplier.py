"""FreightMind - Supplier Risk Intelligence"""
import random
from datetime import datetime
from typing import List, Dict

random.seed(42)

SUPPLIERS = [
    {"id":"SUP001","name":"TechParts Global","country":"China","sector":"Electronics","tier":1},
    {"id":"SUP002","name":"AutoComp Ltd","country":"Germany","sector":"Automotive","tier":1},
    {"id":"SUP003","name":"PharmaBulk Inc","country":"India","sector":"Pharmaceuticals","tier":1},
    {"id":"SUP004","name":"FabriTex Co","country":"Bangladesh","sector":"Textiles","tier":2},
    {"id":"SUP005","name":"ChemSource AG","country":"Netherlands","sector":"Chemicals","tier":1},
    {"id":"SUP006","name":"MedEquip Corp","country":"USA","sector":"Medical Equipment","tier":1},
    {"id":"SUP007","name":"RawMatEx","country":"Brazil","sector":"Raw Materials","tier":2},
    {"id":"SUP008","name":"FoodTrade Asia","country":"Vietnam","sector":"Food & Beverages","tier":2},
    {"id":"SUP009","name":"MachParts KK","country":"Japan","sector":"Machinery","tier":1},
    {"id":"SUP010","name":"ConsumerGoods PLC","country":"UK","sector":"Consumer Goods","tier":1},
]

GEO_RISK_BY_COUNTRY = {
    "China":0.72,"Germany":0.18,"India":0.45,"Bangladesh":0.61,
    "Netherlands":0.15,"USA":0.22,"Brazil":0.55,"Vietnam":0.42,
    "Japan":0.20,"UK":0.25,"South Korea":0.28,"Singapore":0.12,
}

def get_supplier_risks() -> List[Dict]:
    result = []
    for s in SUPPLIERS:
        geo = GEO_RISK_BY_COUNTRY.get(s["country"], 0.4)
        fin = round(random.uniform(0.3, 0.9), 2)
        otr = round(random.uniform(0.55, 0.97), 2)
        overall = round((geo*0.3 + (1-fin)*0.3 + (1-otr)*0.4), 2)
        result.append({
            **s,
            "geo_risk": geo,
            "financial_stability": fin,
            "on_time_rate": otr,
            "overall_risk": overall,
            "risk_level": "critical" if overall>0.7 else "high" if overall>0.5 else "medium" if overall>0.3 else "low",
            "active_po_count": random.randint(3, 45),
            "annual_spend_usd": round(random.uniform(500000, 12000000), 0),
            "alternatives": random.sample(["India alt","Vietnam alt","Mexico alt","Poland alt"], 2),
            "last_audit": f"2025-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
        })
    return result

def get_supplier_detail(supplier_id: str) -> Dict:
    suppliers = get_supplier_risks()
    s = next((x for x in suppliers if x["id"] == supplier_id), None)
    if not s: return {}
    return {
        **s,
        "risk_history": [
            {"month": f"2025-{i:02d}", "risk": round(s["overall_risk"] + random.gauss(0,0.05),2)}
            for i in range(1,13)
        ],
        "incidents": random.randint(0, 4),
        "certifications": random.sample(["ISO 9001","ISO 14001","CTPAT","AEO","SMETA"], 3),
        "recommendations": [
            f"Qualify backup supplier in {s['alternatives'][0]}",
            "Increase safety stock to 6 weeks given geo risk",
            "Schedule Q3 audit — last audit over 6 months ago",
        ]
    }

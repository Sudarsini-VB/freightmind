"""FreightMind - Real-Time Freight Data Simulator"""
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any

random.seed(42)

PORTS = [
    {"code":"SHA","name":"Shanghai","country":"China","lat":31.23,"lng":121.47},
    {"code":"SIN","name":"Singapore","country":"Singapore","lat":1.29,"lng":103.85},
    {"code":"RTM","name":"Rotterdam","country":"Netherlands","lat":51.90,"lng":4.48},
    {"code":"LAX","name":"Los Angeles","country":"USA","lat":33.74,"lng":-118.27},
    {"code":"DXB","name":"Dubai","country":"UAE","lat":24.98,"lng":55.06},
    {"code":"HBG","name":"Hamburg","country":"Germany","lat":53.55,"lng":9.99},
    {"code":"PUS","name":"Busan","country":"South Korea","lat":35.10,"lng":129.04},
    {"code":"BOM","name":"Mumbai","country":"India","lat":18.93,"lng":72.84},
    {"code":"NYC","name":"New York","country":"USA","lat":40.66,"lng":-74.04},
    {"code":"TYO","name":"Tokyo","country":"Japan","lat":35.62,"lng":139.77},
    {"code":"CMB","name":"Colombo","country":"Sri Lanka","lat":6.93,"lng":79.86},
    {"code":"ANR","name":"Antwerp","country":"Belgium","lat":51.26,"lng":4.40},
]

CARRIERS = ["Maersk","MSC","CMA CGM","COSCO","Hapag-Lloyd","ONE","Evergreen","Yang Ming","ZIM","HMM"]
CARGO_TYPES = ["Electronics","Automotive Parts","Pharmaceuticals","Textiles","Consumer Goods",
                "Chemicals","Food & Beverages","Machinery","Raw Materials","Medical Equipment"]
STATUSES = ["in_transit","at_port","customs","delayed","disrupted","at_risk","booked","delivered"]

DISRUPTIONS = [
    {"type":"weather","desc":"Typhoon warning - South China Sea","severity":"high","delay_h":48,"icon":"🌪"},
    {"type":"port_congestion","desc":"LA port - 8-day backlog","severity":"high","delay_h":96,"icon":"⚓"},
    {"type":"geopolitical","desc":"Red Sea instability - rerouting via Cape","severity":"critical","delay_h":240,"icon":"⚠"},
    {"type":"customs_hold","desc":"Missing documentation - EU customs hold","severity":"medium","delay_h":24,"icon":"📋"},
    {"type":"labor_strike","desc":"Hamburg dock workers strike","severity":"high","delay_h":72,"icon":"✊"},
    {"type":"cyber_attack","desc":"Carrier IT breach - tracking offline","severity":"critical","delay_h":60,"icon":"🔒"},
    {"type":"weather","desc":"Dense fog - Rotterdam port closure","severity":"medium","delay_h":18,"icon":"🌫"},
    {"type":"carrier_issue","desc":"Vessel engine failure - cargo transferred","severity":"medium","delay_h":36,"icon":"🔧"},
]

AI_RECS = [
    "Reroute via Singapore hub. Saves 4 days, avoids Red Sea zone.",
    "Pre-clear EU customs docs now to avoid 24h hold at Rotterdam.",
    "Switch to Hapag-Lloyd on this lane — 71% on-time vs current 58%.",
    "Book emergency air freight for critical Lot B-2247 components.",
    "Activate Dubai buffer stock — typhoon impact in 6 hours.",
    "Quantum optimizer found 12% cost reduction via multi-port hub.",
    "AI agent auto-rescheduled 3 trucks to absorb vessel delay.",
    "Force majeure clause §7.3 applies — file notice within 48h.",
]

def _lerp(a, b, t):
    return {"lat": a["lat"]+(b["lat"]-a["lat"])*t,
            "lng": a["lng"]+(b["lng"]-a["lng"])*t,
            "name": f"En route to {b['name']}"}

def _risk_label(score):
    if score < 25: return "low"
    if score < 55: return "medium"
    if score < 78: return "high"
    return "critical"

class FreightSimulator:
    def __init__(self, n=24):
        self._n = n
        self._tick = 0
        self._seed = self._build()

    def _build(self):
        ships = []
        ports = PORTS[:]
        for i in range(self._n):
            o = random.choice(ports)
            d = random.choice([p for p in ports if p["code"] != o["code"]])
            has_d = random.random() < 0.3
            ships.append({
                "id": f"FM{str(i+1).zfill(5)}",
                "origin": o, "destination": d,
                "carrier": random.choice(CARRIERS),
                "cargo_type": random.choice(CARGO_TYPES),
                "weight_kg": round(random.uniform(500, 28000), 0),
                "value_usd": round(random.uniform(50000, 4500000), 0),
                "base_risk": random.uniform(5, 85),
                "progress": random.uniform(0.05, 0.92),
                "days_remaining": random.uniform(0.5, 18),
                "has_disruption": has_d,
                "disruption": random.choice(DISRUPTIONS) if has_d else None,
                "rec": random.choice(AI_RECS),
                "quantum_opt": random.random() < 0.4,
            })
        return ships

    def get_shipments(self):
        self._tick += 1
        result = []
        for s in self._seed:
            prog = min(s["progress"] + self._tick * 0.001, 0.99)
            risk = min(100, s["base_risk"] + (12 if s["has_disruption"] else 0)
                       + random.uniform(-2, 2))
            pos = _lerp(s["origin"], s["destination"], prog)
            eta = (datetime.utcnow() + timedelta(days=s["days_remaining"]*(1-prog*0.3))).isoformat()
            status = ("delayed" if s["has_disruption"] and random.random()<0.5 else
                      "disrupted" if s["has_disruption"] else
                      "delivered" if prog>0.95 else
                      "booked" if prog<0.1 else
                      random.choice(["in_transit","at_port","customs","in_transit"]))
            result.append({
                "id": s["id"],
                "origin": s["origin"]["name"],
                "origin_code": s["origin"]["code"],
                "destination": s["destination"]["name"],
                "destination_code": s["destination"]["code"],
                "carrier": s["carrier"],
                "cargo_type": s["cargo_type"],
                "weight_kg": s["weight_kg"],
                "value_usd": s["value_usd"],
                "status": status,
                "current_location": pos,
                "eta": eta,
                "risk_score": round(risk, 1),
                "risk_level": _risk_label(risk),
                "disruption_probability": round(risk/100, 2),
                "has_disruption": s["has_disruption"],
                "disruption": s["disruption"],
                "progress": round(prog, 3),
                "quantum_route_optimized": s["quantum_opt"],
                "ai_recommendation": s["rec"],
                "value_at_risk": round(s["value_usd"] * risk/100, 0),
            })
        return result

    def get_kpis(self):
        ships = self.get_shipments()
        at_risk = sum(1 for s in ships if s["risk_level"] in ["high","critical"])
        disrupted = sum(1 for s in ships if s["has_disruption"])
        on_time = sum(1 for s in ships if not s["has_disruption"])
        return {
            "total_shipments": len(ships),
            "active_disruptions": disrupted,
            "at_risk_shipments": at_risk,
            "on_time_rate": round(on_time/len(ships)*100, 1),
            "avg_risk_score": round(sum(s["risk_score"] for s in ships)/len(ships), 1),
            "cost_savings_today": round(random.uniform(180000, 620000), 0),
            "autonomous_actions": random.randint(7, 31),
            "ports_monitored": len(PORTS),
            "total_value_tracked_usd": sum(s["value_usd"] for s in ships),
            "total_value_at_risk_usd": sum(s["value_at_risk"] for s in ships),
        }

    def get_disruptions(self):
        ships = self.get_shipments()
        alerts = []
        for s in ships:
            if s["has_disruption"] and s["disruption"]:
                d = s["disruption"]
                alerts.append({
                    "id": f"ALT-{s['id']}",
                    "shipment_id": s["id"],
                    "type": d["type"],
                    "severity": d["severity"],
                    "description": d["desc"],
                    "icon": d.get("icon","⚠"),
                    "location": s["current_location"],
                    "predicted_delay_hours": d["delay_h"],
                    "financial_impact_usd": round(s["value_usd"]*0.04, 0),
                    "confidence": round(random.uniform(0.72, 0.96), 2),
                    "ai_recommendation": s["ai_recommendation"],
                    "alternative_routes": [
                        {"route": f"Via {random.choice(PORTS)['name']}",
                         "extra_cost_usd": round(random.uniform(2000,18000),0),
                         "time_delta_hours": round(random.uniform(-12,48),0),
                         "reliability": round(random.uniform(0.78,0.97),2)}
                        for _ in range(2)
                    ],
                    "timestamp": datetime.utcnow().isoformat(),
                })
        return alerts

    def get_ports(self):
        result = []
        for p in PORTS:
            cong = round(random.uniform(0.1, 0.92), 2)
            result.append({
                **p,
                "congestion_level": cong,
                "congestion_pct": round(cong*100, 0),
                "avg_wait_days": round(cong*12, 1),
                "active_vessels": random.randint(8,180),
                "status": "critical" if cong>0.8 else "high" if cong>0.6 else "normal",
            })
        return result

    def get_live_update(self):
        ships = self.get_shipments()
        alerts = self.get_disruptions()
        s = random.choice(ships)
        return {
            "type": "live_update",
            "timestamp": datetime.utcnow().isoformat(),
            "kpis": self.get_kpis(),
            "new_alert": random.choice(alerts) if alerts and random.random()<0.3 else None,
            "shipment_update": {
                "id": s["id"],
                "risk_score": s["risk_score"],
                "status": s["status"],
                "event": random.choice([
                    "Position updated","Port entry confirmed",
                    "Customs cleared","Risk score recalculated","AI agent acted"
                ]),
            }
        }

    def get_forecast(self):
        lanes = [
            ("Shanghai → Rotterdam","Asia-Europe"),
            ("LA → Shanghai","Trans-Pacific"),
            ("Rotterdam → New York","Trans-Atlantic"),
            ("Singapore → Mumbai","Intra-Asia"),
            ("Dubai → Hamburg","Middle East-Europe"),
        ]
        result = []
        for route, lane in lanes:
            base = random.uniform(800, 4200)
            result.append({
                "route": route, "lane": lane,
                "period": "Next 30 days",
                "predicted_volume_teu": round(base, 0),
                "confidence_low": round(base*0.88, 0),
                "confidence_high": round(base*1.14, 0),
                "trend": random.choice(["increasing","stable","decreasing"]),
                "demand_index": round(random.uniform(72,134), 1),
                "key_factors": random.sample([
                    "Peak season demand","Tariff changes",
                    "Port capacity limits","Geopolitical rerouting",
                    "Consumer demand surge","Manufacturing growth",
                ], 2),
            })
        return result

_sim_instance = FreightSimulator()

def get_sim():
    return _sim_instance

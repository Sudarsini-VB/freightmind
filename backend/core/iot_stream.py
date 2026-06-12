"""
FreightMind - IoT Vehicle Telemetry Streaming Engine
Simulates real-time data from trucks, ships, sensors — exactly what
platforms like Condense (Zeliot) process via Kafka streams.

In production: connect to real AIS feed, GPS trackers, OBD-II devices,
temperature sensors, fuel sensors via MQTT/Kafka topics.
"""
import random
import math
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Generator

random.seed(0)

# Simulated vehicle/vessel fleet
FLEET = [
    # Ocean vessels
    {"id":"VSL-SHA-001","type":"container_vessel","name":"MSC Aurora","carrier":"MSC",
     "lat":31.23,"lng":121.47,"route":"SHA→RTM","speed_knots":18,"capacity_teu":14000},
    {"id":"VSL-SIN-001","type":"container_vessel","name":"Maersk Elba","carrier":"Maersk",
     "lat":1.29,"lng":103.85,"route":"SIN→LAX","speed_knots":20,"capacity_teu":18000},
    {"id":"VSL-RTM-001","type":"container_vessel","name":"CMA CGM Rhine","carrier":"CMA CGM",
     "lat":51.90,"lng":4.48,"route":"RTM→NYC","speed_knots":17,"capacity_teu":11000},
    {"id":"VSL-DXB-001","type":"container_vessel","name":"Hapag Berlin","carrier":"Hapag-Lloyd",
     "lat":24.98,"lng":55.06,"route":"DXB→ANR","speed_knots":19,"capacity_teu":13500},
    # Trucks (last-mile)
    {"id":"TRK-EU-001","type":"truck","name":"Truck EU-001","carrier":"DB Schenker",
     "lat":52.37,"lng":4.90,"route":"RTM→AMS","speed_kmh":85,"capacity_tonnes":24},
    {"id":"TRK-EU-002","type":"truck","name":"Truck EU-002","carrier":"DHL Freight",
     "lat":51.51,"lng":0.13,"route":"FLX→LDN","speed_kmh":90,"capacity_tonnes":22},
    {"id":"TRK-US-001","type":"truck","name":"Truck US-001","carrier":"FedEx Freight",
     "lat":33.74,"lng":-118.27,"route":"LAX→PHX","speed_kmh":95,"capacity_tonnes":20},
    {"id":"TRK-IN-001","type":"truck","name":"Truck IN-001","carrier":"Blue Dart",
     "lat":19.08,"lng":72.88,"route":"BOM→PNE","speed_kmh":70,"capacity_tonnes":15},
    # Refrigerated trucks (cold chain)
    {"id":"RFTRK-001","type":"reefer_truck","name":"Reefer EU-001","carrier":"Kuehne+Nagel",
     "lat":50.11,"lng":8.68,"route":"FRA→MUC","speed_kmh":80,"capacity_tonnes":18,
     "temp_setpoint_c":-18},
    {"id":"RFTRK-002","type":"reefer_truck","name":"Reefer AS-001","carrier":"Toll Group",
     "lat":1.30,"lng":103.86,"route":"SIN→KUL","speed_kmh":75,"capacity_tonnes":16,
     "temp_setpoint_c":4},
]

ALERT_TYPES = [
    {"code":"TEMP_EXCURSION","msg":"Temperature exceeded threshold","severity":"critical","type":"reefer_truck"},
    {"code":"FUEL_LOW","msg":"Fuel level below 15%","severity":"high","type":"truck"},
    {"code":"HARSH_BRAKING","msg":"Harsh braking event detected","severity":"medium","type":"truck"},
    {"code":"SPEEDING","msg":"Speed limit exceeded by >20%","severity":"medium","type":"truck"},
    {"code":"ENGINE_FAULT","msg":"Engine fault code detected","severity":"high","type":"truck"},
    {"code":"DEVIATION","msg":"Route deviation detected","severity":"high","type":"any"},
    {"code":"GEOFENCE_EXIT","msg":"Vehicle exited designated zone","severity":"medium","type":"any"},
    {"code":"AIS_DARK","msg":"AIS transponder signal lost","severity":"critical","type":"container_vessel"},
    {"code":"ROUGH_SEA","msg":"Wave height >5m detected at location","severity":"high","type":"container_vessel"},
]

def _noise(base: float, pct: float = 0.05) -> float:
    return base * (1 + random.gauss(0, pct))

def _vehicle_telemetry(v: Dict, tick: int) -> Dict:
    """Generate realistic IoT telemetry for one vehicle"""
    # Position drift simulation
    drift_lat = math.sin(tick * 0.1) * 0.05
    drift_lng = math.cos(tick * 0.1) * 0.08

    is_vessel = v["type"] == "container_vessel"
    is_reefer = v["type"] == "reefer_truck"

    # Base telemetry
    telemetry = {
        "vehicle_id": v["id"],
        "vehicle_type": v["type"],
        "vehicle_name": v["name"],
        "carrier": v["carrier"],
        "route": v["route"],
        "timestamp": datetime.utcnow().isoformat(),
        "tick": tick,
        "position": {
            "lat": round(v["lat"] + drift_lat, 6),
            "lng": round(v["lng"] + drift_lng, 6),
            "accuracy_m": round(random.uniform(1, 15), 1),
        },
    }

    if is_vessel:
        telemetry["vessel"] = {
            "speed_knots": round(_noise(v.get("speed_knots", 18), 0.08), 1),
            "heading_deg": round(random.uniform(0, 359), 1),
            "draught_m": round(_noise(12.5, 0.03), 2),
            "wind_speed_knots": round(random.uniform(5, 35), 1),
            "wave_height_m": round(random.uniform(0.5, 4.5), 2),
            "fuel_consumption_mt_day": round(_noise(85, 0.05), 1),
            "engine_rpm": random.randint(88, 105),
            "cargo_teu": v.get("capacity_teu", 10000),
            "ais_signal": random.random() > 0.02,  # 2% chance of dark vessel
        }
    else:
        fuel_level = max(5, 100 - (tick * 0.4) % 100)
        telemetry["vehicle"] = {
            "speed_kmh": round(_noise(v.get("speed_kmh", 80), 0.10), 1),
            "fuel_level_pct": round(fuel_level, 1),
            "fuel_rate_l100km": round(_noise(28 if is_reefer else 32, 0.08), 1),
            "engine_temp_c": round(_noise(92, 0.04), 1),
            "odometer_km": round(v.get("_odo", 150000) + tick * 0.5, 0),
            "rpm": random.randint(1200, 2800),
            "driver_id": f"DRV-{v['id'][-3:]}",
            "harsh_event": random.random() < 0.03,  # 3% chance per tick
            "seatbelt": True,
        }
        if is_reefer:
            setpoint = v.get("temp_setpoint_c", -18)
            telemetry["cold_chain"] = {
                "temp_c": round(_noise(setpoint, 0.04), 2),
                "setpoint_c": setpoint,
                "humidity_pct": round(random.uniform(85, 95), 1),
                "compressor_status": "running",
                "door_open": random.random() < 0.01,
                "temp_excursion": abs(_noise(setpoint, 0.04) - setpoint) > 2,
            }

    # Generate alert if conditions met
    telemetry["alerts"] = _check_alerts(telemetry, v)
    return telemetry

def _check_alerts(t: Dict, v: Dict) -> List[Dict]:
    alerts = []
    vtype = v["type"]

    if vtype == "container_vessel":
        vessel = t.get("vessel", {})
        if not vessel.get("ais_signal", True):
            alerts.append({"code":"AIS_DARK","severity":"critical",
                          "msg":"AIS transponder signal lost — dark vessel","ts":t["timestamp"]})
        if vessel.get("wave_height_m", 0) > 4.0:
            alerts.append({"code":"ROUGH_SEA","severity":"high",
                          "msg":f"Wave height {vessel['wave_height_m']}m — navigate with caution","ts":t["timestamp"]})

    elif vtype in ["truck","reefer_truck"]:
        vehicle = t.get("vehicle", {})
        if vehicle.get("fuel_level_pct", 100) < 15:
            alerts.append({"code":"FUEL_LOW","severity":"high",
                          "msg":f"Fuel critical: {vehicle['fuel_level_pct']:.0f}%","ts":t["timestamp"]})
        if vehicle.get("harsh_event"):
            alerts.append({"code":"HARSH_BRAKING","severity":"medium",
                          "msg":"Harsh braking/acceleration event","ts":t["timestamp"]})

    if vtype == "reefer_truck":
        cc = t.get("cold_chain", {})
        if cc.get("temp_excursion"):
            alerts.append({"code":"TEMP_EXCURSION","severity":"critical",
                          "msg":f"Temperature excursion: {cc['temp_c']}°C (setpoint {cc['setpoint_c']}°C)","ts":t["timestamp"]})
        if cc.get("door_open"):
            alerts.append({"code":"DOOR_OPEN","severity":"medium",
                          "msg":"Refrigeration unit door open while moving","ts":t["timestamp"]})

    return alerts

class IoTStreamEngine:
    """
    Real-time IoT telemetry engine.
    In production: publishes to Kafka topics per vehicle type.
    Topic structure: freightmind.telemetry.{vehicle_type}
    Equivalent to what Condense (Zeliot) processes from real fleet.
    """
    def __init__(self):
        self._tick = 0
        self._fleet = [dict(v) for v in FLEET]
        self._event_log: List[Dict] = []

    def tick(self) -> List[Dict]:
        """Generate one tick of telemetry for entire fleet"""
        self._tick += 1
        batch = []
        for v in self._fleet:
            t = _vehicle_telemetry(v, self._tick)
            batch.append(t)
            for a in t.get("alerts", []):
                self._event_log.append({**a, "vehicle_id": v["id"], "vehicle_name": v["name"]})
        self._event_log = self._event_log[-500:]  # keep last 500 events
        return batch

    def get_fleet_summary(self) -> Dict:
        batch = self.tick()
        total_alerts = sum(len(t.get("alerts", [])) for t in batch)
        critical = sum(1 for t in batch for a in t.get("alerts",[]) if a["severity"]=="critical")
        vessels = [t for t in batch if t["vehicle_type"]=="container_vessel"]
        trucks  = [t for t in batch if t["vehicle_type"] in ["truck","reefer_truck"]]

        return {
            "fleet_size": len(batch),
            "vessels": len(vessels),
            "trucks": len(trucks),
            "active_alerts": total_alerts,
            "critical_alerts": critical,
            "avg_vessel_speed_knots": round(
                sum(t.get("vessel",{}).get("speed_knots",0) for t in vessels)/max(len(vessels),1),1),
            "avg_truck_speed_kmh": round(
                sum(t.get("vehicle",{}).get("speed_kmh",0) for t in trucks)/max(len(trucks),1),1),
            "dark_vessels": sum(1 for t in vessels if not t.get("vessel",{}).get("ais_signal",True)),
            "temp_excursions": sum(1 for t in batch if any(a["code"]=="TEMP_EXCURSION" for a in t.get("alerts",[]))),
            "telemetry_events_per_min": len(batch) * 20,  # 3s per tick → ~20/min
            "kafka_topics": ["freightmind.telemetry.vessel","freightmind.telemetry.truck","freightmind.telemetry.reefer"],
            "stream_latency_ms": round(random.uniform(12, 45), 1),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_vehicles(self) -> List[Dict]:
        return self.tick()

    def get_event_log(self, limit: int = 50) -> List[Dict]:
        return list(reversed(self._event_log[:limit]))

    def get_cold_chain_status(self) -> List[Dict]:
        batch = self.tick()
        return [t for t in batch if t["vehicle_type"] == "reefer_truck"]

    def get_vessel_status(self) -> List[Dict]:
        batch = self.tick()
        return [t for t in batch if t["vehicle_type"] == "container_vessel"]

_iot = IoTStreamEngine()
def get_iot(): return _iot

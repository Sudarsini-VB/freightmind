"""FreightMind - Ports Router"""
from fastapi import APIRouter
from core.simulator import get_sim

router = APIRouter()

@router.get("")
def get_ports():
    return {"ports": get_sim().get_ports()}

@router.get("/congestion")
def get_congestion():
    ports = get_sim().get_ports()
    return {
        "ports": ports,
        "critical": [p for p in ports if p["status"] == "critical"],
        "avg_congestion": round(sum(p["congestion_level"] for p in ports) / len(ports), 2),
    }

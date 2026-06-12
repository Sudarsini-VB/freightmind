"""FreightMind - IoT Telemetry Router"""
from fastapi import APIRouter, Query
from core.iot_stream import get_iot

router = APIRouter()

@router.get("/fleet")
def fleet_summary():
    return get_iot().get_fleet_summary()

@router.get("/vehicles")
def all_vehicles():
    return {"vehicles": get_iot().get_vehicles()}

@router.get("/vessels")
def vessels():
    return {"vessels": get_iot().get_vessel_status()}

@router.get("/cold-chain")
def cold_chain():
    return {"reefer_trucks": get_iot().get_cold_chain_status()}

@router.get("/events")
def event_log(limit: int = Query(50, le=200)):
    return {"events": get_iot().get_event_log(limit)}

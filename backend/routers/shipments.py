"""FreightMind - Shipments Router"""
from fastapi import APIRouter, Query
from typing import Optional
from core.simulator import get_sim

router = APIRouter()

@router.get("")
def get_shipments(status: Optional[str]=None, risk_level: Optional[str]=None,
                  carrier: Optional[str]=None, limit: int=Query(50, le=100)):
    ships = get_sim().get_shipments()
    if status:      ships = [s for s in ships if s["status"]==status]
    if risk_level:  ships = [s for s in ships if s["risk_level"]==risk_level]
    if carrier:     ships = [s for s in ships if carrier.lower() in s["carrier"].lower()]
    return {"shipments": ships[:limit], "total": len(ships)}

@router.get("/kpis")
def get_kpis():
    return get_sim().get_kpis()

@router.get("/{shipment_id}")
def get_one(shipment_id: str):
    ships = get_sim().get_shipments()
    match = next((s for s in ships if s["id"]==shipment_id), None)
    if not match:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Shipment not found")
    return match

@router.get("/{shipment_id}/twin")
def get_twin(shipment_id: str):
    from agents_engine.orchestrator import get_orchestrator
    ships = get_sim().get_shipments()
    ship = next((s for s in ships if s["id"]==shipment_id), None)
    if not ship:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Shipment not found")
    get_orchestrator().run_cycle([ship])
    twin = get_orchestrator().get_twin(shipment_id)
    return twin or {"shipment_id": shipment_id, "status": "initializing"}

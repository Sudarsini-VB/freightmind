"""FreightMind - ESG Router"""
from fastapi import APIRouter
from ml.esg import get_esg
from core.simulator import get_sim

router = APIRouter()

@router.get("/fleet-report")
def fleet_report():
    ships = get_sim().get_shipments()
    return get_esg().fleet_esg_report(ships)

@router.get("/shipment/{shipment_id}")
def shipment_emissions(shipment_id: str):
    ships = get_sim().get_shipments()
    ship = next((s for s in ships if s["id"]==shipment_id), None)
    if not ship:
        from fastapi import HTTPException
        raise HTTPException(404, "Not found")
    return get_esg().calculate_shipment_emissions(ship)

@router.get("/carriers")
def carrier_cii():
    from ml.esg import CARRIERS_CII
    return {"carriers": [{"carrier":k,**v} for k,v in CARRIERS_CII.items()]}

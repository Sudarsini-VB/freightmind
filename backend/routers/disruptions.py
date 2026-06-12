"""FreightMind - Disruptions Router"""
from fastapi import APIRouter
from core.simulator import get_sim
from ml.predictor import get_predictor

router = APIRouter()

@router.get("")
def get_disruptions():
    return {"alerts": get_sim().get_disruptions(), "timestamp": __import__("datetime").datetime.utcnow().isoformat()}

@router.get("/{shipment_id}/predict")
def predict(shipment_id: str):
    ships = get_sim().get_shipments()
    ship = next((s for s in ships if s["id"]==shipment_id), None)
    if not ship:
        from fastapi import HTTPException
        raise HTTPException(404, "Not found")
    return get_predictor().predict(
        origin=ship.get("origin","Shanghai"),
        destination=ship.get("destination","Rotterdam"),
        waypoints=["Red Sea","Suez Canal","Mediterranean"],
        cargo_type=ship.get("cargo_type","General"),
        carrier=ship.get("carrier","Unknown"),
    )

"""FreightMind - Forecast Router"""
from fastapi import APIRouter, Query
from core.simulator import get_sim
from ml.predictor import get_predictor

router = APIRouter()

@router.get("")
def get_forecasts():
    return {"forecasts": get_sim().get_forecast()}

@router.get("/demand")
def get_demand(route: str = Query("Shanghai → Rotterdam"), days: int = Query(30)):
    return get_predictor().demand_forecast(route, days)

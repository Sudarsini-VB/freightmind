"""FreightMind - Agents Router"""
from fastapi import APIRouter
from agents_engine.orchestrator import get_orchestrator
from core.simulator import get_sim

router = APIRouter()

@router.get("")
def agent_status():
    return {"agents": get_orchestrator().agent_status(), "total_actions": len(get_orchestrator().all_actions())}

@router.post("/run")
def run_cycle():
    ships = get_sim().get_shipments()
    return get_orchestrator().run_cycle(ships)

@router.get("/actions")
def get_actions():
    return {"actions": get_orchestrator().all_actions()}

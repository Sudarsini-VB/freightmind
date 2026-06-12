"""FreightMind - Quantum Optimizer Router"""
from fastapi import APIRouter
from quantum_engine.optimizer import get_optimizer

router = APIRouter()

@router.post("/optimize")
def optimize(body: dict):
    return get_optimizer().optimize(
        origin=body.get("origin","SHA"),
        destination=body.get("destination","RTM"),
        cargo_value=float(body.get("cargo_value",500000)),
        priority=body.get("priority","balanced"),
        avoid=body.get("avoid",[]),
    )

@router.get("/ports")
def get_ports():
    from quantum_engine.optimizer import PORTS
    return {"ports": [{"code":k,**v} for k,v in PORTS.items()]}

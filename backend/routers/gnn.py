"""FreightMind - GNN Router"""
from fastapi import APIRouter
from ml.gnn import get_gnn

router = APIRouter()

@router.get("/graph")
def get_graph():
    return get_gnn().get_graph_data()

@router.post("/propagate")
def propagate(body: dict):
    disrupted = body.get("disrupted_nodes", ["SHA"])
    return get_gnn().predict_propagation(disrupted)

@router.get("/network-stress")
def network_stress():
    # Default scenario: Red Sea / SHA disruption
    return get_gnn().predict_propagation(["SHA","DXB"])

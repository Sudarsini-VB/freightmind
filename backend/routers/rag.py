"""FreightMind - RAG Intelligence Router"""
from fastapi import APIRouter, HTTPException
from rag_engine.engine import get_rag

router = APIRouter()

@router.post("/query")
def query(body: dict):
    q = body.get("question","")
    if not q: raise HTTPException(400,"question required")
    return get_rag().query(q, shipment_context=body.get("context"))

@router.get("/knowledge-base")
def get_kb():
    return {"articles": get_rag().get_kb()}

@router.get("/regulations")
def get_regs():
    return {"regulations": get_rag().get_by_cat("regulation")}

@router.get("/market")
def get_market():
    return {"intelligence": get_rag().get_by_cat("market") + get_rag().get_by_cat("tariff")}

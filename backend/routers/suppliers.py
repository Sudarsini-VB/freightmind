"""FreightMind - Supplier Risk Router"""
from fastapi import APIRouter
from ml.supplier import get_supplier_risks, get_supplier_detail

router = APIRouter()

@router.get("")
def get_all(): return {"suppliers": get_supplier_risks()}

@router.get("/{supplier_id}")
def get_one(supplier_id: str): return get_supplier_detail(supplier_id)

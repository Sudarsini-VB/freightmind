"""FreightMind - Hardware Configuration Router"""
from fastapi import APIRouter
from core.hardware_config import get_hw_config

router = APIRouter()

@router.get("/status")
def hw_status():
    return get_hw_config().status()

@router.get("/summary")
def hw_summary():
    hw = get_hw_config()
    return {
        "mode": hw.summary_line(),
        "hardware_required": False,
        "message": "FreightMind runs 100% on software. All hardware is optional.",
    }

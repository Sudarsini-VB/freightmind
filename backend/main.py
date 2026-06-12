"""
FreightMind v2.0 — Autonomous Global Freight Intelligence Platform
100% Software. Hardware is optional. Zero hardware required to run.

Advanced fields:
  AI/ML · Quantum QAOA · RAG+LLM · Digital Twin · Multi-Agent
  GNN · ESG Carbon · IoT Streaming · Zero-Trust Security
"""
import asyncio, json
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

from routers import (
    shipments, disruptions, quantum, rag, agents,
    auth, ports, forecast, gnn, esg, suppliers, iot, hardware
)
from core.simulator import FreightSimulator
from core.websocket_manager import WSManager
from core.hardware_config import get_hw_config

app = FastAPI(
    title="FreightMind API",
    description=(
        "Autonomous Global Freight Intelligence Platform v2.0 — "
        "100% Software. Hardware optional."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 13 router modules
app.include_router(auth.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(shipments.router,  prefix="/api/shipments",  tags=["Shipments"])
app.include_router(disruptions.router,prefix="/api/disruptions",tags=["Disruptions"])
app.include_router(quantum.router,    prefix="/api/quantum",    tags=["Quantum QAOA"])
app.include_router(rag.router,        prefix="/api/rag",        tags=["RAG Intelligence"])
app.include_router(agents.router,     prefix="/api/agents",     tags=["AI Agents"])
app.include_router(ports.router,      prefix="/api/ports",      tags=["Ports"])
app.include_router(forecast.router,   prefix="/api/forecast",   tags=["Forecast"])
app.include_router(gnn.router,        prefix="/api/gnn",        tags=["GNN Graph"])
app.include_router(esg.router,        prefix="/api/esg",        tags=["ESG Carbon"])
app.include_router(suppliers.router,  prefix="/api/suppliers",  tags=["Supplier Risk"])
app.include_router(iot.router,        prefix="/api/iot",        tags=["IoT Telemetry"])
app.include_router(hardware.router,   prefix="/api/hardware",   tags=["Hardware Config"])

sim = FreightSimulator()
ws_manager = WSManager()

@app.websocket("/ws/live")
async def live_feed(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = sim.get_live_update()
            await ws_manager.send(json.dumps(data), websocket)
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/api/health")
def health():
    hw = get_hw_config()
    return {
        "status": "ok",
        "version": "2.0.0",
        "hardware_required": False,
        "system_mode": hw.summary_line(),
        "modules": [
            "AI/ML Ensemble", "Quantum QAOA", "RAG+LLM",
            "Digital Twin", "Multi-Agent (5)", "GNN",
            "ESG Carbon", "IoT Streaming", "Zero-Trust Security",
        ],
    }

@app.get("/api/dashboard")
def dashboard():
    return sim.get_kpis()

# Serve React build in production
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

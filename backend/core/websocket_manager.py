"""FreightMind - WebSocket Connection Manager"""
from fastapi import WebSocket
from typing import List

class WSManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def send(self, msg: str, ws: WebSocket):
        try:
            await ws.send_text(msg)
        except Exception:
            self.disconnect(ws)

    async def broadcast(self, msg: str):
        dead = []
        for ws in self.connections:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

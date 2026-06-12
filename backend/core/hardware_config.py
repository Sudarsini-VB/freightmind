"""
FreightMind - Hardware Configuration Manager
ALL hardware is 100% OPTIONAL. System runs fully on software by default.
Hardware devices enhance real-world data but are never required.

MODE AUTO-DETECTION:
  If real device credentials exist in .env → use real hardware
  Otherwise → use built-in software simulator (default)

Supported optional hardware:
  - AIS transponder / AIS stream feed  → software sim: vessel position generator
  - GPS tracker (vehicle)              → software sim: route interpolator
  - IoT sensors (temp/fuel/engine)     → software sim: telemetry generator
  - RFID scanner (warehouse)           → software sim: inventory events
  - Quantum computer (IBM/D-Wave)      → software sim: QAOA classical emulator
  - Weather station                    → software sim: NOAA historical patterns
"""
import os
from typing import Dict, Any

class HardwareConfig:
    """
    Central hardware configuration.
    Every component checks this before deciding to use real or simulated data.
    """

    def __init__(self):
        self._cfg = {
            # AIS / Vessel tracking
            "ais_stream": {
                "enabled":    bool(os.getenv("AIS_STREAM_API_KEY")),
                "api_key":    os.getenv("AIS_STREAM_API_KEY", ""),
                "ws_url":     "wss://stream.aisstream.io/v0/stream",
                "sim_fallback": True,
                "description": "Real-time AIS vessel position feed",
                "get_started": "https://aisstream.io — free API key, no hardware needed",
            },
            # GPS vehicle tracking
            "gps_tracker": {
                "enabled":    bool(os.getenv("GPS_TRACKER_HOST")),
                "host":       os.getenv("GPS_TRACKER_HOST", ""),
                "protocol":   os.getenv("GPS_TRACKER_PROTOCOL", "mqtt"),
                "sim_fallback": True,
                "description": "Real GPS tracker (OBD-II, Teltonika, Queclink, etc.)",
                "get_started": "Any MQTT-capable GPS tracker works — or use simulator",
            },
            # IoT sensors (temperature, fuel, engine)
            "iot_sensors": {
                "enabled":    bool(os.getenv("MQTT_BROKER_HOST")),
                "broker":     os.getenv("MQTT_BROKER_HOST", "localhost"),
                "port":       int(os.getenv("MQTT_BROKER_PORT", "1883")),
                "topic_base": "freightmind/sensors",
                "sim_fallback": True,
                "description": "MQTT IoT sensor data (temperature, fuel, OBD-II)",
                "get_started": "Run local mosquitto broker: docker run -p 1883:1883 eclipse-mosquitto",
            },
            # Quantum computing backend
            "quantum_backend": {
                "enabled":    bool(os.getenv("IBM_QUANTUM_TOKEN") or os.getenv("DWAVE_API_TOKEN")),
                "provider":   os.getenv("QUANTUM_PROVIDER", "simulator"),  # simulator|ibm|dwave
                "ibm_token":  os.getenv("IBM_QUANTUM_TOKEN", ""),
                "dwave_token":os.getenv("DWAVE_API_TOKEN", ""),
                "sim_fallback": True,
                "description": "Real quantum hardware (IBM Qiskit / D-Wave Leap)",
                "get_started": "https://quantum.ibm.com — 10min free access, no hardware",
            },
            # LLM for RAG (optional — system works with built-in answers)
            "llm_api": {
                "enabled":    bool(os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY")),
                "provider":   "anthropic" if os.getenv("ANTHROPIC_API_KEY") else
                              "openai" if os.getenv("OPENAI_API_KEY") else "builtin",
                "anthropic_key": os.getenv("ANTHROPIC_API_KEY", ""),
                "openai_key":    os.getenv("OPENAI_API_KEY", ""),
                "sim_fallback": True,
                "description": "LLM for RAG (Claude/GPT-4). Built-in answers used if not set.",
                "get_started": "https://console.anthropic.com — free tier available",
            },
            # Weather API
            "weather_api": {
                "enabled":    bool(os.getenv("NOAA_API_KEY") or os.getenv("OPENWEATHER_API_KEY")),
                "provider":   "noaa" if os.getenv("NOAA_API_KEY") else
                              "openweather" if os.getenv("OPENWEATHER_API_KEY") else "builtin",
                "api_key":    os.getenv("NOAA_API_KEY") or os.getenv("OPENWEATHER_API_KEY", ""),
                "sim_fallback": True,
                "description": "Live weather data for disruption prediction",
                "get_started": "https://openweathermap.org/api — free tier: 60 calls/min",
            },
            # GDELT news feed
            "news_feed": {
                "enabled":    bool(os.getenv("GDELT_ENABLED", "")),
                "url":        "https://api.gdeltproject.org/api/v2/doc/doc",
                "sim_fallback": True,
                "description": "GDELT geopolitical news signal extractor",
                "get_started": "No API key needed — GDELT is fully public",
            },
        }

    def is_enabled(self, component: str) -> bool:
        return self._cfg.get(component, {}).get("enabled", False)

    def get(self, component: str) -> Dict[str, Any]:
        return self._cfg.get(component, {})

    def status(self) -> Dict[str, Any]:
        """Return full hardware status — used by /api/hardware/status endpoint"""
        result = {}
        for name, cfg in self._cfg.items():
            result[name] = {
                "mode":        "hardware" if cfg["enabled"] else "software_simulation",
                "enabled":     cfg["enabled"],
                "sim_fallback": cfg["sim_fallback"],
                "description": cfg["description"],
                "get_started": cfg.get("get_started",""),
                "status":      "🟢 Active (real)" if cfg["enabled"] else "🔵 Active (simulated)",
            }
        return {
            "system_mode": "full_software" if not any(c["enabled"] for c in self._cfg.values()) else "hybrid",
            "hardware_required": False,
            "components": result,
            "note": "All hardware is optional. System runs 100% on software by default. "
                    "Add API keys to .env to connect real devices."
        }

    def summary_line(self) -> str:
        enabled = [k for k,v in self._cfg.items() if v["enabled"]]
        if not enabled:
            return "Pure software mode — all modules simulated"
        return f"Hybrid mode — real: {', '.join(enabled)}"

_hw = HardwareConfig()
def get_hw_config(): return _hw

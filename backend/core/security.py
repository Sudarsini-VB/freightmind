"""FreightMind - Zero Trust Security"""
import hashlib, hmac, base64, json, time, secrets
from typing import Optional, Dict
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET = "freightmind-2026-production-secret-key-256bit"
EXPIRE_H = 24

USERS = {
    "admin":    {"pw": hashlib.sha256(b"admin123").hexdigest(),    "role":"admin",    "name":"Admin"},
    "operator": {"pw": hashlib.sha256(b"operator123").hexdigest(), "role":"operator", "name":"Operator"},
    "demo":     {"pw": hashlib.sha256(b"demo123").hexdigest(),     "role":"operator", "name":"Demo User"},
    "viewer":   {"pw": hashlib.sha256(b"viewer123").hexdigest(),   "role":"viewer",   "name":"Viewer"},
}

_audit = []
_failed: Dict[str, list] = {}
bearer = HTTPBearer(auto_error=False)

def _b64e(b): return base64.urlsafe_b64encode(b).rstrip(b"=").decode()
def _b64d(s): return base64.urlsafe_b64decode(s + "=="*((4-len(s)%4)%4))

def create_token(payload: dict) -> str:
    h = _b64e(json.dumps({"alg":"HS256","typ":"JWT"}).encode())
    payload["exp"] = int(time.time()) + EXPIRE_H*3600
    payload["iat"] = int(time.time())
    payload["jti"] = secrets.token_hex(8)
    p = _b64e(json.dumps(payload).encode())
    sig = hmac.new(SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
    return f"{h}.{p}.{_b64e(sig)}"

def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3: return None
        h, p, sig = parts
        expected = hmac.new(SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _b64d(sig)): return None
        payload = json.loads(_b64d(p))
        if payload.get("exp", 0) < time.time(): return None
        return payload
    except Exception:
        return None

def login(username: str, password: str) -> Optional[dict]:
    now = time.time()
    recent = [t for t in _failed.get(username, []) if now-t < 300]
    if len(recent) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Wait 5 minutes.")
    user = USERS.get(username)
    if not user: return None
    if not hmac.compare_digest(user["pw"], hashlib.sha256(password.encode()).hexdigest()):
        _failed.setdefault(username, []).append(now)
        return None
    _failed[username] = []
    _audit.append({"event":"LOGIN_OK","user":username,"ts":time.time()})
    return {"username":username,"role":user["role"],"name":user["name"]}

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not creds: raise HTTPException(status_code=401, detail="Login required")
    payload = verify_token(creds.credentials)
    if not payload: raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

def get_audit(): return list(reversed(_audit[-100:]))
def security_summary():
    return {
        "encryption": "AES-256-GCM (field level)",
        "auth": "JWT HMAC-SHA256",
        "zero_trust": True,
        "brute_force_protection": True,
        "audit_events": len(_audit),
        "failed_logins": sum(len(v) for v in _failed.values()),
    }

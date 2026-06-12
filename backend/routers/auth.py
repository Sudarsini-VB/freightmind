"""FreightMind - Auth Router"""
from fastapi import APIRouter, HTTPException
from core.security import login, create_token, get_audit, security_summary

router = APIRouter()

@router.post("/login")
def do_login(body: dict):
    user = login(body.get("username",""), body.get("password",""))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials. Try demo/demo123")
    token = create_token({"username":user["username"],"role":user["role"],"name":user["name"]})
    return {"access_token": token, "token_type": "bearer",
            "role": user["role"], "name": user["name"]}

@router.get("/security")
def get_security():
    return security_summary()

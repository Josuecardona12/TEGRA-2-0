from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginSchema(BaseModel):
    usuario: str
    password: str

@router.post("/login")
def login(data: LoginSchema):

    if data.usuario == "admin" and data.password == "1234":
        return {
            "access_token": "token-demo-123",
            "usuario": data.usuario
        }

    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

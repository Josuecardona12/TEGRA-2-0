from pydantic import BaseModel
from datetime import datetime


class OrdenCreate(BaseModel):
    codigo: str
    producto: str


class OrdenResponse(BaseModel):
    id: int
    codigo: str
    producto: str
    estado: str
    fecha_creacion: datetime

    class Config:
        orm_mode = True

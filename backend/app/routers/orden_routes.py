from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import orden_service
from app.schemas.orden_schema import OrdenCreate, OrdenResponse
from typing import List

router = APIRouter(prefix="/ordenes", tags=["Ordenes"])




@router.post("/", response_model=OrdenResponse)
def crear_orden(data: OrdenCreate, db: Session = Depends(get_db)):
    return orden_service.crear_orden(db, data.codigo, data.producto)


@router.get("/", response_model=List[OrdenResponse])
def listar_ordenes(db: Session = Depends(get_db)):
    return orden_service.obtener_ordenes(db)

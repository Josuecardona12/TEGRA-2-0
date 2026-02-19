from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.orden import Orden

router = APIRouter(prefix="/ordenes", tags=["Ordenes"])

@router.get("/")
def obtener_ordenes(db: Session = Depends(get_db)):
    return db.query(Orden).all()

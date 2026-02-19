from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base

class Movimiento(Base):
    __tablename__ = "movimientos"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    tipo = Column(String)
    area_origen = Column(String, nullable=True)
    area_destino = Column(String, nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow)

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime


class Movimiento(Base):
    __tablename__ = "movimientos"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    origen_id = Column(Integer)
    destino_id = Column(Integer)
    cantidad = Column(Integer)
    fecha = Column(DateTime, default=datetime.utcnow)

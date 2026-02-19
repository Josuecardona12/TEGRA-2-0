from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class Orden(Base):
    __tablename__ = "ordenes"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True)
    area_actual = Column(String)
    estado = Column(String, default="Pendiente")
    fecha_inicio = Column(DateTime, default=datetime.utcnow)

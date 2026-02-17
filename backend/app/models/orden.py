from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base


class Orden(Base):
    __tablename__ = "ordenes"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String, unique=True, index=True)
    producto = Column(String)
    estado = Column(String, default="Pendiente")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

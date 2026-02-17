from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class HistorialEscaneo(Base):

    __tablename__ = "historial"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes.id"))
    accion = Column(String)

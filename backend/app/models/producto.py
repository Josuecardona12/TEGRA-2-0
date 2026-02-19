from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo_barra = Column(String, unique=True, index=True)
    stock = Column(Integer, default=0)
    area_id = Column(Integer)

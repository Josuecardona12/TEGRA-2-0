from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inventario(Base):
    __tablename__ = "inventarios"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"))
    area_id = Column(Integer, ForeignKey("areas.id"))
    cantidad = Column(Integer, default=0)

    producto = relationship("Producto")
    area = relationship("Area")

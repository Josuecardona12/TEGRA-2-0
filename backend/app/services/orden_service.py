from sqlalchemy.orm import Session
from app.models.orden import Orden



def crear_orden(db: Session, codigo: str, producto: str):
    nueva_orden = Orden(
        codigo=codigo,
        producto=producto,
        estado="Pendiente"
    )
    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden)
    return nueva_orden


def obtener_ordenes(db: Session):
    return db.query(Orden).all()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.models.movimientos import Movimiento



router = APIRouter(prefix="/movimientos", tags=["Movimientos"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/scan")
def mover_por_codigo(
    codigo_barra: str,
    origen_id: int,
    destino_id: int,
    cantidad: int,
    db: Session = Depends(get_db)
):
    producto = db.query(Producto).filter(
        Producto.codigo_barra == codigo_barra
    ).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    inventario_origen = db.query(Inventario).filter_by(
        producto_id=producto.id,
        area_id=origen_id
    ).first()

    if not inventario_origen or inventario_origen.cantidad < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    # Restar origen
    inventario_origen.cantidad -= cantidad

    # Sumar destino
    inventario_destino = db.query(Inventario).filter_by(
        producto_id=producto.id,
        area_id=destino_id
    ).first()

    if not inventario_destino:
        inventario_destino = Inventario(
            producto_id=producto.id,
            area_id=destino_id,
            cantidad=0
        )
        db.add(inventario_destino)

    inventario_destino.cantidad += cantidad

    # Registrar movimiento
    movimiento = Movimiento(
        producto_id=producto.id,
        origen_id=origen_id,
        destino_id=destino_id,
        cantidad=cantidad,
        fecha=datetime.utcnow()
    )

    db.add(movimiento)
    db.commit()

    return {"message": "Movimiento realizado correctamente"}

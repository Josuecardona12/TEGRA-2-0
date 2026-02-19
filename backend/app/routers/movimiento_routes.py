from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.models.movimientos import Movimiento
from datetime import datetime

router = APIRouter(prefix="/movimientos", tags=["Movimientos"])


# ==========================
# CONEXIÓN DB
# ==========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================
# MOVER PRODUCTO POR CÓDIGO
# ==========================
@router.post("/scan")
def mover_por_codigo(
    codigo_barra: str,
    origen_id: int,
    destino_id: int,
    cantidad: int,
    db: Session = Depends(get_db)
):

    if cantidad <= 0:
        raise HTTPException(status_code=400, detail="Cantidad inválida")

    producto = db.query(Producto).filter(
        Producto.codigo_barra == codigo_barra
    ).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    inventario_origen = db.query(Inventario).filter(
        Inventario.producto_id == producto.id,
        Inventario.area_id == origen_id
    ).first()

    if not inventario_origen or inventario_origen.cantidad < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    # Restar stock
    inventario_origen.cantidad -= cantidad

    inventario_destino = db.query(Inventario).filter(
        Inventario.producto_id == producto.id,
        Inventario.area_id == destino_id
    ).first()

    if not inventario_destino:
        inventario_destino = Inventario(
            producto_id=producto.id,
            area_id=destino_id,
            cantidad=0
        )
        db.add(inventario_destino)

    inventario_destino.cantidad += cantidad

    movimiento = Movimiento(
        producto_id=producto.id,
        origen_id=origen_id,
        destino_id=destino_id,
        cantidad=cantidad,
        fecha=datetime.utcnow()
    )

    db.add(movimiento)
    db.commit()
    db.refresh(movimiento)

    return {
        "message": "Movimiento realizado correctamente",
        "producto": producto.nombre,
        "origen_id": origen_id,
        "destino_id": destino_id,
        "cantidad": cantidad,
        "fecha": movimiento.fecha
    }


# ==========================
# HISTORIAL
# ==========================
@router.get("/historial/{codigo_barra}")
def obtener_historial(codigo_barra: str, db: Session = Depends(get_db)):

    producto = db.query(Producto).filter(
        Producto.codigo_barra == codigo_barra
    ).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    movimientos = db.query(Movimiento).filter(
        Movimiento.producto_id == producto.id
    ).order_by(Movimiento.fecha.desc()).all()

    historial = []

    for mov in movimientos:
        historial.append({
            "origen_id": mov.origen_id,
            "destino_id": mov.destino_id,
            "cantidad": mov.cantidad,
            "fecha": mov.fecha
        })

    return {
        "producto": producto.nombre,
        "codigo_barra": producto.codigo_barra,
        "total_movimientos": len(historial),
        "movimientos": historial
    }

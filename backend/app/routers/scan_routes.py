from fastapi import APIRouter, Depends, WebSocket
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.producto import Producto
from app.models.movimientos import Movimiento

router = APIRouter(prefix="/scan", tags=["Scan"])

active_connections = []

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    while True:
        await websocket.receive_text()


@router.post("/")
async def scan_barcode(codigo_barra: str, nueva_area: str, db: Session = Depends(get_db)):

    producto = db.query(Producto).filter(
        Producto.codigo_barra == codigo_barra
    ).first()

    if not producto:
        return {"error": "Producto no encontrado"}

    movimiento = Movimiento(
        producto_id=producto.id,
        tipo="traslado",
        area_origen=str(producto.area_id),
        area_destino=nueva_area
    )

    producto.area_id = nueva_area

    db.add(movimiento)
    db.commit()
    db.refresh(producto)

    # 🔥 Notificar en tiempo real
    for connection in active_connections:
        await connection.send_json({
            "producto": producto.nombre,
            "area": nueva_area
        })

    return {
        "mensaje": "Movimiento registrado",
        "producto": producto.nombre,
        "nueva_area": nueva_area
    }

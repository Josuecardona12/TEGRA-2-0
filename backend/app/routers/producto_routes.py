from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.producto import Producto

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ====================================
# CREAR PRODUCTO
# ====================================
@router.post("/")
def crear_producto(
    nombre: str,
    codigo_barra: str,
    descripcion: str = "",
    db: Session = Depends(get_db)
):

    existe = db.query(Producto).filter(
        Producto.codigo_barra == codigo_barra
    ).first()

    if existe:
        raise HTTPException(status_code=400, detail="El código ya existe")

    nuevo = Producto(
        nombre=nombre,
        codigo_barra=codigo_barra,
        descripcion=descripcion
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo


# ====================================
# LISTAR PRODUCTOS
# ====================================
@router.get("/")
def listar_productos(db: Session = Depends(get_db)):
    return db.query(Producto).all()


# ====================================
# ELIMINAR PRODUCTO
# ====================================
@router.delete("/{producto_id}")
def eliminar_producto(producto_id: int, db: Session = Depends(get_db)):

    producto = db.query(Producto).filter(
        Producto.id == producto_id
    ).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db.delete(producto)
    db.commit()

    return {"message": "Producto eliminado correctamente"}

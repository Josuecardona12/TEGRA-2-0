from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine

# Importar modelos para que SQLAlchemy los registre
from app.models.area import Area
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.models.movimientos import Movimiento
from app.models.orden import Orden
from app.models.historial import Historial

# Routers
from app.routers import orden_routes, movimiento_routes, scan_routes, reportes_routes
from app.routers.auth_routes import router as auth_router
from app.routers import producto_routes
from app.routers import reportes_routes

# Crear app
app = FastAPI(title="MES Industrial")
Base.metadata.create_all(bind=engine)
# =========================
# CORS (DESARROLLO)
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # permitir todo en desarrollo
    allow_credentials=False,  # ⚠️ MUY IMPORTANTE
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas automáticamente
Base.metadata.create_all(bind=engine)

# Incluir routers
app.include_router(orden_routes.router)
app.include_router(movimiento_routes.router)
app.include_router(scan_routes.router)
app.include_router(reportes_routes.router)
app.include_router(auth_router)
app.include_router(producto_routes.router)
app.include_router(reportes_routes.router)

@app.get("/")
def root():
    return {"mensaje": "MES Industrial corriendo 🚀"}


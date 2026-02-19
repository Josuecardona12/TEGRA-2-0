from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routers import orden_routes, movimiento_routes, scan_routes
from app.routers import reportes_routes

# Crear app PRIMERO
app = FastAPI()
# Importar modelos para que SQLAlchemy los registre
from app.models.area import Area
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.models.movimientos import Movimiento
from app.models.orden import Orden
from app.models.historial import Historial
from app.routers.auth_routes import router as auth_router


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(orden_routes.router)
app.include_router(movimiento_routes.router)
app.include_router(scan_routes.router)
app.include_router(reportes_routes.router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {"mensaje": "MES Industrial corriendo 🚀"}

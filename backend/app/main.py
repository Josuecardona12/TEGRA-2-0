from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import orden_routes
from app.core.database import Base, engine

app = FastAPI()

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

app.include_router(orden_routes.router)

@app.get("/")
def root():
    return {"mensaje": "MES Industrial corriendo"}

@app.get("/mensaje")
def mensaje():
    return {"mensaje": "Hola desde FastAPI 🚀"}

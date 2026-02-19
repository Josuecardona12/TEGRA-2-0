from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.services.pdf_micelanios import generar_reporte_micelanios
from app.models.movimientos import Movimiento

router = APIRouter(prefix="/reportes", tags=["Reportes"])


# ==============================
# REPORTE MICELANIOS
# ==============================
@router.post("/micelanios")
def reporte_micelanios(
    inicio: str,
    fin: str,
    solo_criticos: bool = False,
    db: Session = Depends(get_db),
):

    try:
        fecha_inicio = datetime.fromisoformat(inicio)
        fecha_fin = datetime.fromisoformat(fin)
    except:
        return {"error": "Formato de fecha incorrecto. Usa YYYY-MM-DD"}

    movimientos = (
        db.query(Movimiento)
        .filter(Movimiento.fecha >= fecha_inicio)
        .filter(Movimiento.fecha <= fecha_fin)
        .all()
    )

    lotes = []

    for m in movimientos:
        horas = m.horas if hasattr(m, "horas") else 0
        maquina = m.maquina if hasattr(m, "maquina") else "N/A"
        area = m.area if hasattr(m, "area") else "N/A"

        estado = "CRITICO" if horas >= 6 else "NORMAL"

        lotes.append(
            {
                "id": m.id,
                "area": area,
                "maquina": maquina,
                "horas": horas,
                "estado": estado,
            }
        )

    pdf_buffer = generar_reporte_micelanios(
        lotes,
        inicio,
        fin,
        solo_criticos
    )

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=reporte_micelanios.pdf"
        },
    )


# ==============================
# REPORTE DINÁMICO PARA OTRAS ÁREAS
# ==============================
@router.post("/{area}")
def reporte_por_area(area: str):
    print("Área solicitada:", area)
    return {"mensaje": f"Reporte de {area} listo"}

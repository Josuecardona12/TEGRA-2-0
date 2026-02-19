from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.movimientos import Movimiento
from app.models.producto import Producto
from datetime import datetime
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import pagesizes
import os
import uuid

router = APIRouter(prefix="/reportes", tags=["Reportes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/movimientos-pdf")
def generar_reporte_pdf(
    fecha_inicio: str,
    fecha_fin: str,
    db: Session = Depends(get_db)
):
    try:
        fecha_inicio_dt = datetime.strptime(fecha_inicio, "%Y-%m-%d")
        fecha_fin_dt = datetime.strptime(fecha_fin, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")

    movimientos = db.query(Movimiento).filter(
        Movimiento.fecha >= fecha_inicio_dt,
        Movimiento.fecha <= fecha_fin_dt
    ).all()

    if not movimientos:
        raise HTTPException(status_code=404, detail="No hay movimientos en ese rango de fechas")

    # Nombre único para evitar conflictos
    file_name = f"reporte_{uuid.uuid4()}.pdf"
    file_path = os.path.join(os.getcwd(), file_name)

    doc = SimpleDocTemplate(file_path, pagesize=pagesizes.letter)
    elements = []

    styles = getSampleStyleSheet()
    elements.append(Paragraph("Reporte de Movimientos", styles["Title"]))
    elements.append(Spacer(1, 20))

    data = [["Producto", "Origen", "Destino", "Cantidad", "Fecha"]]

    for mov in movimientos:
        producto = db.query(Producto).filter(
            Producto.id == mov.producto_id
        ).first()

        data.append([
            producto.nombre if producto else "N/A",
            str(mov.origen_id),
            str(mov.destino_id),
            str(mov.cantidad),
            mov.fecha.strftime("%Y-%m-%d %H:%M")
        ])

    table = Table(data, repeatRows=1)

    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2E86C1")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
    ]))

    elements.append(table)
    doc.build(elements)

    return FileResponse(
        path=file_path,
        filename="reporte_movimientos.pdf",
        media_type="application/pdf"
    )

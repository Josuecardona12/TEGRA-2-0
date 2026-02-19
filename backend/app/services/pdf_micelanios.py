from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import pagesizes
from reportlab.lib.units import inch
from datetime import datetime
import io


def generar_reporte_micelanios(lotes, inicio, fin, solo_criticos=False):

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=pagesizes.A4)
    elements = []
    styles = getSampleStyleSheet()

    elements.append(
        Paragraph("REPORTE MICELÁNEOS - MES INDUSTRIAL", styles["Heading1"])
    )
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(
        Paragraph(f"Rango: {inicio}  -  {fin}", styles["Normal"])
    )
    elements.append(
        Paragraph(f"Generado: {datetime.now().strftime('%d/%m/%Y %H:%M')}", styles["Normal"])
    )
    elements.append(Spacer(1, 0.3 * inch))

    if solo_criticos:
        lotes = [l for l in lotes if l["estado"] == "CRITICO"]

    data = [["ID", "Área", "Máquina", "Horas", "Estado"]]

    for lote in lotes:
        data.append([
            str(lote["id"]),
            str(lote["area"]),
            str(lote["maquina"]),
            str(lote["horas"]),
            str(lote["estado"]),
        ])

    table = Table(data)

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))

    elements.append(table)
    doc.build(elements)

    buffer.seek(0)
    return buffer

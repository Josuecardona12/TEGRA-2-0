from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.http import JsonResponse
from .models import OrdenProduccion
import random


# =========================
# FUNCION SEMAFORO INDUSTRIAL
# =========================
def calcular_semaforo(pendientes, proceso):

    if pendientes > 10:
        return "Rojo"
    elif proceso > 5:
        return "Amarillo"

    return "Verde"


# =========================
# DASHBOARD ERP
# =========================
@login_required
def dashboard(request):

    total_ordenes = OrdenProduccion.objects.count()
    pendientes = OrdenProduccion.objects.filter(estado="Pendiente").count()
    proceso = OrdenProduccion.objects.filter(estado="Proceso").count()
    terminadas = OrdenProduccion.objects.filter(estado="Terminado").count()

    semaforo = calcular_semaforo(pendientes, proceso)

    estados = (
        OrdenProduccion.objects
        .values("estado")
        .annotate(total=Count("id"))
    )

    labels = [e["estado"] for e in estados]
    datos = [e["total"] for e in estados]

    return render(request, "dashboard.html", {
        "total_ordenes": total_ordenes,
        "pendientes": pendientes,
        "proceso": proceso,
        "terminadas": terminadas,
        "labels": labels,
        "datos": datos,
        "semaforo": semaforo
    })


# =========================
# API DASHBOARD TIEMPO REAL
# =========================
@login_required
def api_dashboard(request):

    ordenes = OrdenProduccion.objects.all()

    pendiente = ordenes.filter(estado="Pendiente").count()
    proceso = ordenes.filter(estado="Proceso").count()
    terminado = ordenes.filter(estado="Terminado").count()

    # ===== KPI SIMULADOS =====
    eficiencia = random.randint(70, 98)
    calidad = random.randint(80, 99)

    # ===== Orden activa =====
    orden_activa = ordenes.filter(estado="Proceso").first()

    producto = orden_activa.producto if orden_activa else "Sin Producción"

    # ===== Semáforo =====
    semaforo = calcular_semaforo(pendiente, proceso)

    data = {
        "produccion": proceso,
        "producto": str(producto),

        "pendiente": pendiente,
        "proceso": proceso,
        "terminado": terminado,

        "eficiencia": eficiencia,
        "calidad": calidad,

        "semaforo": semaforo,

        "nuevaOrden": random.choice([True, False]),
        "progresoLinea": random.randint(40, 100)
    }

    return JsonResponse(data)


# =========================
# ESCANEAR ORDEN (CODIGO BARRAS)
# =========================
@login_required
def escanear_orden(request, codigo):

    orden = get_object_or_404(OrdenProduccion, id=codigo)

    orden.estado = "Proceso"
    orden.save()

    return JsonResponse({
        "mensaje": "Orden actualizada",
        "orden": orden.producto
    })


# =========================
# LISTA ORDENES
# =========================
@login_required
def lista_ordenes(request):

    ordenes = OrdenProduccion.objects.all()

    return render(request, "produccion/lista_ordenes.html", {
        "ordenes": ordenes
    })


# =========================
# CREAR ORDEN
# =========================
@login_required
def crear_orden(request):

    if request.method == "POST":

        producto = request.POST.get("producto")
        cantidad = request.POST.get("cantidad")
        estado = request.POST.get("estado")

        OrdenProduccion.objects.create(
            producto=producto,
            cantidad=cantidad,
            estado=estado
        )

        return redirect("lista_ordenes")

    return render(request, "produccion/crear_orden.html")


# =========================
# EDITAR ORDEN
# =========================
@login_required
def editar_orden(request, id):

    orden = get_object_or_404(OrdenProduccion, id=id)

    if request.method == "POST":

        orden.producto = request.POST.get("producto")
        orden.cantidad = request.POST.get("cantidad")
        orden.estado = request.POST.get("estado")

        orden.save()

        return redirect("lista_ordenes")

    return render(request, "produccion/editar_orden.html", {
        "orden": orden
    })


# =========================
# ELIMINAR ORDEN
# =========================
@login_required
def eliminar_orden(request, id):

    orden = get_object_or_404(OrdenProduccion, id=id)
    orden.delete()

    return redirect("lista_ordenes")


# =========================
# KANBAN PRODUCCION
# =========================
@login_required
def kanban_produccion(request):

    pendientes = OrdenProduccion.objects.filter(estado="Pendiente")
    proceso = OrdenProduccion.objects.filter(estado="Proceso")
    terminado = OrdenProduccion.objects.filter(estado="Terminado")

    return render(request, "produccion/kanban.html", {
        "pendientes": pendientes,
        "proceso": proceso,
        "terminado": terminado
    })


# =========================
# CAMBIAR ESTADO DESDE KANBAN
# =========================
@login_required
def cambiar_estado(request, id, estado):

    orden = get_object_or_404(OrdenProduccion, id=id)
    orden.estado = estado
    orden.save()

    return redirect("/produccion/kanban/")



@login_required
def escanear_orden(request):

    codigo = request.POST.get("codigo")

    try:
        orden = OrdenProduccion.objects.get(id=codigo)

        # Cambiar estado industrial
        orden.estado = "Proceso"
        orden.save()

        # Guardar historial
        HistorialEscaneo.objects.create(
            orden=orden,
            usuario=request.user,
            accion="Orden escaneada y enviada a Producción"
        )

        return JsonResponse({
            "success": True,
            "mensaje": "Orden enviada a Producción",
            "producto": orden.producto
        })

    except OrdenProduccion.DoesNotExist:
        return JsonResponse({
            "success": False,
            "mensaje": "Orden no encontrada"
        })

@login_required
def historial_escaneos(request):

    historial = HistorialEscaneo.objects.select_related("orden","usuario").order_by("-fecha")

    return render(request,"produccion/historial.html",{
        "historial": historial
    })

def vista_scanner(request):
    return render(request, "escaner.html")
     
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from produccion.models import OrdenProduccion


# =========================
# FUNCIONES DE ROLES
# =========================

def es_gerencia(user):
    return user.groups.filter(name='Gerencia').exists()


def es_supervisor(user):
    return user.groups.filter(name='SupervisorProduccion').exists()


def es_logistica(user):
    return user.groups.filter(name='Logistica').exists()


def es_diseno(user):
    return user.groups.filter(name='Diseno').exists()


# =========================
# DASHBOARD PRINCIPAL
# =========================

@login_required
def dashboard(request):
    return render(request, "dashboard.html")


# =========================
# DATOS DEL DASHBOARD (TIEMPO REAL)
# =========================

@login_required
def dashboard_data(request):

    data = {
        "total": OrdenProduccion.objects.count(),
        "pendientes": OrdenProduccion.objects.filter(estado="Pendiente").count(),
        "proceso": OrdenProduccion.objects.filter(estado="Proceso").count(),
        "terminadas": OrdenProduccion.objects.filter(estado="Terminado").count(),
    }

    return JsonResponse(data)

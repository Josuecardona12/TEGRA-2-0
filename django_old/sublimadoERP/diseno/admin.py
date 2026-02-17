from django.contrib import admin
from .models import Diseno


@admin.register(Diseno)
class DisenoAdmin(admin.ModelAdmin):

    list_display = (
        "nombre_diseno",
        "planeacion",
        "aprobado",
        "fecha_creacion"
    )

    list_filter = ("aprobado",)

    search_fields = (
        "nombre_diseno",
        "planeacion__lote"
    )

from django.contrib import admin
from .models import Colorimetria


@admin.register(Colorimetria)
class ColorimetriaAdmin(admin.ModelAdmin):

    list_display = (
        "paleta_color",
        "diseno",
        "aprobado",
        "fecha_creacion"
    )

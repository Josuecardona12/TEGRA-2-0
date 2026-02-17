from django.db import models
from diseno.models import Diseno


class Colorimetria(models.Model):

    diseno = models.ForeignKey(
        Diseno,
        on_delete=models.CASCADE,
        related_name="colorimetrias"
    )

    paleta_color = models.CharField(max_length=150)

    aprobado = models.BooleanField(default=False)

    observaciones = models.TextField(blank=True, null=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        # Cambiar estado del lote
        self.diseno.planeacion.estado = "colorimetria"
        self.diseno.planeacion.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.paleta_color} - {self.diseno.nombre}"

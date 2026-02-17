from django.db import models
from planeacion.models import Planeacion


class Diseno(models.Model):

    planeacion = models.ForeignKey(
        Planeacion,
        on_delete=models.CASCADE,
        related_name="disenos"
    )

    nombre_diseno = models.CharField(max_length=150)

    aprobado = models.BooleanField(default=False)

    observaciones = models.TextField(blank=True, null=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):

        # Cambia estado automáticamente
        self.planeacion.estado = "diseno"
        self.planeacion.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre_diseno} - {self.planeacion.lote}"

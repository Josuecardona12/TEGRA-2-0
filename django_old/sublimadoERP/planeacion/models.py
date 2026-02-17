from django.db import models

class Planeacion(models.Model):

    cliente = models.CharField(max_length=100)
    lote = models.CharField(max_length=50)
    cantidad = models.IntegerField()

    fecha_inicio = models.DateField()
    fecha_entrega = models.DateField()

    ESTADOS = [
        ('planeado', 'Planeado'),
        ('diseno', 'En Diseño'),
        ('colorimetria', 'En Colorimetría'),
        ('plotter', 'En Plotter'),
        ('logistica', 'En Logística'),
        ('preparacion', 'En Preparación'),
        ('sublimado', 'En Sublimado'),
        ('rh', 'En RH'),
        ('finalizado', 'Finalizado'),
    ]

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='planeado'
    )

    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lote} - {self.cliente}"

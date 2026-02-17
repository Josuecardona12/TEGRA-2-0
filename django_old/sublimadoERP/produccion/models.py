from django.db import models
from django.contrib.auth.models import User


class OrdenProduccion(models.Model):

    ESTADOS = [
        ("Pendiente", "Pendiente"),
        ("Proceso", "Proceso"),
        ("Terminado", "Terminado"),
    ]

    SEMAFORO = [
        ("Verde", "Verde"),
        ("Amarillo", "Amarillo"),
        ("Rojo", "Rojo"),
    ]

    producto = models.CharField(max_length=200)
    cantidad = models.IntegerField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default="Pendiente")
    semaforo = models.CharField(max_length=10, choices=SEMAFORO, default="Verde")
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.producto


class Perfil(models.Model):

    ROLES = (
        ("Admin", "Admin"),
        ("Supervisor", "Supervisor"),
        ("Operario", "Operario"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rol = models.CharField(max_length=20, choices=ROLES)

    def __str__(self):
        return self.user.username

class HistorialEscaneo(models.Model):

    orden = models.ForeignKey(OrdenProduccion, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    accion = models.CharField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.orden.producto} - {self.accion}"        

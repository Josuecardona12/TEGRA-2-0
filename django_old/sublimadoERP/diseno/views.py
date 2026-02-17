from django.shortcuts import render
from .models import Diseno


def lista_disenos(request):

    disenos = Diseno.objects.all().order_by("-fecha_creacion")

    return render(request, "diseno/lista.html", {
        "disenos": disenos
    })

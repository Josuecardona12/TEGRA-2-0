from django.shortcuts import render

def lista_productos(request):
    return render(request, "inventario/lista_productos.html")

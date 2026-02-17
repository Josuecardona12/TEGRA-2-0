from django.urls import path
from . import views

urlpatterns = [
    path("", views.lista_disenos, name="lista_disenos"),
]

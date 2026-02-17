from django.urls import path
from . import views

urlpatterns = [

    # ===== CRUD ORDENES =====
    path('', views.lista_ordenes, name="lista_ordenes"),
    path('crear/', views.crear_orden, name="crear_orden"),
    path('editar/<int:id>/', views.editar_orden, name="editar_orden"),
    path('eliminar/<int:id>/', views.eliminar_orden, name="eliminar_orden"),

    # ===== DASHBOARD =====
    path('dashboard/', views.dashboard, name="dashboard"),

    # ⭐ ESTA ES TU API TIEMPO REAL ⭐
    path('api/dashboard/', views.api_dashboard, name="api_dashboard"),

    # ===== KANBAN =====
    path('kanban/', views.kanban_produccion, name="kanban"),

    # ===== CAMBIO DE ESTADO =====
    path('cambiar_estado/<int:id>/<str:estado>/',
         views.cambiar_estado,
         name="cambiar_estado"),

     path("api/dashboard/", views.api_dashboard),   

    path("escanear/<int:codigo>/", views.escanear_orden),  
    path("api/escanear/", views.escanear_orden, name="escanear_orden"),
path("historial/", views.historial_escaneos, name="historial_escaneos"),
path("scanner/", views.vista_scanner),
]

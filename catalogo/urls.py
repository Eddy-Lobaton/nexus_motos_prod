from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalogo_productos, name='catalogo_productos'),
    #path('producto/<int:prod_id>/', views.detalle_catalogo, name='detalle_catalogo'),
    path('inicio/', views.inicio, name='inicio'),
    path('motos/', views.catalogo_motos, name='catalogo_motos'),
    path('motos/busqueda/', views.busqueda_motos, name='busqueda_motos'),
    path("moto/<int:prod_id>/", views.detalle_moto, name="detalle_moto"),
    path("moto/<int:prod_id>/comprar/", views.comprar_moto, name="comprar_moto"),
]
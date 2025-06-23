from django.urls import path
from . import views

urlpatterns = [
    path('', views.catalogo_productos, name='catalogo_productos'),
    path('producto/<int:prod_id>/', views.detalle_catalogo, name='detalle_catalogo'),

]
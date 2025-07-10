from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'productos', TblProductoViewSet)
router.register(r'clientes', TblClienteViewSet)
router.register(r'ventas', TblVentaViewSet)
router.register(r'usuarios', TblUsuarioViewSet)
router.register(r'detventas', TblDetVentaViewSet)
router.register(r'metodos_pago', TblMetodoPagoViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]

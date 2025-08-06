from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from tienda.models import *
from .serializers import *

class TblProductoViewSet(viewsets.ModelViewSet):
    queryset = TblProducto.objects.filter(prod_estado=True, tblkardex__isnull=False).select_related('tblkardex')
    serializer_class = TblProductoSerializer

class TblClienteViewSet(viewsets.ModelViewSet):
    queryset = TblCliente.objects.all()
    serializer_class = TblClienteSerializer

class TblVentaViewSet(viewsets.ModelViewSet):
    queryset = TblVenta.objects.all()
    serializer_class = TblVentaSerializer

class TblUsuarioViewSet(viewsets.ModelViewSet):
    queryset = TblUsuario.objects.all()
    serializer_class = TblUsuarioSerializer

class TblDetVentaViewSet(viewsets.ModelViewSet):
    queryset = TblDetVenta.objects.all()
    serializer_class = TblDetVentaSerializer

class TblMetodoPagoViewSet(viewsets.ModelViewSet):
    queryset = TblMetodoPago.objects.all()
    serializer_class = TblMetodoPagoSerializer
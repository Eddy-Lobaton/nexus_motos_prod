from rest_framework import serializers
from tienda.models import *

class TblProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblProducto
        fields = '__all__'

class TblClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblCliente
        fields = '__all__'

class TblVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblVenta
        fields = '__all__'

class TblUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblUsuario
        fields = '__all__'

class TblDetVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblDetVenta
        fields = '__all__'

class TblMetodoPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TblMetodoPago
        fields = '__all__'
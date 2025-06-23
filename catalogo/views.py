from django.shortcuts import render, get_object_or_404
from tienda.models import TblProducto


def catalogo_productos(request):
    productos = TblProducto.objects.filter(prod_estado=True)
    return render(request, 'catalogo/catalogo_productos.html', {'productos': productos})

def detalle_catalogo(request, producto_id):
    producto = get_object_or_404(TblProducto, prod_id=producto_id, prod_estado=True)
    return render(request, 'catalogo/detalle_catalogo.html', {'producto': producto})
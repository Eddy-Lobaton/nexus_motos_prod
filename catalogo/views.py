from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from tienda.models import TblProducto


def inicio(request):
    """
    Renderiza la página de inicio del catálogo.
    """
    return render(request, 'catalogo/inicio.html')

def catalogo_productos(request):
    productos = TblProducto.objects.filter(prod_estado=True)
    return render(request, 'catalogo/catalogo_productos.html', {'productos': productos})

def detalle_catalogo(request, prod_id):
    try:
        producto = get_object_or_404(TblProducto, prod_id=prod_id, prod_estado=True)
        return render(request, 'catalogo/detalle_catalogo.html', {'producto': producto})
    except Exception as e:
        return HttpResponse(f"Error al cargar producto: {e}")
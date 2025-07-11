from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from tienda.models import TblProducto, TblKardex
from django.db.models import Q


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
    
def catalogo_motos(request):
    return render(request, 'catalogo/catalogo_motos.html')

def busqueda_motos(request):
    filtros = Q()
    
    marcas = request.GET.getlist('marca')
    categorias = request.GET.getlist('categoria')
    motores = request.GET.getlist('motor')
    precio_max = request.GET.get('precio_max')
    
    if marcas:
        filtros &= Q(prod_marca__in=marcas)
    if categorias:
        filtros &= Q(prod_categoria__in=categorias)
    if motores:
        filtros &= Q(prod_motor__in=motores)
    if precio_max:
        filtros &= Q(tblkardex__kardex_precio_vigente__lte=precio_max)

    try:
        productos = TblProducto.objects.filter(filtros, prod_estado=True).select_related('tblkardex')
    except Exception as e:
        # Mostrar el error solo en la consola
        print("Error:")
        print(str(e))
    
    data = []
    for p in productos:
        data.append({
            'id': p.prod_id,
            'nombre': p.prod_nombre,
            'modelo': p.prod_modelo,
            'motor': p.prod_motor,
            'marca': p.prod_marca,
            'categoria': p.prod_categoria,
            'precio': float(p.tblkardex.kardex_precio_vigente),
            'imagen': p.prod_imagen  # asegúrate que sea URL accesible (usa MEDIA_URL si necesario)
        })
    
    return JsonResponse({'productos': data})

def detalle_moto(request, prod_id):
    producto = TblProducto.objects.get(prod_id=prod_id)
    kardex = TblKardex.objects.get(prod=producto)
    relacionados = TblProducto.objects.filter(
        prod_categoria=producto.prod_categoria
    ).exclude(prod_id=prod_id)[:5]

    return render(request, "catalogo/detalle_moto.html", {
        "producto": producto,
        "precio": kardex.kardex_precio_vigente,
        "relacionados": relacionados,
    })

def comprar_moto(request, prod_id):
    try:
        producto = TblProducto.objects.get(prod_id=prod_id)
    except TblProducto.DoesNotExist:
        #return render(request, "404.html", status=404)
        print("Error: Producto no existe")

    return render(request, "catalogo/comprar_moto.html", {
        "producto": producto,
    })
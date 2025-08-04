from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from tienda.models import TblProducto, TblKardex, TblUsuario, TblCliente, TblTipoUsuario, TblCargo
from django.db.models import Q
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.urls import reverse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from io import BytesIO
from django.contrib.auth import logout
from functools import wraps
import random
import string
import os

def logout_no_cliente(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        if request.user.is_authenticated:
            tipo = getattr(request.user.tipo_usuario, 'tipo_usuario_descrip', '').upper()
            if tipo != 'CLIENTE':
                logout(request)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@logout_no_cliente
def inicio(request):
    """
    Renderiza la página de inicio del catálogo.
    """
    return render(request, 'catalogo/inicio.html')

def validar_documento_cliente(request):
    documento = request.GET.get('documento')
    existe = TblCliente.objects.filter(cliente_nrodocumento=documento).exists()
    return JsonResponse({'existe': existe})

def validar_email_cliente(request):
    email = request.GET.get('email')
    existeEmail = TblCliente.objects.filter(cliente_email=email).exists() if email else False

    return JsonResponse({'existeEmail': existeEmail})


def registro_cliente(request):
    # Generar contraseña aleatoria
    def generar_contrasena():
        return ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        paterno = request.POST.get('paterno')
        materno = request.POST.get('materno')
        correo = request.POST.get('correo')
        telefono = request.POST.get('telefono')
        tipo_documento = request.POST.get('tipo_documento')
        documento = request.POST.get('documento')
        direccion = request.POST.get('direccion')
        nacimiento = request.POST.get('nacimiento')
        sexo = request.POST.get('sexo')
        contrasena = generar_contrasena()

        try:
            # Obtener tipo de usuario y cargo predeterminado para clientes
            tipo_cliente = TblTipoUsuario.objects.get(tipo_usuario_descrip__iexact='cliente')
            cargo_nulo = TblCargo.objects.get(cargo_emp_descrip__iexact='Sin_cargo')

            # Crear usuario
            nuevo_usuario = TblUsuario.objects.create(
                usuario_tipodocumento=tipo_documento,
                usuario_nrodocumento=documento,
                usuario_nombre=nombre,
                usuario_paterno=paterno,
                usuario_materno=materno,
                usuario_direccion=direccion,
                usuario_fechanac=nacimiento,
                usuario_sexo=sexo,
                usuario_email=correo,
                usuario_cambiopwd=True,
                cargo=cargo_nulo,
                tipo_usuario=tipo_cliente,
                username=documento,
                password=make_password(contrasena)
            )

            # Crear cliente vinculado
            TblCliente.objects.create(
                cliente_tipodocumento=tipo_documento,
                cliente_nrodocumento=documento,
                cliente_nombre=nombre,
                cliente_paterno=paterno,
                cliente_materno=materno,
                cliente_fechanac=nacimiento,
                cliente_telefono=telefono,
                cliente_email=correo,
                cliente_sexo=sexo,
                cliente_direccion=direccion,
                usuario=nuevo_usuario
            )

            # Enviar correo
            send_mail(
                subject='Bienvenido a Nexus Motos',
                message=f'Hola {nombre}, ya eres parte de nuestros clientes. Tu usuario es: {documento} y tu contraseña: {contrasena}',
                from_email=settings.EMAIL_HOST_USER,  # configurado en settings
                recipient_list=[correo],
                fail_silently=False
            )

            return JsonResponse({'mensaje': f'Se le envió su usuario y contraseña al correo {correo}'})

        except Exception as e:
            return JsonResponse({'error': f'Ocurrió un error: {str(e)}'}, status=500)

    return render(request, 'catalogo/registro_cliente.html')

@login_required
def cambiar_contrasena(request):
    if request.method == 'POST':
        nueva = request.POST.get('nueva')
        confirmar = request.POST.get('confirmar')

        if nueva != confirmar:
            return JsonResponse({'error': 'Las contraseñas no coinciden'}, status=400)

        user = request.user
        user.password = make_password(nueva)
        user.usuario_cambiopwd = False
        user.save()

        # Mantener sesión activa tras cambiar password
        update_session_auth_hash(request, user)
        
        tipo_usuario = user.tipo_usuario.tipo_usuario_descrip.lower()
        return JsonResponse({
            'mensaje': 'Contraseña modificada correctamente',
            'redirect_url': reverse('inicio' if tipo_usuario == 'cliente' else 'home')
        })

    return render(request, 'catalogo/cambiar_contrasena.html')

def catalogo_productos(request):
    try:
        productos = TblProducto.objects.filter(prod_estado=True)
        return render(request, 'catalogo/catalogo_productos.html', {'productos': productos})
    except Exception as e:
        print("ERROR:", str(e))
        return HttpResponse("Ocurrió un error: " + str(e))

def detalle_catalogo(request, prod_id):
    try:
        producto = get_object_or_404(TblProducto, prod_id=prod_id, prod_estado=True)
        return render(request, 'catalogo/detalle_catalogo.html', {'producto': producto})
    except Exception as e:
        return HttpResponse(f"Error al cargar producto: {e}")

#### CATALOGO MOTOS ####
@logout_no_cliente
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
        productos = TblProducto.objects.filter(filtros, prod_tipo='MOTO', prod_estado=True).select_related('tblkardex')
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

def cotizar_moto(request, prod_id):
    try:
        producto = TblProducto.objects.get(prod_id=prod_id)
    except TblProducto.DoesNotExist:
        #return render(request, "404.html", status=404)
        print("Error: Producto no existe")

    return render(request, "catalogo/cotizar_moto.html", {
        "producto": producto,
    })

def fetch_resources(uri, rel):
    """
    Convierte rutas relativas a rutas absolutas para que xhtml2pdf pueda acceder a archivos estáticos (como imágenes).
    """
    if uri.startswith(settings.STATIC_URL):
        path = os.path.join(settings.STATIC_ROOT, uri.replace(settings.STATIC_URL, ""))
        return path
    return uri

def enviar_cotizacion(request):
    if request.method == 'POST':
        nombres = request.POST.get('nombres')
        apellidos = request.POST.get('apellidos')
        documento = request.POST.get('nro_documento')
        tipo_documento = request.POST.get('tipo_documento')
        email = request.POST.get('email')
        telefono = request.POST.get('telefono')
        producto_id = request.POST.get('producto_id')

        try:
            producto = TblProducto.objects.get(prod_id=producto_id)
            kardex = TblKardex.objects.filter(prod=producto).first() #TblKardex.objects.filter(prod=producto).order_by('-kardex_id').first()

            if not kardex:
                return JsonResponse({'error': 'No se encontró el precio del producto.'})
            
            ruta_logo = os.path.join(settings.BASE_DIR, 'staticfiles', 'assets', 'img', 'logos', 'Nexus_2.png')

            context = {
                'nombre_completo': f"{nombres} {apellidos}",
                'documento': documento,
                'tipo_documento': tipo_documento,
                'email': email,
                'telefono': telefono,
                'producto': producto,
                'precio': "{:.2f}".format(kardex.kardex_precio_vigente),
                'fecha': timezone.now().strftime("%d de %B de %Y"),
                'cotizacion_id': "20250717-1201",  # Generar dinámicamente si se desea
                'ruta_logo': ruta_logo.replace('\\', '/'),  # en Windows convierte \ a /
            }

            html = render_to_string("catalogo/cotizacion_pdf.html", context)
            result = BytesIO()
            #pdf = pisa.CreatePDF(html, dest=result)
            pdf = pisa.CreatePDF(html, dest=result, link_callback=fetch_resources)

            if not pdf.err:
                email_message = EmailMessage(
                    'Cotización Nexus Motos',
                    'Adjunto encontrará su cotización en PDF.',
                    settings.EMAIL_HOST_USER,
                    [email]
                )
                email_message.attach('cotizacion.pdf', result.getvalue(), 'application/pdf')
                email_message.send()
                return JsonResponse({'success': True})
            else:
                return JsonResponse({'error': 'Error al generar el PDF.'})

        except TblProducto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado.'})
        except Exception as e:
            return JsonResponse({'error': str(e)})

    return JsonResponse({'error': 'Método no permitido'})

#### CATALOGO ACCESORIOS ####
@logout_no_cliente
def catalogo_accesorios(request):
    return render(request, 'catalogo/catalogo_accesorios.html')

def busqueda_accesorios(request):
    filtros = Q()
    
    categorias = request.GET.getlist('categoria')
    marcas = request.GET.getlist('marca')
    precio_max = request.GET.get('precio_max')
    
    if categorias:
        filtros &= Q(prod_codigo__in=categorias)
    if marcas:
        filtros &= Q(prod_marca__in=marcas)
    #if precio_max:
    #    filtros &= Q(tblkardex__kardex_precio_vigente__lte=precio_max)

    try:
        productos = TblProducto.objects.filter(filtros, prod_tipo='ACCESORIO', prod_estado=True)#.select_related('tblkardex')
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
            'tono': p.prod_tono,
            'marca': p.prod_marca,
            'categoria': p.prod_categoria,
            'precio': '0.00', #float(p.tblkardex.kardex_precio_vigente),
            'imagen': p.prod_imagen  # asegúrate que sea URL accesible (usa MEDIA_URL si necesario)
        })
    
    return JsonResponse({'productos': data})

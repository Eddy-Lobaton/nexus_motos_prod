from django.urls import path
from . import views

urlpatterns = [
    # Rutas de catálogo y usuario
    path('registro/', views.registro_cliente, name='registro_cliente'),
    path('registro/validar-documento/', views.validar_documento_cliente, name='validar_documento'),
    path('registro/validar-email/', views.validar_email_cliente, name='validar_email'),
    path('cambiar-contrasena/', views.cambiar_contrasena, name='cambiar_contrasena'),
    path('inicio/', views.inicio, name='inicio'),

    # Motos
    path('motos/', views.catalogo_motos, name='catalogo_motos'),
    path('motos/busqueda/', views.busqueda_motos, name='busqueda_motos'),
    path("moto/<int:prod_id>/", views.detalle_moto, name="detalle_moto"),
    path("moto/<int:prod_id>/cotizar/", views.cotizar_moto, name="cotizar_moto"),
    path("enviar-cotizacion/", views.enviar_cotizacion, name="enviar_cotizacion"),

    # Accesorios
    path('accesorios/', views.catalogo_accesorios, name='catalogo_accesorios'),
    path('accesorios/busqueda/', views.busqueda_accesorios, name='busqueda_accesorios'),
    path("accesorio/<int:prod_id>/", views.detalle_accesorio, name="detalle_accesorio"),
    path("accesorio/agregar-a-carrito/", views.agregar_a_carrito, name="agregar_a_carrito"),

    # Carrito
    path("carrito/", views.vista_carrito, name="vista_carrito"),
    path('carrito/eliminar/', views.eliminar_producto_carrito, name='eliminar_producto_carrito'),

    # === Mercado Pago Checkout API ===
    path("checkout/mp/", views.iniciar_pago_mp, name="iniciar_pago_mp"),
    path("checkout/webhook/", views.mp_webhook, name="mp_webhook"),
    path('checkout/exito/', views.checkout_exito, name='checkout_exito'),
    path('checkout/fallo/', views.checkout_fallo, name='checkout_fallo'),
    path('checkout/pendiente/', views.checkout_pendiente, name='checkout_pendiente'),

]

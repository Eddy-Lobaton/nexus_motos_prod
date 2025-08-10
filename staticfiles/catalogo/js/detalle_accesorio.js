const swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 15,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 3,
      },
      992: {
        slidesPerView: 4,
      },
    },
});

let tallaSeleccionada = null;

const btnAumentar = document.getElementById('btn-aumentar');
const btnDisminuir = document.getElementById('btn-disminuir');
const inputCantidad = document.getElementById('cantidad');
const btnAgregarCar = document.getElementById('btn-agregar-carrito');

function actualizarBotones(cantidad) {
  let maxCantidad = parseInt(inputCantidad.dataset.max, 10) || 0;
  btnDisminuir.disabled = cantidad <= 1;
  btnAumentar.disabled = cantidad >= maxCantidad;
}

// Inicializa botones según el valor inicial
actualizarBotones(parseInt(inputCantidad.value, 10));

btnAumentar.addEventListener('click', function () {
  let cantidad = parseInt(inputCantidad.value, 10);
  let maxCantidad = parseInt(inputCantidad.dataset.max, 10) || 0;
  if (cantidad < maxCantidad) {
    cantidad++;
    inputCantidad.value = cantidad;
    actualizarBotones(cantidad);
  }
});

btnDisminuir.addEventListener('click', function () {
  let cantidad = parseInt(inputCantidad.value, 10);
  if (cantidad > 1) {
    cantidad--;
    inputCantidad.value = cantidad;
    actualizarBotones(cantidad);
  }
});

function agregarACarrito(prodId, stockActual, talla, cantidad) {
    // Desactivar botón y mostrar spinner
    btnAgregarCar.disabled = true;
    btnAgregarCar.innerHTML = `
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Agregando...
    `;
    // Obtener datos del producto
    const prodMarca = document.getElementById("prodMarca").value;
    const prodCodigo = document.getElementById("prodCodigo").value;
    const prodModelo = document.getElementById("prodModelo").value;
    const prodTono = document.getElementById("prodTono").value;
    const prodPrecio = document.getElementById("prodPrecio").value;
    const prodImagen = document.getElementById("prodImagen").value;
    
    fetch('/catalogo/accesorio/agregar-a-carrito/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': CSRF_TOKEN
        },
        body: JSON.stringify({
            prod_id: prodId,
            prod_marca: prodMarca,
            prod_codigo: prodCodigo,
            prod_modelo: prodModelo,
            prod_tono: prodTono,
            prod_precio: prodPrecio,
            prod_imagen: prodImagen,
            stock_actual: stockActual,
            talla: talla,
            cantidad: cantidad
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
          mostrarModalConfirmacion(data.producto);
          actualizarCantidadCarrito(data.total_items);
        } else {
          document.getElementById('alert-agregar-carrito').innerHTML = `<i class="bx bx-error-circle text-warning"></i> ${data.mensaje}`;
        }
    })
    .finally(() => {
        // Restaurar botón al final
        btnAgregarCar.disabled = false;
        btnAgregarCar.innerHTML = 'Agregar a carrito';
    });
}

function actualizarCantidadCarrito(total) {
    document.getElementById('contador-carrito').innerText = total;
}

function mostrarModalConfirmacion(producto) {
  // Construir descripción del producto
  const { codigo, marca, modelo, tono, talla } = producto;
  let descripcion = `${codigo} ${marca} ${modelo} ${tono}`;
  if (talla) {
    descripcion += `, ${talla}`;
    document.querySelectorAll('.btn-talla').forEach(b => b.classList.remove('active'));
    const btnTalla = document.querySelector(`.btn-talla[data-talla="${talla}"]`);
    btnTalla.disabled = true;
    inputCantidad.dataset.max = '';
    btnAgregarCar.dataset.stockActual = '';
    document.getElementById('spanStockActual').innerText = '';
  }

  // Formatear el precio con 2 decimales
  const precioFormateado = `S/. ${parseFloat(producto.precio || 0).toFixed(2)}`;

  // Mostrar
  document.getElementById('prodConfImagen').src = `${STATIC_URL_IMG}${producto.imagen}`;
  document.getElementById('prodConfMarca').textContent = producto.marca;
  document.getElementById('prodConfDescrip').textContent = descripcion;
  document.getElementById('prodConfPrecio').textContent = precioFormateado;
  document.getElementById('prodConfCant').value = producto.cantidad;

  // Mostrar el stock máximo o el mensaje de límite alcanzado
  const stockTexto = (producto.cantidad < producto.stock)
      ? `Máximo ${producto.stock} unidades.`
      : `Has alcanzado la cantidad máxima para este producto.`;

  document.getElementById('prodConfStock').textContent = stockTexto;

  new bootstrap.Modal(document.getElementById('modalConfirmacion')).show();

  // inicializar cantidad a 1
  inputCantidad.value = 1;
  actualizarBotones(1);
}


document.querySelectorAll('.btn-talla').forEach(btn => {
    btn.addEventListener('click', function () {
        tallaSeleccionada = this.dataset.talla;
        const stockTalla = this.dataset.stock;
        document.querySelectorAll('.btn-talla').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('spanStockActual').innerText = `Máximo ${stockTalla} unidades.`;
        btnAgregarCar.dataset.stockActual = stockTalla;
        inputCantidad.dataset.max = stockTalla;
        let cantidad = parseInt(inputCantidad.value, 10);
        if(cantidad > parseInt(stockTalla, 10)){
          inputCantidad.value = parseInt(stockTalla, 10);
        }
        actualizarBotones(parseInt(inputCantidad.value, 10));
    });
});


btnAgregarCar.addEventListener('click', function () {
    const alertBox = document.getElementById('alert-agregar-carrito');
    alertBox.innerText = '';

    const prodId = this.dataset.prodId;
    const cantTallas = parseInt(this.dataset.cantTallas, 10);
    const stockActual = parseInt(this.dataset.stockActual, 10) || 0;
    const tallaActiva = document.querySelector('.btn-talla.active'); //buscar si hay una talla activa
    const cantidad = inputCantidad.value;

    if (cantTallas > 0 && (!tallaActiva || !tallaSeleccionada)) {
        alertBox.innerHTML = `<i class="bx bx-error-circle text-warning"></i> Seleccione una talla`;
        return;
    }

    if (stockActual <= 0) {
        alertBox.innerHTML = `<i class="bx bx-error-circle text-warning"></i> Stock insuficiente`;
        return;
    }

    agregarACarrito(prodId, stockActual, tallaSeleccionada, cantidad);
});
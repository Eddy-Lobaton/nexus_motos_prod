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
let cantidad = 1;

function agregarACarrito(prodId, stockActual, talla, cantidad, modalTalla) {
    let btnAgregar;
    if (modalTalla) {
      btnAgregar = document.getElementById('mod-btn-agregar-carrito');
    }else{
      btnAgregar = document.getElementById('btn-agregar-carrito');
    }
    // Desactivar botón y mostrar spinner
    btnAgregar.disabled = true;
    btnAgregar.innerHTML = `
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

    console.log("modalTalla")
    console.log(modalTalla)

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
            if (modalTalla) {
              const modalEl = document.getElementById('modalTalla');
              const modal = bootstrap.Modal.getInstance(modalEl);
              
              // Escuchar el evento cuando el modal termina de cerrarse
              const handleHidden = () => {
                  mostrarModalConfirmacion(data.producto);
                  modalEl.removeEventListener('hidden.bs.modal', handleHidden); // Limpia el listener
              };

              modalEl.addEventListener('hidden.bs.modal', handleHidden);
              if (modal) modal.hide();
            } else {
              mostrarModalConfirmacion(data.producto);
            }
            actualizarCantidadCarrito(data.total_items);
        } else {
            document.getElementById('alert-agregar-carrito').innerHTML = `<i class="bx bx-error-circle text-warning"></i> ${data.mensaje}`;
            if(modalTalla){
              document.getElementById('mod-alert-agregar-carrito').innerHTML = `<i class="bx bx-error-circle text-warning"></i> ${data.mensaje}`;
            }
        }
    })
    .finally(() => {
        // Restaurar botón al final
        btnAgregar.disabled = false;
        btnAgregar.innerHTML = 'Agregar a carrito';
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
  }

  // Formatear el precio con 2 decimales
  const precioFormateado = `S/. ${parseFloat(producto.precio || 0).toFixed(2)}`;

  // Mostrar
  document.getElementById('prodConfImagen').src = `${STATIC_URL_IMG}${producto.imagen}`; // Ajusta la ruta si es necesario
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
}


document.querySelectorAll('.btn-talla').forEach(btn => {
    btn.addEventListener('click', function () {
        tallaSeleccionada = this.dataset.talla;
        const stockTalla = this.dataset.stock;
        document.querySelectorAll('.btn-talla').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('spanStockActual').innerText = stockTalla;
        document.getElementById('btn-agregar-carrito').dataset.stockActual = stockTalla;
    });
});

document.querySelectorAll('.mod-btn-talla').forEach(btn => {
    btn.addEventListener('click', function () {
        tallaSeleccionada = this.dataset.talla;
        const stockTalla = this.dataset.stock;
        document.querySelectorAll('.mod-btn-talla').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const btnTalla = document.querySelector(`.btn-talla[data-talla="${tallaSeleccionada}"]`);
        document.querySelectorAll('.btn-talla').forEach(b => b.classList.remove('active'));
        btnTalla.classList.add('active');
        // Habilitar el botón de agregar al carrito
        document.getElementById('mod-btn-agregar-carrito').disabled = false;
        //actualizar stock actual
        document.getElementById('spanStockActual').innerText = stockTalla;
        document.getElementById('btn-agregar-carrito').dataset.stockActual = stockTalla;
        document.getElementById('mod-btn-agregar-carrito').dataset.stockActual = stockTalla;
    });
});

document.getElementById('btn-agregar-carrito').addEventListener('click', function () {
    document.getElementById('alert-agregar-carrito').innerText = '';
    document.getElementById('mod-alert-agregar-carrito').innerText = '';
    const prodId = this.dataset.prodId;
    const cantTallas = parseInt(this.dataset.cantTallas, 10);
    const stockActual = parseInt(this.dataset.stockActual, 10);
    // Buscar si hay alguna talla activa
    const tallaActiva = document.querySelector('.btn-talla.active');
    
    if(cantTallas>0 && !tallaActiva && !tallaSeleccionada){
      // Mostrar modal de selección de talla
      new bootstrap.Modal(document.getElementById('modalTalla')).show();
    }else{
      cantidad = document.getElementById("cantidad").value;
      agregarACarrito(prodId, stockActual, tallaSeleccionada, cantidad, false);
    }
});

document.getElementById('mod-btn-agregar-carrito').addEventListener('click', function () {
    document.getElementById('alert-agregar-carrito').innerText = '';
    document.getElementById('mod-alert-agregar-carrito').innerText = '';
    const prodId = this.dataset.prodId;
    const stockActual = parseInt(this.dataset.stockActual, 10);
    cantidad = document.getElementById("cantidad").value;
    agregarACarrito(prodId, stockActual, tallaSeleccionada, cantidad, true);
});
const rango = document.getElementById("precioRange");
const etiqueta = document.getElementById("precioLabel");

function actualizarBarra() {
    const min = parseInt(rango.min);
    const max = parseInt(rango.max);
    const val = parseInt(rango.value);
    const percent = ((val - min) / (max - min)) * 100;

    rango.style.background = `linear-gradient(to right, #0d6efd 0%, #0d6efd ${percent}%, #ddd ${percent}%, #ddd 100%)`;
    etiqueta.textContent = `Hasta: S/ ${val}`;
}

function obtenerFiltros() {
  const filtros = {};
  document.querySelectorAll('.filtro:checked').forEach(input => {
    if (!filtros[input.name]) filtros[input.name] = [];
    filtros[input.name].push(input.value);
  });
  filtros['precio_max'] = document.getElementById('precioRange').value;
  return filtros;
}

function construirURL(baseURL, filtros) {
  const params = new URLSearchParams();
  for (const key in filtros) {
    if (Array.isArray(filtros[key])) {
      filtros[key].forEach(v => params.append(key, v));
    } else {
      params.append(key, filtros[key]);
    }
  }
  return `${baseURL}?${params.toString()}`;
}

function cargarProductos() {
  const filtros = obtenerFiltros();
  const url = construirURL(URL_BUSQUEDA, filtros); // URL_BUSQUEDA viene desde el HTML

  const contenedor = document.getElementById("resultados");
  contenedor.innerHTML = `<div class="d-flex justify-content-center align-items-center">
                            <div class="spinner-grow catalogo-spinner" role="status">
                                 <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar productos");
      return res.json();
    })
    .then(data => {
      contenedor.innerHTML = "";

      if (data.productos.length === 0) {
        contenedor.innerHTML = "<p class='text-center'>No se encontraron productos.</p>";
        return;
      }

      data.productos.forEach(p => {
        contenedor.innerHTML += `
          <div class="col-md-4 col-xl-3 mb-4">
            <div class="card h-100" onclick="location.href='${URL_DETALLE_M.replace("0", p.id)}'" style="cursor: pointer;">
              <img src="${STATIC_URL_IMG}${p.imagen}" class="card-img-top" alt="${p.nombre}">
              <div class="card-body">
                <h6 class="text-danger fw-bold">${p.marca}</h6>
                <h5>${p.nombre}</h5>
                <p class="mb-1">Motor: ${p.motor}</p>
                <p class="fw-bold text-primary">S/. ${p.precio.toLocaleString()}</p>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(err => {
      console.error("Error de fetch:", err);
      contenedor.innerHTML = "<div class='alert alert-danger'>Error al cargar productos.</div>";
    });
}

window.addEventListener("DOMContentLoaded", () => {
  actualizarBarra(); // Al cargar
  cargarProductos(); // Ejecutar al cargar la página

  // Escuchar cambios en filtros
  document.querySelectorAll('.filtro').forEach(input => {
    input.addEventListener('change', cargarProductos);
  });

  
  rango.addEventListener("input", () => {
    actualizarBarra();
    cargarProductos();
  });  

  document.querySelectorAll('.btn-toggle-filter').forEach(btn => {
      btn.addEventListener('click', function () {
          const icon = btn.querySelector('.toggle-icon');
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';
          icon.textContent = isExpanded ? '-' : '+';
      });
  });

  document.getElementById("btnLimpiarFiltros").addEventListener("click", function () {
      // Limpiar todos los checkboxes
      document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(input => {
          input.checked = false;
      });

      // Resetear el input range
      const range = document.getElementById("precioRange");
      const max = parseInt(range.max);
      range.value = max;
      range.dispatchEvent(new Event("input")); // actualiza barra visual y productos
  });

});
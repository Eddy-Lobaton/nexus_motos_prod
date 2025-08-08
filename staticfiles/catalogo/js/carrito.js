document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', function () {
        const divProducto = this.closest('.producto-carrito'); // Encuentra el contenedor del producto
        const key = divProducto.dataset.key;

        fetch('/catalogo/carrito/eliminar/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRF_TOKEN
            },
            body: JSON.stringify({ key: key })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Elimina el producto del DOM
                if (divProducto) {
                    divProducto.remove();
                }

                // Si el carrito queda vacío, reemplaza el contenido
                if (data.total_items === 0) {
                    document.getElementById('carrito-contenido').innerHTML = `
                        <div class="text-center py-5">
                            <h4 class="text-secondary fw-bold">Tu Carrito está vacío</h4>
                        </div>`;
                }

                // Actualizar contador del carrito
                const contador = document.getElementById('contador-carrito');
                if (contador) {
                    contador.innerText = data.total_items;
                }
            } else {
                alert(data.mensaje || "No se pudo eliminar el producto.");
            }
        });
    });
});

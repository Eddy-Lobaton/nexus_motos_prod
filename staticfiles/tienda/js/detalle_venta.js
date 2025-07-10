document.addEventListener("DOMContentLoaded", function() {
    const modalTitle = document.getElementById("modalPagoTitle");
    const modalBody = document.getElementById("modalPagoBody");

    // VER PAGO
    document.querySelectorAll(".btn-ver-pago").forEach(btn => {
        btn.addEventListener("click", function() {
            const numero = this.dataset.numero;
            const imagen = this.dataset.imagen;

            modalTitle.textContent = `Comprobante de Pago - Cuota ${numero}`;
            modalBody.innerHTML = `
                <div class="text-center">
                    <img src="${imagen}" alt="Comprobante" class="img-fluid rounded mx-auto d-block img-pago">
                </div>
            `;
        });
    });

    // REGISTRAR PAGO
    document.querySelectorAll(".btn-registrar-pago").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = this.dataset.id;
            const numero = this.dataset.numero;
            const monto = this.dataset.monto;

            modalTitle.textContent = `Registrar Pago - Cuota ${numero}`;
            modalBody.innerHTML = `
                <form id="formRegistrarPago" method="POST" action="/venta/registrar_pago/${id}/" enctype="multipart/form-data">
                    <input type="hidden" name="csrfmiddlewaretoken" value="${csrfToken}">
                    <p><strong>Monto Cuota:</strong> S/ ${parseFloat(monto).toFixed(2)}</p>
                    <div class="mb-3">
                        <label for="imagen_pago" class="form-label">Seleccionar imagen</label>
                        <input type="file" class="form-control" name="imagen_pago" id="imagen_pago" accept=".jpg, .jpeg, .png" required>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </div>
                </form>
            `;

            document.getElementById('formRegistrarPago').addEventListener('submit', async function(event) {
                event.preventDefault(); // Evita el envío por defecto

                const form = event.target;
                const formData = new FormData(form);

                // Validación de extensión permitida
                const archivo = formData.get("imagen_pago");
                const extensionesPermitidas = ["image/jpeg", "image/jpg", "image/png"];

                if (!archivo || !extensionesPermitidas.includes(archivo.type)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Formato no permitido',
                        text: 'Solo se permiten archivos .jpg, .jpeg y .png'
                    });
                    return; // Detiene el envío si no es válido
                }

                // Paso 1: Confirmación
                const confirmResult = await Swal.fire({
                    title: '¿Registrar pago?',
                    text: "¿Estás seguro de guardar este comprobante?",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, guardar',
                    cancelButtonText: 'Cancelar',
                    allowOutsideClick: false,  // no cerrar al hacer clic fuera
                    allowEscapeKey: false      // no cerrar con ESC
                });

                if (!confirmResult.isConfirmed) {
                    return; // Si cancela, no sigue
                }

                // Paso 2: Mostrar spinner
                Swal.fire({
                    title: 'Guardando...',
                    html: 'Por favor espere...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();

                    if (!response.ok || data.status !== "success") {
                        throw new Error(data.message || "Error desconocido");
                    }

                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
                    modal.hide();

                    // Paso 3: Éxito
                    Swal.fire({
                        title: '¡Éxito!',
                        text: data.message,
                        icon: 'success',
                        showConfirmButton: false,     // sin botón "OK"
                        timer: 2000,                  // 2 segundos (ajustable)
                        timerProgressBar: true        // barra de progreso opcional
                    }).then(() => {
                        // Paso 4: Recargar página automáticamente al cerrar Swal
                        location.reload();
                    });

                } catch (error) {
                    console.error("Error al registrar pago:", error);
                    Swal.fire({
                        title: 'Error',
                        text: error.message || 'Ocurrió un error inesperado.',
                        icon: 'error',
                    });
                }
            });
        });
    });

});
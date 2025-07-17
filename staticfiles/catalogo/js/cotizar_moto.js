document.getElementById('form-cotizacion').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const email = form.querySelector('input[type="email"]').value;

    if (!email) {
        Swal.fire('Error', 'Debe ingresar un correo electrónico', 'error');
        return;
    }

    Swal.fire({
        title: 'Procesando...',
        text: 'Generando cotización y enviando correo.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch('/catalogo/enviar-cotizacion/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': CSRF_TOKEN
            },
            body: formData
        });

        const res = await response.json();

        if (res.success) {
            Swal.fire({
                icon: 'success',
                title: 'Enviado',
                text: 'La cotización se envió correctamente.',
                confirmButtonText: 'OK',
                allowOutsideClick: false,  // <- evita cierre al hacer clic fuera
                allowEscapeKey: false      // <- evita cierre con ESC
            }).then(() => {
                window.location.href = INICIO_URL;
            });
        } else {
            Swal.fire('Error', res.error || 'Hubo un problema al enviar el correo.', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'No se pudo completar la operación.', 'error');
    }
});
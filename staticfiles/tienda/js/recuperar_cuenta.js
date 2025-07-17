document.getElementById('formRecuperar').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    Swal.fire({
        title: 'Procesando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {'X-CSRFToken': CSRF_TOKEN}
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Revisa tu correo!',
                text: data.mensaje,
                confirmButtonText: 'OK',
                allowOutsideClick: false,  // <- evita cierre al hacer clic fuera
                allowEscapeKey: false      // <- evita cierre con ESC
            }).then(() => {
                window.location.href = LOGIN_URL;
            });
        } else {
            Swal.fire('Error', data.error, 'error');
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
    });
});
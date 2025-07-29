document.getElementById('formCambio').addEventListener('submit', function(e) {
    e.preventDefault();

    const nueva = document.getElementById("nueva").value;
    const confirmar = document.getElementById("confirmar").value;

    // Validación de coincidencia
    if (nueva !== confirmar) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Las contraseñas no coinciden.",
        });
        return; // Detiene el proceso si son diferentes
    }

    const formData = new FormData(this);

    // Mostrar swal de procesamiento
    Swal.fire({
        title: "Procesando...",
        text: "Por favor espere",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch("", {
        method: "POST",
        body: formData,
        headers: {
            'X-CSRFToken': CSRF_TOKEN
        },
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            Swal.fire('Error', data.error, 'error');
        } else {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: data.mensaje,
                confirmButtonText: 'OK',
                allowOutsideClick: false,  // <- evita cierre al hacer clic fuera
                allowEscapeKey: false      // <- evita cierre con ESC
            }).then(() => {
                window.location.href = data.redirect_url;
            });
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
    });
});
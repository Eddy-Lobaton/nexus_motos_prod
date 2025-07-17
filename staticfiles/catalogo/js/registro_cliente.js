const overlay = document.getElementById('loadingOverlay');

document.getElementById('documento').addEventListener('blur', function () {
    const doc = this.value;
    if (doc.length > 5) {
        overlay.style.display = 'flex';
        fetch(`/catalogo/validar-documento/?documento=${doc}`)
            .then(res => res.json())
            .then(data => {
                if (data.existe) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cliente ya existe',
                        text: 'Ud ya es nuestro cliente. Su usuario es su DNI.',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,  // <- evita cierre al hacer clic fuera
                        allowEscapeKey: false      // <- evita cierre con ESC
                    }).then(() => {
                        window.location.href = LOGIN_URL;
                    });
                } else if(data.existeUsr){
                    Swal.fire({
                        icon: 'warning',
                        title: 'Usuario ya existe',
                        text: 'Ud es parte de nuestra empresa.',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,  // <- evita cierre al hacer clic fuera
                        allowEscapeKey: false      // <- evita cierre con ESC
                    }).then(() => {
                        window.location.href = LOGIN_URL;
                    });
                }
            })
            .catch(error => {
                console.error("Error al obtener número de documento:", error);
                Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
            })
            .finally(() => {
                overlay.style.display = 'none';
            });
    }
});

document.getElementById('registroForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

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

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {'X-CSRFToken': CSRF_TOKEN}
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            Swal.fire('Error', data.error, 'error');
        } else {
            Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                text: data.mensaje,
                confirmButtonText: 'OK',
                allowOutsideClick: false,  // <- evita cierre al hacer clic fuera
                allowEscapeKey: false      // <- evita cierre con ESC
            }).then(() => {
                window.location.href = LOGIN_URL;
            });
        }
    })
    .catch(error => {
        Swal.fire('Error', 'Ocurrió un error inesperado.', 'error');
    });
});
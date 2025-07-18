const overlay = document.getElementById('loadingOverlay');

document.getElementById('documento').addEventListener('blur', function () {
    const doc = this.value;
    if (doc.length > 5) {
        overlay.style.display = 'flex';
        fetch(`/catalogo/registro/validar-documento/?documento=${doc}`)
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

//**** Validar email
const emailInput = document.querySelector('#correo');
const comDivEmail = document.createElement('div');

emailInput.parentNode.appendChild(comDivEmail);

emailInput.addEventListener('blur', function () {
    const email = emailInput.value.trim();

    if (email === "") {
        comDivEmail.textContent = "";
        comDivEmail.classList.remove('text-danger', 'small');
        emailInput.classList.remove('is-invalid');
        return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailInput.value = "";
        comDivEmail.textContent = "Ingrese un email correcto.";
        comDivEmail.classList.add('text-danger', 'small');
        emailInput.classList.add('is-invalid');
        return;
    }
    overlay.style.display = 'flex';


    fetch(`/catalogo/registro/validar-email/?email=${email}`)
        .then(response => response.json())
        .then(data => {
            if (data.existeEmail || data.existeEmailUsr) {
                emailInput.value = "";
                comDivEmail.textContent = `El email "${email}" ya ha sido registrado en otra cuenta.`;
                emailInput.classList.add('is-invalid');
                comDivEmail.classList.add('text-danger');
            } else {
                comDivEmail.textContent = "";
                emailInput.classList.remove('is-invalid');
                comDivEmail.classList.remove('text-danger');
            }
        })
        .catch(error => {
            emailInput.value = "";
            console.error("Error al verificar email:", error);
            comDivEmail.textContent = "Ocurrió un error al verificar el email.";
            emailInput.classList.add('is-invalid');
        })
        .finally(() => {
            overlay.style.display = 'none';
        });
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
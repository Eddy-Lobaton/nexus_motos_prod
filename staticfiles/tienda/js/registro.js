document.addEventListener('DOMContentLoaded', function () {
    let errorNumDoc = true;
    let errorEmail = true;
    let errorUsrN = true;

    //**** validar N. documento
    const numDocInput = document.querySelector('#id_usuario_nrodocumento');
    const tipoDocInput = document.querySelector('#id_usuario_tipodocumento');
    const feedbackDivDni = document.createElement('div');
    feedbackDivDni.classList.add('text-danger', 'small');
    numDocInput.parentNode.appendChild(feedbackDivDni);

    const limpiarCampos = () => {
        //document.querySelector('#id_usuario_nrodocumento').value = '';
        document.querySelector('#id_usuario_nombre').value = '';
        document.querySelector('#id_usuario_paterno').value = '';
        document.querySelector('#id_usuario_materno').value = '';
        document.querySelector('#id_usuario_direccion').value = '';
    };

    const restringirDni = function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 8);
    };
    const restringirCE = function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 12);
    };

    tipoDocInput.addEventListener('change', function () {
        const tipoDoc = tipoDocInput.value;
        limpiarCampos();
        if (tipoDoc === "DNI") {
            numDocInput.value = "";
            numDocInput.setAttribute("maxlength", "8");
            numDocInput.removeEventListener("input", restringirCE);
            numDocInput.addEventListener("input", restringirDni);
            feedbackDivDni.textContent = "El DNI debe contener 8 dígitos numéricos.";
            feedbackDivDni.classList.remove('text-danger');
            feedbackDivDni.classList.add('text-primary');
        } else if (tipoDoc === "CE") {
            numDocInput.value = "";
            numDocInput.setAttribute("maxlength", "12");
            numDocInput.removeEventListener("input", restringirDni);
            numDocInput.addEventListener("input", restringirCE);
            feedbackDivDni.textContent = "El carnet de extranjería debe contener 12 dígitos numéricos.";
            feedbackDivDni.classList.remove('text-danger');
            feedbackDivDni.classList.add('text-primary');
        } else {
            numDocInput.removeAttribute("maxlength");
            numDocInput.removeEventListener("input", restringirDni);
            numDocInput.removeEventListener("input", restringirCE);
        }
    });

    numDocInput.addEventListener('blur', async function () {
        const numDoc = numDocInput.value.trim();
        const tipoDoc = tipoDocInput.value.trim();
        const dniRegex = /^\d{8}$/; // 8 dígitos numéricos
        const ceRegex = /^\d{12}$/; // 12 dígitos numéricos

        if (tipoDoc === "DNI" && !dniRegex.test(numDoc)) {
            limpiarCampos();
            feedbackDivDni.textContent = "El DNI debe contener exactamente 8 dígitos numéricos.";
            feedbackDivDni.classList.remove('text-primary');
            feedbackDivDni.classList.add('text-danger', 'small');
            numDocInput.classList.add('is-invalid');
            errorNumDoc = true;
            return;
        }

        if (tipoDoc === "CE" && !ceRegex.test(numDoc)) {
            limpiarCampos();
            feedbackDivDni.textContent = "El CE debe contener exactamente 12 dígitos numéricos.";
            feedbackDivDni.classList.remove('text-primary');
            feedbackDivDni.classList.add('text-danger', 'small');
            numDocInput.classList.add('is-invalid');
            errorNumDoc = true;
            return;
        }

        errorNumDoc = false;

        // Mostrar el overlay antes de la consulta
        document.getElementById('loadingOverlay').style.display = 'flex';

        try {
            // 1. Verificar si ya existe en la BD
            const response = await fetch(`/registrar/verificar-datos-bd/?numDoc=${numDoc}`);
            const data = await response.json();

            if (data.existsDoc) {
                numDocInput.value = "";
                limpiarCampos();
                feedbackDivDni.textContent = `El N° de documento "${numDoc}" ya está registrado.`;
                numDocInput.classList.add('is-invalid');
                feedbackDivDni.classList.remove('text-primary');
                feedbackDivDni.classList.add('text-danger');
                errorNumDoc = true;
                return;
            }

            // 2. Consultar API RENIEC solo si no existe en la BD y tipoDoc es DNI
            if (tipoDoc === "DNI") {
                const reniecResponse = await fetch(`/registrar/api/consultar-dni/?dni=${numDoc}`);
                const reniecData = await reniecResponse.json();

                if (reniecData.success) {
                    feedbackDivDni.textContent = "";
                    numDocInput.classList.remove('is-invalid');
                    document.querySelector('#id_usuario_nombre').value = reniecData.nombres || '';
                    document.querySelector('#id_usuario_paterno').value = reniecData.apellido_paterno || '';
                    document.querySelector('#id_usuario_materno').value = reniecData.apellido_materno || '';
                    document.querySelector('#id_usuario_direccion').value = reniecData.direccion || '';
                } else {
                    limpiarCampos();
                    feedbackDivDni.textContent = reniecData.error || "DNI no encontrado.";
                    numDocInput.classList.remove('is-invalid');
                    feedbackDivDni.classList.remove('text-danger');
                    feedbackDivDni.classList.add('text-primary');
                }
            }

        } catch (error) {
            console.error("Error al verificar:", error);
            numDocInput.value = "";
            limpiarCampos();
            feedbackDivDni.textContent = `Ocurrió un error al verificar el documento "${numDoc}".`;
            feedbackDivDni.classList.remove('text-primary');
            feedbackDivDni.classList.add('text-danger');
            numDocInput.classList.add('is-invalid');
            errorNumDoc = true;
        } finally {
            document.getElementById('loadingOverlay').style.display = 'none';
        }

    });


    //**** validar fecha de nacimiento dentro del rango 
    const fechaInput = document.querySelector('#id_usuario_fechanac');
    const feedbackDivFch = document.createElement('div');
    feedbackDivFch.classList.add('text-danger', 'small');
    fechaInput.parentNode.appendChild(feedbackDivFch);
    const hoy = new Date();
    const minFecha = new Date(hoy.getFullYear() - 70, hoy.getMonth(), hoy.getDate());
    const maxFecha = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());

    // Establece los atributos min y max en el input
    fechaInput.setAttribute('min', minFecha.toISOString().split('T')[0]);
    fechaInput.setAttribute('max', maxFecha.toISOString().split('T')[0]);

    // Validación adicional al cambiar de fecha
    fechaInput.addEventListener('blur', function () {
        const valor = new Date(this.value);

        if (valor < minFecha || valor > maxFecha) {
            feedbackDivFch.textContent = "La fecha debe indicar una edad entre 18 y 70 años.";
            fechaInput.classList.add('is-invalid');
            this.value = '';
        }else{
            feedbackDivFch.textContent = "";
            fechaInput.classList.remove('is-invalid');
        }
    });

    //**** Validar email
    const emailInput = document.querySelector('#id_usuario_email');
    const feedbackDivEmail = document.createElement('div');
    
    emailInput.parentNode.appendChild(feedbackDivEmail);

    emailInput.addEventListener('blur', function () {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            feedbackDivEmail.textContent = "Ingrese un email correcto.";
            feedbackDivEmail.classList.add('text-danger', 'small');
            emailInput.classList.add('is-invalid');
            errorEmail = true;
            return;
        }

        errorEmail = false;
        document.getElementById('loadingOverlay').style.display = 'flex';

        fetch(`/registrar/verificar-datos-bd/?email=${email}`)
            .then(response => response.json())
            .then(data => {
                if (data.existsEmail) {
                    feedbackDivEmail.textContent = "Email ya ha sido registrado.";
                    emailInput.classList.add('is-invalid');
                    feedbackDivEmail.classList.add('text-danger');
                    errorEmail = true;
                } else {
                    feedbackDivEmail.textContent = "";
                    emailInput.classList.remove('is-invalid');
                    feedbackDivEmail.classList.remove('text-danger');
                }
            })
            .catch(error => {
                console.error("Error al verificar email:", error);
                feedbackDivEmail.textContent = "Ocurrió un error al verificar el email.";
                emailInput.classList.add('is-invalid');
                errorEmail = true;
            })
            .finally(() => {
                document.getElementById('loadingOverlay').style.display = 'none';
            });
    });

    //**** Validar username
    const usernameInput = document.querySelector('#id_username');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('text-danger', 'small');
    usernameInput.parentNode.appendChild(feedbackDiv);

    usernameInput.addEventListener('blur', function () {
        const username = usernameInput.value.trim();

        if (username.length > 0) {
            const regex = /^(?=.*[A-Za-z])[A-Za-z0-9_-]+$/;
            if (!regex.test(username)) {
                feedbackDiv.textContent = "El nombre de usuario solo puede contener: letras números _ -";
                usernameInput.classList.add('is-invalid');
                usernameInput.value = "";
                errorUsrN = true;
                return;
            }

            errorUsrN = false;

            document.getElementById('loadingOverlay').style.display = 'flex';
                fetch(`/registrar/verificar-username/?username=${username}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.existe) {
                            feedbackDiv.textContent = "El nombre de usuario \""+ username +"\" está en uso.";
                            usernameInput.classList.add('is-invalid');
                            usernameInput.value = "";
                            errorUsrN = true;
                        } else {
                            feedbackDiv.textContent = "";
                            usernameInput.classList.remove('is-invalid');
                        }
                    })
                    .catch(error => {
                        console.error("Error al verificar email:", error);
                        feedbackDivEmail.textContent = "Ocurrió un error al verificar el email.";
                        emailInput.classList.add('is-invalid');
                        errorUsrN = true;
                    })
                    .finally(() => {
                        document.getElementById('loadingOverlay').style.display = 'none';
            });
           
        } else {
            feedbackDiv.textContent = "";
            usernameInput.classList.remove('is-invalid');
            errorUsrN = true;
        }
    });
    //**** Validar usuario antes de registrar
    document.getElementById('formRegistro').addEventListener('submit', function (event) {
        event.preventDefault();  // Detiene el envío por defecto
    
        const numDoc = numDocInput.value.trim();
        const email = emailInput.value.trim();
        const usrName = usernameInput.value.trim();
        const usrNom = document.querySelector('#id_usuario_nombre').value.trim();
        const usrPat = document.querySelector('#id_usuario_paterno').value.trim();
        const usrMat = document.querySelector('#id_usuario_materno').value.trim();
        const usrDir = document.querySelector('#id_usuario_direccion').value.trim();
        const usrPwd = document.querySelector('#id_password').value.trim();

        const feedback = document.getElementById('regFeedback'); //div que muestra el error, invocado desde el registro.html
        feedback.classList.add('text-danger', 'small'); //añade las clases al div invocado previamente
    
        let continuar = true; //para validar si existe numero documento o email
        let msjError = "";

        if (numDoc.length === 0 || errorNumDoc) {
            numDocInput.classList.add('is-invalid');
            msjError+= (continuar ? "" : " / " ) + 'Corrija el número de documento.';
            continuar = false;
        }
        if (usrNom.length === 0 || usrPat.length === 0 || usrMat.length === 0 || usrDir.length === 0) {
            msjError+= (continuar ? "" : " / " ) + 'Corrija los datos del usuario.';
            continuar = false;
        }
        if (email.length === 0 || errorEmail) {
            emailInput.classList.add('is-invalid');
            msjError+= (continuar ? "" : " / " ) + 'Corrija el email.';
            continuar = false;
        }
        if (usrName.length === 0 || errorUsrN) {
            usernameInput.classList.add('is-invalid');
            msjError+= (continuar ? "" : " / " ) + 'Corrija el nombre de usuario.';
            continuar = false;
        }

        

        if (usrPwd.length === 0) {
            msjError+= (continuar ? "" : " / " ) + 'Corrija la contraseña.';
            continuar = false;
        }

        if (!continuar) {
            feedback.textContent = msjError;
            return;
        }

        // Validar si ya existe en el sistema usando fetch
        fetch(`/registrar/verificar-datos-bd/?numDoc=${numDoc}&email=${email}`)
            .then(response => response.json())
            .then(data => {
                if (data.existsDoc) {
                    numDocInput.classList.add('is-invalid');
                    msjError = 'Este número de documento ya ha sido registrado.';
                    continuar = false;
                }

                if (data.existsEmail) {
                    emailInput.classList.add('is-invalid');
                    msjError+= (continuar ? "" : " / " ) + 'Este email ya ha sido registrado.';
                    continuar = false;
                }

                if (continuar) {
                    numDocInput.classList.remove('is-invalid');
                    feedback.textContent = '';
                    // Enviar el formulario manualmente si todo está OK
                    document.getElementById('formRegistro').submit();
                }else{
                    feedback.textContent = msjError;
                }
            })
            .catch(error => {
                console.error('Error al verificar datos:', error);
                numDocInput.classList.add('is-invalid');
                emailInput.classList.add('is-invalid');
                feedback.textContent = 'Ocurrió un error al verificar los datos.';
            });
    });
    
});
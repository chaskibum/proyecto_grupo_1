(function () {
    const CLAVE_ALMACENAMIENTO = 'perfilUsuario';

    const botonEditar = document.getElementById('editarPerfil');
    const detallesPersonales = document.getElementById('personal-details');
    const formularioPersonal = document.getElementById('personal-form');

    const nombreValor = document.getElementById('nombreValor');
    const apellidoValor = document.getElementById('apellidoValor');
    const emailValor = document.getElementById('emailValor');
    const telefonoValor = document.getElementById('telefonoValor');
    const birthdateValor = document.getElementById('birthdateValor');

    const inputNombre = document.getElementById('inputNombre');
    const inputApellido = document.getElementById('inputApellido');
    const inputEmail = document.getElementById('inputEmail');
    const inputTelefono = document.getElementById('inputTelefono');

    const botonGuardar = document.getElementById('guardarPerfil');
    const botonCancelar = document.getElementById('cancelarPerfil');

    // Cargar perfil desde localStorage
    function cargarPerfil() {
        const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);
        if (!datos) return null;
        try {
            return JSON.parse(datos);
        } catch (error) {
            return null;
        }
    }

    // Guardar perfil en localStorage
    function guardarPerfil(objeto) {
        localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(objeto));
    }

    // Mostrar datos del perfil en la vista
    function poblarVisualizacion(objeto) {
        nombreValor.textContent = objeto && objeto.nombre ? objeto.nombre : '-';
        apellidoValor.textContent = objeto && objeto.apellido ? objeto.apellido : '-';
        emailValor.textContent = objeto && objeto.email ? objeto.email : '-';
        telefonoValor.textContent = objeto && objeto.telefono ? objeto.telefono : '-';
        try {
            if (birthdateValor) {
                if (objeto && objeto.birthdate) {
                    const fecha = new Date(objeto.birthdate);
                    if (!isNaN(fecha.getTime())) {
                        birthdateValor.textContent = new Intl.DateTimeFormat('es-ES').format(fecha);
                    } else {
                        birthdateValor.textContent = objeto.birthdate || '-';
                    }
                } else {
                    birthdateValor.textContent = '-';
                }
            }
        } catch (error) { 
            if (birthdateValor) birthdateValor.textContent = '-'; 
        }
    }

    // Cargar datos en el formulario de edición
    function poblarFormulario(objeto) {
        inputNombre.value = objeto && objeto.nombre ? objeto.nombre : '';
        inputApellido.value = objeto && objeto.apellido ? objeto.apellido : '';
        inputEmail.value = objeto && objeto.email ? objeto.email : '';
        inputTelefono.value = objeto && objeto.telefono ? objeto.telefono : '';
    }

    // Alternar entre vista de datos y formulario de edición
    function mostrarFormulario(mostrar) {
        if (mostrar) {
            formularioPersonal.classList.remove('d-none');
            detallesPersonales.classList.add('d-none');
            botonEditar.textContent = 'Editar perfil';
        } else {
            formularioPersonal.classList.add('d-none');
            detallesPersonales.classList.remove('d-none');
        }
    }

    // Inicializar vista con datos guardados
    const existente = cargarPerfil();
    poblarVisualizacion(existente);

    // Mostrar formulario al hacer click en editar
    if (botonEditar) {
        botonEditar.addEventListener('click', function () {
            const datos = cargarPerfil();
            poblarFormulario(datos);
            mostrarFormulario(true);
        });
    }

    // Guardar cambios del perfil
    if (botonGuardar) {
        botonGuardar.addEventListener('click', function () {
            const existente = cargarPerfil();
            const nuevosDatos = {
                nombre: inputNombre.value && inputNombre.value.trim(),
                apellido: inputApellido.value && inputApellido.value.trim(),
                email: inputEmail.value && inputEmail.value.trim(),
                telefono: inputTelefono.value && inputTelefono.value.trim(),
                birthdate: existente && existente.birthdate ? existente.birthdate : undefined
                  };

            if (nuevosDatos.email && !nuevosDatos.email.includes('@')) {
                alert('Ingrese un email válido.');
                return;
            }

            guardarPerfil(nuevosDatos);
            poblarVisualizacion(nuevosDatos);
            mostrarFormulario(false);
        });
    }

    // Cancelar edición y volver a la vista
    if (botonCancelar) {
        botonCancelar.addEventListener('click', function () {
            mostrarFormulario(false);
        });
    }

})();

document.addEventListener("DOMContentLoaded", () => {
    const fotoPerfil = document.getElementById("fotoPerfil");
    const botonAgregarFoto = document.getElementById("agregarFoto");
    const inputFoto = document.getElementById("inputFoto");

    let recortador = null;
    let modal = null;

    // Cargar foto de perfil guardada
    const fotoGuardada = localStorage.getItem("fotoPerfilUsuario");
    if (fotoGuardada) {
        aplicarFoto(fotoGuardada);
    }

    // Mostrar menú de opciones al hacer click en botón
    botonAgregarFoto.addEventListener("click", (evento) => {
        evento.stopPropagation();
        document.querySelector(".globo-opciones")?.remove();

        const globo = document.createElement("div");
        globo.className = "globo-opciones shadow";
        globo.innerHTML = `
        <button class="btn btn-outline-primary btn-sm w-100 mb-2" id="btnAgregarFoto">Agregar foto</button>
        <button class="btn btn-outline-danger btn-sm w-100" id="btnEliminarFoto">Eliminar foto</button>
        <div class="globo-flechita"></div>
        `;
        botonAgregarFoto.parentElement.appendChild(globo);

        globo.querySelector("#btnAgregarFoto").addEventListener("click", () => {
            globo.remove();
            inputFoto.click();
        });

        globo.querySelector("#btnEliminarFoto").addEventListener("click", () => {
            globo.remove();
            eliminarFoto();
        });

        document.addEventListener(
            "click",
            function cerrar(evento) {
                if (!globo.contains(evento.target) && evento.target !== botonAgregarFoto) {
                    globo.remove();
                    document.removeEventListener("click", cerrar);
                }
            },
            { once: true }
        );
    });

    // Cargar imagen seleccionada por el usuario
    inputFoto.addEventListener("change", (evento) => {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = (ev) => mostrarModalRecorte(ev.target.result);
        lector.readAsDataURL(archivo);
    });

    // Mostrar modal con herramienta de recorte
    function mostrarModalRecorte(imagenSrc) {
        modal = document.createElement("div");
        modal.classList.add("modal", "fade");
        modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Ajustar foto de perfil</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center">
                <img id="imgRecorte" src="${imagenSrc}" class="imagen-recorte">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="cancelarRecorte">Cancelar</button>
                <button type="button" class="btn btn-success" id="aceptarRecorte">Aceptar</button>
            </div>
            </div>
        </div>
        `;
        document.body.appendChild(modal);

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener("shown.bs.modal", () => {
            // Inicializar Cropper.js en la imagen cargada
            const imagen = document.getElementById("imgRecorte");
            recortador = new Cropper(imagen, {
                aspectRatio: 1,
                viewMode: 2,
                background: false,
                dragMode: "move",
                autoCropArea: 1,
                responsive: true,
                movable: true,
                zoomable: true,
                scalable: false
            });
        });

        modal.querySelector("#cancelarRecorte").addEventListener("click", () => {
            bsModal.hide();
        });

        // Guardar imagen recortada al aceptar
        modal.querySelector("#aceptarRecorte").addEventListener("click", () => {
            const canvas = recortador.getCroppedCanvas({ width: 400, height: 400 });
            const dataURL = canvas.toDataURL("image/png");
            aplicarFoto(dataURL);
            localStorage.setItem("fotoPerfilUsuario", dataURL);
            bsModal.hide();
        });

        modal.addEventListener("hidden.bs.modal", () => {
            if (recortador) {
                recortador.destroy();
                recortador = null;
            }
            modal.remove();
        });
    }

    // Aplicar foto de perfil desde data URL
    function aplicarFoto(dataURL) {
        fotoPerfil.style.backgroundImage = `url(${dataURL})`;
        fotoPerfil.classList.remove("bi-person-circle");
    }

    // Eliminar foto de perfil
    function eliminarFoto() {
        fotoPerfil.style.backgroundImage = "";
        fotoPerfil.classList.add("bi-person-circle");
        localStorage.removeItem("fotoPerfilUsuario");
    }

    // Cargar librería Cropper.js dinámicamente
    function cargarCropper(callback) {
        if (window.Cropper) return callback();
        const enlace = document.createElement("link");
        enlace.rel = "stylesheet";
        enlace.href = "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css";
        document.head.appendChild(enlace);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.js";
        script.onload = callback;
        document.body.appendChild(script);
    }
    cargarCropper(() => {});
});

document.addEventListener('DOMContentLoaded', function () {
    const elementoResumen = document.getElementById('purchase-summary');
    const elementoContador = document.getElementById('purchases-count');
    const elementoTotal = document.getElementById('purchases-total');

    // Obtener clave de almacenamiento personalizada por usuario
    function obtenerClaveUsuario(prefijo) {
        const usuario = localStorage.getItem('usuarioActivo');
        return usuario ? `${prefijo}_${usuario}` : prefijo;
    }

    // Cargar compras del usuario desde localStorage
    function cargarCompras() {
        try {
            const claveUsuario = obtenerClaveUsuario('purchases');
            let datos = localStorage.getItem(claveUsuario);
            if (!datos) datos = localStorage.getItem('purchases');
            const parseado = datos ? JSON.parse(datos) : [];
            return Array.isArray(parseado) ? parseado : [];
        } catch (error) {
            return [];
        }
    }

    // Calcular y mostrar resumen de compras
    function calcularResumen() {
        const compras = cargarCompras();
        if (!elementoResumen) return;

        if (!compras || compras.length === 0) {
            if (elementoContador) elementoContador.textContent = '0';
            if (elementoTotal) elementoTotal.textContent = 'USD 0';
            return;
        }

        // Agrupar compras por fecha
        const grupos = {};
        compras.forEach(item => {
            const clave = item.purchasedAt || (Math.random().toString(36).slice(2));
            if (!grupos[clave]) grupos[clave] = [];
            grupos[clave].push(item);
        });
        const cantidadCompras = Object.keys(grupos).length;

        // Calcular total gastado
        const total = compras.reduce((suma, item) => suma + (Number(item.unitCost || 0) * Number(item.count || 0)), 0);

        const moneda = (compras[0] && compras[0].currency) ? (compras[0].currency + ' ') : '';

        // Actualizar elementos en la interfaz
        if (elementoContador) elementoContador.textContent = String(cantidadCompras);
        if (elementoTotal) elementoTotal.textContent = moneda + new Intl.NumberFormat('es-AR').format(total);
    }

    calcularResumen();

    // Actualizar resumen si cambian las compras en otra pestaña
    window.addEventListener('storage', function (evento) {
        if (!evento.key) return;
        if (evento.key === 'purchases' || evento.key === 'cart' || evento.key.startsWith('purchases_') || evento.key.startsWith('cart_')) {
            calcularResumen();
        }
    });
});
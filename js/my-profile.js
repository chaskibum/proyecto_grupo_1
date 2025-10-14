// Theme behavior is centralized in js/theme.js

// --- Perfil (Información personal) ---
(function () {
    // Keys and DOM
    const STORAGE_KEY = 'perfilUsuario';

    const editarBtn = document.getElementById('editarPerfil');
    const personalDetails = document.getElementById('personal-details');
    const personalForm = document.getElementById('personal-form');

    const nombreValor = document.getElementById('nombreValor');
    const apellidoValor = document.getElementById('apellidoValor');
    const emailValor = document.getElementById('emailValor');
    const telefonoValor = document.getElementById('telefonoValor');

    const inputNombre = document.getElementById('inputNombre');
    const inputApellido = document.getElementById('inputApellido');
    const inputEmail = document.getElementById('inputEmail');
    const inputTelefono = document.getElementById('inputTelefono');

    const guardarBtn = document.getElementById('guardarPerfil');
    const cancelarBtn = document.getElementById('cancelarPerfil');

    function loadPerfil() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('perfil parse error', e);
            return null;
        }
    }

    function savePerfil(obj) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    }

    function populateDisplay(obj) {
        nombreValor.textContent = obj && obj.nombre ? obj.nombre : '-';
        apellidoValor.textContent = obj && obj.apellido ? obj.apellido : '-';
        emailValor.textContent = obj && obj.email ? obj.email : '-';
        telefonoValor.textContent = obj && obj.telefono ? obj.telefono : '-';
    }

    function populateForm(obj) {
        inputNombre.value = obj && obj.nombre ? obj.nombre : '';
        inputApellido.value = obj && obj.apellido ? obj.apellido : '';
        inputEmail.value = obj && obj.email ? obj.email : '';
        inputTelefono.value = obj && obj.telefono ? obj.telefono : '';
    }

    function showForm(show) {
        if (show) {
            personalForm.classList.remove('d-none');
            personalDetails.classList.add('d-none');
            editarBtn.textContent = 'Editar perfil';
        } else {
            personalForm.classList.add('d-none');
            personalDetails.classList.remove('d-none');
        }
    }

    // Initialize
    const existing = loadPerfil();
    populateDisplay(existing);

    if (editarBtn) {
        editarBtn.addEventListener('click', function () {
            const data = loadPerfil();
            populateForm(data);
            showForm(true);
        });
    }

    if (guardarBtn) {
        guardarBtn.addEventListener('click', function () {
            const newData = {
                nombre: inputNombre.value && inputNombre.value.trim(),
                apellido: inputApellido.value && inputApellido.value.trim(),
                email: inputEmail.value && inputEmail.value.trim(),
                telefono: inputTelefono.value && inputTelefono.value.trim()
            };

            // Basic validation: email if provided should include @
            if (newData.email && !newData.email.includes('@')) {
                alert('Ingrese un email válido.');
                return;
            }

            savePerfil(newData);
            populateDisplay(newData);
            showForm(false);
        });
    }

    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', function () {
            // just hide form and keep existing display
            showForm(false);
        });
    }

})();

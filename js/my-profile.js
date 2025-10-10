// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Manejo del tema oscuro/claro
    const button = document.getElementById("oscuro");
    const body = document.body;
    const icon = button?.querySelector("i");

    // Aplicar tema guardado
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        if (icon) icon.className = "bi bi-sun-fill";
    } else {
        if (icon) icon.className = "bi bi-moon-fill";
    }

    // Cambiar tema al hacer clic
    if (button) {
        button.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            if (body.classList.contains("dark-mode")) {
                icon.className = "bi bi-sun-fill";
                localStorage.setItem("theme", "dark");
            } else {
                icon.className = "bi bi-moon-fill";
                localStorage.setItem("theme", "light");
            }
        });
    }

    // Manejo del perfil de usuario
    const PROFILE_KEY = 'perfilUsuario';
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    const userTitle = document.getElementById('usuarioActivo');
    
    // Mostrar nombre de usuario actual
    if (userTitle && usuarioActivo) {
        userTitle.textContent = usuarioActivo;
    }

    // Cargar datos guardados del perfil
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    let profileData = savedProfile ? JSON.parse(savedProfile) : {
        nombre: '',
        apellido: '',
        email: '',
        telefono: ''
    };

    // Manejar la foto de perfil
    const fotoBtn = document.getElementById('fotoPerfilBtn');
    const fotoIcon = document.getElementById('fotoPerfil');

    if (fotoBtn && fotoIcon) {
        fotoBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.addEventListener('change', () => {
                const file = input.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (typeof e.target?.result === 'string') {
                        fotoIcon.style.backgroundImage = `url(${e.target.result})`;
                        fotoIcon.style.backgroundSize = 'cover';
                        fotoIcon.style.borderRadius = '50%';
                        fotoIcon.className = ''; // Remover clase de ícono por defecto
                    }
                };
                reader.readAsDataURL(file);
            });

            input.click();
        });
    }

    // Función para actualizar la visualización de los datos del perfil
    function updateProfileDisplay(data) {
        const fields = ['nombre', 'apellido', 'email', 'telefono'];
        fields.forEach(field => {
            const displayElement = document.getElementById(`${field}-display`);
            if (displayElement) {
                displayElement.textContent = data[field] || '-';
            }
        });
    }

    // Mostrar datos guardados inicialmente
    updateProfileDisplay(profileData);

    // Manejar el botón de Actualizar Perfil
    const actualizarBtn = document.getElementById('actualizarPerfil');
    const profileForm = document.getElementById('profile-form');
    
    if (actualizarBtn && profileForm) {
        actualizarBtn.addEventListener('click', () => {
            // Toggle del formulario
            const isVisible = profileForm.style.display !== 'none';
            profileForm.style.display = isVisible ? 'none' : 'block';
            
            // Si el formulario se está mostrando, rellenar con datos guardados
            if (!isVisible) {
                const fields = ['nombre', 'apellido', 'email', 'telefono'];
                fields.forEach(field => {
                    const input = document.getElementById(field);
                    if (input && profileData[field]) {
                        input.value = profileData[field];
                    }
                });
            }
        });
    }

    // Manejar guardado del formulario
    const guardarBtn = document.getElementById('guardarPerfil');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Validar campos requeridos
            const nombre = document.getElementById('nombre');
            const apellido = document.getElementById('apellido');
            const email = document.getElementById('email');
            
            if (!nombre?.value || !apellido?.value || !email?.value) {
                alert('Por favor complete los campos obligatorios (Nombre, Apellido y Email)');
                return;
            }

            // Guardar datos del perfil
            profileData = {
                nombre: nombre.value,
                apellido: apellido.value,
                email: email.value,
                telefono: document.getElementById('telefono')?.value || ''
            };

            try {
                localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
                
                // Actualizar la visualización de los datos
                updateProfileDisplay(profileData);
                
                // Ocultar el formulario y mostrar mensaje de éxito
                if (profileForm) {
                    profileForm.style.display = 'none';
                }
                alert('Perfil guardado exitosamente');
            } catch (err) {
                console.error('Error al guardar el perfil:', err);
                alert('Error al guardar el perfil');
            }
        });
    }
});
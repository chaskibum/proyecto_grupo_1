// Procesar formulario de inicio de sesión
document.getElementById("login").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const usuario = document.getElementById("name").value;
    const contrasena = document.getElementById("pword").value;
    const fechaNacimiento = document.getElementById("birthdate")?.value;
    
    // Validar que todos los campos estén completos
    if (usuario === "" || contrasena === "" || !fechaNacimiento) {
        mostrarAlerta("Por favor, complete todos los campos requeridos.");
        return;
    }
    if (usuario.length > 10) {
        mostrarAlerta("El nombre de usuario no puede tener más de 10 caracteres.");
        return;
    }

    // Verificar que el usuario tenga al menos 18 años
    const fechaNac = new Date(fechaNacimiento);
    if (isNaN(fechaNac.getTime())) {
        mostrarAlerta('Fecha de nacimiento inválida.');
        return;
    }
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear() - (hoy < new Date(hoy.getFullYear(), fechaNac.getMonth(), fechaNac.getDate()) ? 1 : 0);
    if (edad < 18) {
        mostrarAlerta('Debes ser mayor de 18 años para iniciar sesión.');
        return;
    }

    // Guardar sesión y actualizar perfil del usuario
    try {
        const perfilGuardado = localStorage.getItem('perfilUsuario');
        let perfil = perfilGuardado ? JSON.parse(perfilGuardado) : {};
        perfil.nombre = perfil.nombre || usuario;
        perfil.birthdate = perfil.birthdate || fechaNacimiento;
        
        if (perfil.birthdate !== fechaNacimiento) {
            perfil.birthdate = fechaNacimiento;
        }
        localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    } catch (e) {
    }

    // Iniciar sesión y redirigir al índice
    mostrarAlerta("Bienvenido, " + usuario + "!");
    localStorage.setItem("sesionActiva", "true");
    localStorage.setItem("usuarioActivo", usuario);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
});

// Mostrar mensaje de alerta temporal
function mostrarAlerta(mensaje) {
    const alerta = document.getElementById("alert");
    document.getElementById("msalert").innerText = mensaje;
    alerta.style.display = "block";
    setTimeout(() => {
        alerta.style.display = "none";
    }, 2000);
}

// Navegar a la página anterior
function volver() {
    if (document.referrer) {
        window.location.href = document.referrer;
    } else {
        window.location.href = "index.html";
    }
}
document.getElementById("login").addEventListener("submit", function (event) {
    event.preventDefault();
    let usuario = document.getElementById("name").value;
    let contrasena = document.getElementById("pword").value;
    let birth = document.getElementById("birthdate")?.value;
    if (usuario === "" || contrasena === "" || !birth) {
        showAlert("Por favor, complete todos los campos requeridos.");
        return;
    }
    if (usuario.length > 10) {
        showAlert("El nombre de usuario no puede tener más de 10 caracteres.");
        return;
    }

    // Validar edad mínima 18 años
    const birthDate = new Date(birth);
    if (isNaN(birthDate.getTime())) {
        showAlert('Fecha de nacimiento inválida.');
        return;
    }
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    if (age < 18) {
        showAlert('Debes ser mayor de 18 años para iniciar sesión.');
        return;
    }

    // Login simulado: guardar sesión y perfil (si no existe o para actualizar birthdate)
    try {
        const rawPerfil = localStorage.getItem('perfilUsuario');
        let perfil = rawPerfil ? JSON.parse(rawPerfil) : {};
        perfil.nombre = perfil.nombre || usuario;
        perfil.birthdate = perfil.birthdate || birth;
        // si la fecha ingresada es distinta a la guardada, actualizamos con la ingresada
        if (perfil.birthdate !== birth) perfil.birthdate = birth;
        localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    } catch (e) {
        console.warn('No se pudo actualizar perfil en localStorage', e);
    }

    showAlert("Bienvenido, " + usuario + "!");
    localStorage.setItem("sesionActiva", "true");
    localStorage.setItem("usuarioActivo", usuario);
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
});

function showAlert(mensaje) {
    const alerta = document.getElementById("alert");
    document.getElementById("msalert").innerText = mensaje;
    alerta.style.display = "block";
    setTimeout(() => {
        alerta.style.display = "none";
    }, 2000);
}

function volver() {
    if (document.referrer) {
        window.location.href = document.referrer;
    } else {
        window.location.href = "index.html";
    }
}

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
document.getElementById("login").addEventListener("submit", function (event) {
    event.preventDefault();
    let usuario = document.getElementById("name").value;
    let contrasena = document.getElementById("pword").value;
    if (usuario === "" || contrasena === "") {
        showAlert("Por favor, complete todos los campos requeridos.");
    } else if (usuario.length > 10) {
        showAlert("El nombre de usuario no puede tener más de 10 caracteres.");
    } else {
        showAlert("Bienvenido, " + usuario + "!");
        localStorage.setItem("sesionActiva", "true");
        localStorage.setItem("usuarioActivo", usuario);
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    }
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
        window.location.href = "index.html";
    }
}

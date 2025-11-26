document.getElementById("login").addEventListener("submit", function (event) {
    event.preventDefault();

    let usuario = document.getElementById("name").value.trim();
    let contrasena = document.getElementById("pword").value.trim();

    if (usuario === "" || contrasena === "") {
        showAlert("Por favor, complete todos los campos requeridos.");
        return;
    }

    if (usuario.length > 10) {
        showAlert("El nombre de usuario no puede tener más de 10 caracteres.");
        return;
    }

    // --- LOGIN CONTRA BACKEND ---
    fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password: contrasena })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Credenciales incorrectas");
        }
        return res.json();
    })
    .then(data => {
        // Guardar token
        localStorage.setItem("token", data.token);

        showAlert("Bienvenido, " + usuario + "!");

        // REDIRECCIÓN DESPUÉS DEL LOGIN
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);
    })
    .catch(err => {
        showAlert(err.message);
    });
});

function showAlert(mensaje) {
    const alerta = document.getElementById("alert");
    const msalert = document.getElementById("msalert");

    msalert.innerText = mensaje;
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

// ------- DARK MODE -------
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
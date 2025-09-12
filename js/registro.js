function mostrarAlerta(mensaje, esExito = false) {
    const alerta = document.getElementById('alert');
    const msalert = document.getElementById('msalert');
    if (!alerta || !msalert) return;
    msalert.textContent = mensaje;
    alerta.style.display = 'block';
    alerta.style.background = esExito ? '#d4edda' : '#f8d7da';
    alerta.style.color = esExito ? '#155724' : '#721c24';
    setTimeout(() => {
        alerta.style.display = 'none';
        if (esExito) {
            window.location.href = 'login.html';
        }
    }, 1500);
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registroForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let campos = form.querySelectorAll('input, select, textarea');
        let vacio = false;
        campos.forEach(function (campo) {
            if (campo.type !== 'submit' && campo.value.trim() === '') {
                vacio = true;
                campo.classList.add('is-invalid');
            } else {
                campo.classList.remove('is-invalid');
            }
        });
        if (vacio) {
            mostrarAlerta('Por favor, completa todos los campos.');
            return;
        }
        mostrarAlerta('¡Gracias por registrarte!', true);
    });
});

function volver() {
    if (document.referrer) {
        window.location.href = document.referrer;
    }
}

function mostrarAlerta(mensaje, esExito = false) {
    const alerta = document.getElementById('alert');
    const msalert = document.getElementById('msalert');
    console.log('mostrarAlerta llamado:', mensaje, esExito);
    if (!alerta || !msalert) {
        console.warn('Elemento alerta o msalert no encontrado — creando elementos de alerta temporalmente');
        // crear elementos de alerta si no existen
        const nuevo = document.createElement('div');
        nuevo.id = 'alert';
        nuevo.className = 'alerta';
        const p = document.createElement('p');
        p.id = 'msalert';
        nuevo.appendChild(p);
        document.body.appendChild(nuevo);
        return;
    }
    // refrescar referencias
    const alertaRef = document.getElementById('alert');
    const msalertRef = document.getElementById('msalert');
    if (!alertaRef || !msalertRef) {
        console.error('No se pudo crear la alerta');
        return;
    }
    const alertaEl = alertaRef;
    const msalertEl = msalertRef;
    // usar las referencias locales para setear contenido y estilos
    msalertEl.textContent = mensaje;
    // Forzar estilos inline para asegurar visibilidad durante depuración
    alertaEl.style.display = 'block';
    alertaEl.style.background = esExito ? '#d4edda' : '#f8d7da';
    alertaEl.style.color = esExito ? '#155724' : '#721c24';
    alertaEl.style.top = '20px';
    alertaEl.style.left = '50%';
    alertaEl.style.transform = 'translateX(-50%)';
    alertaEl.style.zIndex = '99999';

    // -- Banner de depuración persistente (para asegurar visibilidad durante pruebas)
    let debugBanner = document.getElementById('debug-alert');
    if (!debugBanner) {
        debugBanner = document.createElement('div');
        debugBanner.id = 'debug-alert';
        document.body.appendChild(debugBanner);
    }
    debugBanner.textContent = mensaje;
    debugBanner.style.position = 'fixed';
    debugBanner.style.top = '0';
    debugBanner.style.left = '0';
    debugBanner.style.width = '100%';
    debugBanner.style.padding = '10px 12px';
    debugBanner.style.background = esExito ? '#16a34a' : '#b91c1c';
    debugBanner.style.color = '#fff';
    debugBanner.style.fontWeight = '700';
    debugBanner.style.textAlign = 'center';
    debugBanner.style.zIndex = '100000';

    setTimeout(() => {
        const alertaHide = document.getElementById('alert');
        if (alertaHide) alertaHide.style.display = 'none';
        alerta.style.display = 'none';
        if (esExito) {
            window.location.href = 'login.html';
        }
    }, 1500);
}


function evaluatePasswordStrength(value) {
    let score = 0;
    if (!value) return {score: 0, label: ''};
    // length
    if (value.length >= 6) score += 1;
    if (value.length >= 12) score += 1;
    // variety
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    let label = 'Débil';
    if (score >= 5) label = 'Muy Fuerte';
    else if (score >= 4) label = 'Fuerte';
    else if (score >= 3) label = 'Media';
    else if (score >= 1) label = 'Débil';

    return {score, label};
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
        // Validar fecha de nacimiento y edad mínima (18 años)
        const birthInput = form.querySelector('#birthdate');
        if (!birthInput || !birthInput.value) {
            mostrarAlerta('Por favor, ingresa tu fecha de nacimiento.');
            return;
        }
        const birthDate = new Date(birthInput.value);
        if (isNaN(birthDate.getTime())) {
            mostrarAlerta('Fecha de nacimiento inválida.');
            return;
        }
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear() - (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
        if (age < 18) {
            mostrarAlerta('Debes ser mayor de 18 años para registrarte.');
            return;
        }
        // Validar que las contraseñas coincidan
        const pwd1 = form.querySelector('#pword');
        const pwd2 = form.querySelector('#pwordConfirm');
        if (pwd1 && pwd2 && pwd1.value !== pwd2.value) {
            mostrarAlerta('Las contraseñas no coinciden.');
            pwd1.classList.add('is-invalid');
            pwd2.classList.add('is-invalid');
            return;
        }
        // Validar fuerza mínima (Fuerte o Muy Fuerte)
        if (pwd1) {
            const res = evaluatePasswordStrength(pwd1.value);
            if (res.score < 4) {
                mostrarAlerta('La contraseña debe ser Fuerte o Muy Fuerte.');
                pwd1.classList.add('is-invalid');
                return;
            }
        }
        // Guardar perfil de usuario con fecha de nacimiento
        const payload = {
    username: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('pword').value,
    birthdate: birthInput.value
};

fetch("http://localhost:3000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
})
    .then(res => res.json())
    .then(data => {
        if (data.message === "Usuario registrado con éxito") {
            mostrarAlerta("¡Gracias por registrarte!", true);
        } else {
            mostrarAlerta(data.message);
        }
    })
    .catch(err => {
        console.log(err);
        mostrarAlerta("Error al conectar con el servidor");
    });
});
});

function volver() {
    if (document.referrer) {
        window.location.href = document.referrer;
    }
}

// Indicador de fuerza de contraseña
document.addEventListener('DOMContentLoaded', function () {
    const pwd = document.getElementById('pword');
    const fill = document.getElementById('pwdStrengthFill');
    const text = document.getElementById('pwdStrengthText');
    if (!pwd || !fill || !text) return;
    pwd.addEventListener('input', function (e) {
        const val = e.target.value || '';
        const res = evaluatePasswordStrength(val);
        const pct = Math.min(100, Math.round((res.score / 5) * 100));
        fill.style.width = pct + '%';
        // colorear por score
        if (res.score >= 4) fill.style.background = '#16a34a'; // green
        else if (res.score >= 3) fill.style.background = '#f59e0b'; // amber
        else fill.style.background = '#ef4444'; // red
        text.textContent = res.label;
    });
});

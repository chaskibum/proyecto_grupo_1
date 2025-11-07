// Muestra alertas de éxito o error al usuario
function mostrarAlerta(mensaje, esExito = false) {
    const alerta = document.getElementById('alert');
    const msalert = document.getElementById('msalert');
    
    if (!alerta || !msalert) {
        return;
    }
    
    // Configurar contenido y estilos según tipo de alerta
    msalert.textContent = mensaje;
    alerta.style.display = 'block';
    alerta.style.background = esExito ? '#d4edda' : '#f8d7da';
    alerta.style.color = esExito ? '#155724' : '#721c24';
    alerta.style.top = '20px';
    alerta.style.left = '50%';
    alerta.style.transform = 'translateX(-50%)';
    alerta.style.zIndex = '99999';

    // Ocultar alerta después de 1.5s y redirigir si es exitoso
    setTimeout(() => {
        alerta.style.display = 'none';
        if (esExito) {
            window.location.href = 'login.html';
        }
    }, 1500);
}

// Evalúa la fortaleza de la contraseña basándose en longitud y variedad de caracteres
function evaluarFortalezaContrasena(valor) {
    let puntuacion = 0;
    if (!valor) return {puntuacion: 0, etiqueta: ''};
    
    // Puntos por longitud de contraseña
    if (valor.length >= 6) puntuacion += 1;
    if (valor.length >= 12) puntuacion += 1;
    
    // Puntos por variedad de caracteres (mayúsculas, números, símbolos)
    if (/[A-Z]/.test(valor)) puntuacion += 1;
    if (/[0-9]/.test(valor)) puntuacion += 1;
    if (/[^A-Za-z0-9]/.test(valor)) puntuacion += 1;

    // Clasificar fortaleza según puntuación obtenida
    let etiqueta = 'Débil';
    if (puntuacion >= 5) etiqueta = 'Muy Fuerte';
    else if (puntuacion >= 4) etiqueta = 'Fuerte';
    else if (puntuacion >= 3) etiqueta = 'Media';
    else if (puntuacion >= 1) etiqueta = 'Débil';

    return {puntuacion, etiqueta};
}

function volver() {
    if (document.referrer) {
        window.location.href = document.referrer;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registroForm');
    if (!form) return;
    
    // Manejar envío del formulario
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
        const inputFechaNacimiento = form.querySelector('#birthdate');
        if (!inputFechaNacimiento || !inputFechaNacimiento.value) {
            mostrarAlerta('Por favor, ingresa tu fecha de nacimiento.');
            return;
        }
        const fechaNacimiento = new Date(inputFechaNacimiento.value);
        if (isNaN(fechaNacimiento.getTime())) {
            mostrarAlerta('Fecha de nacimiento inválida.');
            return;
        }
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear() - (hoy < new Date(hoy.getFullYear(), fechaNacimiento.getMonth(), fechaNacimiento.getDate()) ? 1 : 0);
        if (edad < 18) {
            mostrarAlerta('Debes ser mayor de 18 años para registrarte.');
            return;
        }
        
        // Validar que las contraseñas coincidan
        const contrasena = form.querySelector('#pword');
        const contrasenaConfirmar = form.querySelector('#pwordConfirm');
        if (contrasena && contrasenaConfirmar && contrasena.value !== contrasenaConfirmar.value) {
            mostrarAlerta('Las contraseñas no coinciden.');
            contrasena.classList.add('is-invalid');
            contrasenaConfirmar.classList.add('is-invalid');
            return;
        }
        
        // Validar fuerza mínima (Fuerte o Muy Fuerte)
        if (contrasena) {
            const resultado = evaluarFortalezaContrasena(contrasena.value);
            if (resultado.puntuacion < 4) {
                mostrarAlerta('La contraseña debe ser Fuerte o Muy Fuerte.');
                contrasena.classList.add('is-invalid');
                return;
            }
        }
        
        // Guardar perfil de usuario con fecha de nacimiento
        try {
            const nombre = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const perfil = {
                nombre: nombre,
                email: email,
                birthdate: inputFechaNacimiento.value
            };
            localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
            localStorage.setItem('usuarioActivo', nombre);
        } catch (e) {
            // Error al guardar perfil
        }

        mostrarAlerta('¡Gracias por registrarte!', true);
    });
    
    // Indicador de fuerza de contraseña
    const inputContrasena = document.getElementById('pword');
    const barraFortaleza = document.getElementById('pwdStrengthFill');
    const textoFortaleza = document.getElementById('pwdStrengthText');
    
    if (inputContrasena && barraFortaleza && textoFortaleza) {
        inputContrasena.addEventListener('input', function (e) {
            const valor = e.target.value || '';
            const resultado = evaluarFortalezaContrasena(valor);
            const porcentaje = Math.min(100, Math.round((resultado.puntuacion / 5) * 100));
            barraFortaleza.style.width = porcentaje + '%';
            
            // Colorear según puntuación
            if (resultado.puntuacion >= 4) barraFortaleza.style.background = '#16a34a';
            else if (resultado.puntuacion >= 3) barraFortaleza.style.background = '#f59e0b';
            else barraFortaleza.style.background = '#ef4444';
            
            textoFortaleza.textContent = resultado.etiqueta;
        });
    }
});

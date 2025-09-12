window.addEventListener('DOMContentLoaded', function () {
    const usuario = localStorage.getItem('usuarioActivo');
    if (usuario) {
        const navSesion = document.getElementById('inicio-sesion');
        if (navSesion) {
            navSesion.textContent = usuario;
            navSesion.href = 'my-profile.html';
        }
    }
});

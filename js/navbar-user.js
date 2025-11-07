// Actualizar nombre de usuario en el navbar
function actualizarUsuarioNavbar() {
    let usuario = localStorage.getItem('usuarioActivo');
    
    // Si no hay usuario activo, intentar obtenerlo del perfil
    if (!usuario) {
        try {
            const datos = localStorage.getItem('perfilUsuario');
            if (datos) {
                const perfil = JSON.parse(datos);
                if (perfil && perfil.nombre) usuario = perfil.nombre;
            }
        } catch (error) { }
    }
    if (!usuario) return;
    
    const navegacionSesion = document.getElementById('inicio-sesion');
    if (navegacionSesion) {
        const paginaActual = window.location.pathname.split('/').pop();
        
        // Si estamos en la página de perfil, mostrar opción de cerrar sesión
        if (paginaActual === 'my-profile.html') {
            navegacionSesion.textContent = 'Cerrar sesión';
            navegacionSesion.href = 'login.html';
            if (!navegacionSesion.__cerrarSesionAdjuntado) {
                navegacionSesion.__cerrarSesionAdjuntado = true;
                navegacionSesion.addEventListener('click', function (evento) {
                    evento.preventDefault();
                    localStorage.removeItem('usuarioActivo');
                    localStorage.removeItem('sesionActiva');
                    window.location.href = 'login.html';
                });
            }
        } else {
            // En otras páginas, mostrar nombre del usuario con enlace al perfil
            navegacionSesion.textContent = usuario;
            navegacionSesion.href = 'my-profile.html';
            navegacionSesion.__cerrarSesionAdjuntado = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', actualizarUsuarioNavbar);
document.addEventListener('navbar:ready', actualizarUsuarioNavbar);
actualizarUsuarioNavbar();

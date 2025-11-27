function updateNavbarUser() {
    let usuario = localStorage.getItem('usuarioActivo');
    //  si existe perfilUsuario (desde el formulario de perfil), usar su nombre
    if (!usuario) {
        try {
            const raw = localStorage.getItem('perfilUsuario');
            if (raw) {
                const p = JSON.parse(raw);
                if (p && p.nombre) usuario = p.nombre;
            }
        } catch (e) { /* ignore parse errors */ }
    }
    if (!usuario) return;
    const navSesion = document.getElementById('inicio-sesion');
    if (navSesion) {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'my-profile.html') {
            navSesion.textContent = 'Cerrar sesión';
            navSesion.href = 'login.html';
            if (!navSesion.__logoutAttached) {
                navSesion.__logoutAttached = true;
                navSesion.addEventListener('click', function (e) {
                    e.preventDefault();
                    localStorage.removeItem('usuarioActivo');
                    localStorage.removeItem('sesionActiva');
                    window.location.href = 'login.html';
                });
            }
        } else {
            navSesion.textContent = usuario;
            navSesion.href = 'my-profile.html';
            navSesion.__logoutAttached = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', updateNavbarUser);
document.addEventListener('navbar:ready', updateNavbarUser);
updateNavbarUser();

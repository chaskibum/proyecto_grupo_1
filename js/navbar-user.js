function updateNavbarUser() {
    let usuario = localStorage.getItem('usuarioActivo');
    // fallback: if perfilUsuario exists (from profile form), use its nombre
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
            // attach logout action (idempotent)
            if (!navSesion.__logoutAttached) {
                navSesion.__logoutAttached = true;
                navSesion.addEventListener('click', function (e) {
                    e.preventDefault();
                    localStorage.removeItem('usuarioActivo');
                    localStorage.removeItem('sesionActiva');
                    // optional: keep perfilUsuario but you could also remove it
                    window.location.href = 'login.html';
                });
            }
        } else {
            navSesion.textContent = usuario;
            navSesion.href = 'my-profile.html';
            // remove any logout handler flag if present
            navSesion.__logoutAttached = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', updateNavbarUser);
document.addEventListener('navbar:ready', updateNavbarUser);
updateNavbarUser();

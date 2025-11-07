// Cargar componentes parciales (navbar, footer) mediante fetch
function incluirParcial(id, url) {
    fetch(url)
        .then(respuesta => respuesta.text())
        .then(html => {
            const elemento = document.getElementById(id);
            if (!elemento) return;
            elemento.outerHTML = html;

            // Inicializar navbar y cargar script asociado
            if (id === 'navbar') {
                if (!window.__script_navbar_cargado) {
                    window.__script_navbar_cargado = true;
                    const script = document.createElement('script');
                    script.src = 'js/navbar.js';
                    script.onload = () => document.dispatchEvent(new Event('navbar:ready'));
                    document.body.appendChild(script);
                } else {
                    document.dispatchEvent(new Event('navbar:ready'));
                }

                // Actualizar badge del carrito inmediatamente
                try {
                    const datos = localStorage.getItem('cart');
                    const carrito = datos ? JSON.parse(datos) : [];
                    const total = Array.isArray(carrito) ? carrito.reduce((suma, item) => suma + (Number(item.count || 0)), 0) : 0;
                    const insignia = document.getElementById('cart-badge');
                    if (insignia) {
                        insignia.textContent = total;
                        insignia.style.display = total > 0 ? 'inline-block' : 'none';
                    }
                } catch (error) {
                }
            }
            
            // Emitir evento cuando el footer está listo
            if (id === 'main-footer') {
                document.dispatchEvent(new Event('footer:ready'));
            }
        });
}

// Cargar navbar y footer al iniciar
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('navbar')) incluirParcial('navbar', 'navbar.html');
    if (document.getElementById('main-footer')) incluirParcial('main-footer', 'footer.html');
});
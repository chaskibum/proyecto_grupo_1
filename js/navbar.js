function inicializarNavbar() {
    // Mapeo de nombres de categorías a IDs
    const MAPA_IDS = {
        'Autos': '101',
        'Juguetes': '102',
        'Muebles': '103',
        'Herramientas': '105',
        'Computadoras': '106',
        'Vestimenta': '107',
        'Electrodomésticos': '108',
        'Deporte': '109',
        'Celulares': '110'
    };

    // Configurar enlaces de categorías en el menú desplegable
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(enlace => {
        enlace.addEventListener('click', function (evento) {
            evento.preventDefault();
            const nombre = (enlace.dataset.catName || enlace.textContent).trim();
            const id = enlace.dataset.catId || MAPA_IDS[nombre];
            if (id) {
                localStorage.setItem('catID', id);
                localStorage.setItem('catName', nombre);
                window.location.href = 'products.html';
            }
        });
    });

    // Actualizar badge del carrito con cantidad de productos
    function actualizarInsigniaCarrito() {
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

    actualizarInsigniaCarrito();

    // Escuchar eventos de actualización del carrito
    document.addEventListener('cart:updated', function (evento) {
        try {
            if (evento && evento.detail && typeof evento.detail.total !== 'undefined') {
                const insignia = document.getElementById('cart-badge');
                if (insignia) {
                    insignia.textContent = evento.detail.total;
                    insignia.style.display = evento.detail.total > 0 ? 'inline-block' : 'none';
                }
            } else {
                actualizarInsigniaCarrito();
            }
        } catch (error) {
            actualizarInsigniaCarrito();
        }
    });

    // Actualizar badge si cambia el carrito en otra pestaña
    window.addEventListener('storage', function (evento) {
        if (evento.key === 'cart') actualizarInsigniaCarrito();
    });
}

document.addEventListener('DOMContentLoaded', inicializarNavbar);
document.addEventListener('navbar:ready', inicializarNavbar);
// Maneja la selección de categorías desde el navbar y la navegación correcta a products.html
function inicializarNavbar() {
  const ID_MAP = {
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

  document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      const name = (a.dataset.catName || a.textContent).trim();
      const id = a.dataset.catId || ID_MAP[name];
      if (id) {
        localStorage.setItem('catID', id);
        localStorage.setItem('catName', name);
        window.location.href = 'products.html';
      }
    });
  });

    // --- Mostrar badge con la cantidad total de productos en el carrito ---
    function actualizarBadgeCarrito() {
      try {
        const raw = localStorage.getItem('cart');
        const cart = raw ? JSON.parse(raw) : [];
        const total = Array.isArray(cart) ? cart.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
        const badge = document.getElementById('cart-badge');
        if (badge) {
          badge.textContent = total;
          badge.style.display = total > 0 ? 'inline-block' : 'none';
        }
      } catch (e) {
        console.error('Error leyendo carrito para badge:', e);
      }
    }

  // Actualizar al cargar
  actualizarBadgeCarrito();
  // Escuchar evento personalizado para actualizaciones dentro de la misma pestaña
  document.addEventListener('cart:updated', function (e) {
    try {
      if (e && e.detail && typeof e.detail.total !== 'undefined') {
        const badge = document.getElementById('cart-badge');
        if (badge) {
          badge.textContent = e.detail.total;
          badge.style.display = e.detail.total > 0 ? 'inline-block' : 'none';
        }
      } else {
        actualizarBadgeCarrito();
      }
    } catch (err) {
      console.warn('Error manejando cart:updated en navbar:', err);
      actualizarBadgeCarrito();
    }
  });
  // Escuchar cambios en other tabs
  window.addEventListener('storage', function (e) {
    if (e.key === 'cart') actualizarBadgeCarrito();
  });
}

// Inicializar tanto en carga normal como cuando el partial de navbar se inserta
document.addEventListener('DOMContentLoaded', inicializarNavbar);
document.addEventListener('navbar:ready', inicializarNavbar);
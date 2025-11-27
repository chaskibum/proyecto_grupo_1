// Carga navbar y footer en cada página
function incluirParcial(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      const el = document.getElementById(id);
      if (!el) return;
      el.outerHTML = html;
      // Despachar eventos específicos para que otros scripts se inicialicen
      // una vez el partial esté disponible en el DOM.
      if (id === 'navbar') {
        // Asegurar que el script de inicialización del navbar esté disponible,
        // luego notificar a los listeners.
        // Cargar dinamicamente navbar.js para que se ejecute después de insertar el partial.
        // Usamos una bandera global para evitar cargarlo múltiples veces.
        if (!window.__navbar_script_loaded) {
          window.__navbar_script_loaded = true;
          const s = document.createElement('script');
          s.src = 'js/navbar.js';
          s.onload = () => document.dispatchEvent(new Event('navbar:ready'));
          document.body.appendChild(s);
        } else {
          document.dispatchEvent(new Event('navbar:ready'));
        }

        // También intentamos actualizar el badge del carrito inmediatamente
        // tras insertar el partial (por si navbar.js aún no se ha inicializado).
        try {
          const raw = localStorage.getItem('cart');
          const cart = raw ? JSON.parse(raw) : [];
          const total = Array.isArray(cart) ? cart.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
          // el elemento puede no existir todavía si el partial no contiene badge
          const badge = document.getElementById('cart-badge');
          if (badge) {
            badge.textContent = total;
            badge.style.display = total > 0 ? 'inline-block' : 'none';
          }
        } catch (e) {
          console.warn('No se pudo actualizar badge tras inyectar navbar:', e);
        }
      }
      if (id === 'main-footer') {
        document.dispatchEvent(new Event('footer:ready'));
      }
    });
}
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('navbar')) incluirParcial('navbar', 'navbar.html');
  if (document.getElementById('main-footer')) incluirParcial('main-footer', 'footer.html');
});
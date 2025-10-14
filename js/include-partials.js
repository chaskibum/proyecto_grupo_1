// Carga navbar y footer en cada página
function includePartial(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      const el = document.getElementById(id);
      if (!el) return;
      el.outerHTML = html;
      // Dispatch specific events so other scripts can initialize after
      // the partial is available in the DOM.
      if (id === 'navbar') {
        document.dispatchEvent(new Event('navbar:ready'));
      }
      if (id === 'main-footer') {
        document.dispatchEvent(new Event('footer:ready'));
      }
    });
}
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('navbar')) includePartial('navbar', 'navbar.html');
  if (document.getElementById('main-footer')) includePartial('main-footer', 'footer.html');
});
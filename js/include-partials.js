// Carga navbar y footer en cada página
function includePartial(id, url) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).outerHTML = html;
    });
}
document.addEventListener('DOMContentLoaded', function() {
  if(document.getElementById('main-footer')) includePartial('main-footer', 'footer.html');
 });
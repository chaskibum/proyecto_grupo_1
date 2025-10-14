// theme.js - manejo del tema oscuro, compatible con carga dinámica del navbar
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // Esperar hasta que el botón exista (en caso de carga dinámica de navbar)
  const waitBtn = setInterval(() => {
    const button = document.getElementById('oscuro');
    if (!button) return;
    clearInterval(waitBtn);
    const icon = button.querySelector('i') || document.getElementById('luna');

    // Aplicar tema guardado
    if (localStorage.getItem('theme') === 'dark') {
      body.classList.add('dark-mode');
      if (icon) icon.className = 'bi bi-sun-fill';
    } else {
      if (icon) icon.className = 'bi bi-moon-fill';
    }

    // Alternar tema al hacer click
    button.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      if (body.classList.contains('dark-mode')) {
        if (icon) icon.className = 'bi bi-sun-fill';
        localStorage.setItem('theme', 'dark');
      } else {
        if (icon) icon.className = 'bi bi-moon-fill';
        localStorage.setItem('theme', 'light');
      }
    });
  }, 50);
});

// Centralized theme handling. Listens for DOMContentLoaded and for
// 'navbar:ready' (dispatched by include-partials) so it can safely attach
// handlers to the #oscuro button whether the navbar is already present or
// injected later.
(function () {
  const body = document.body;

  function setIcon(iconEl, dark) {
    if (!iconEl) return;
    iconEl.className = dark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  }

  function applyThemeFromStorage() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) body.classList.add('dark-mode'); else body.classList.remove('dark-mode');
    const btn = document.getElementById('oscuro');
    const icon = btn ? btn.querySelector('i') : null;
    setIcon(icon, isDark);
  }

  function attachButtonListener() {
    const button = document.getElementById('oscuro');
    if (!button) return;
    // Avoid adding multiple listeners
    if (button.__themeListenerAttached) return;
    button.__themeListenerAttached = true;

    button.addEventListener('click', function (e) {
      e.preventDefault();
      body.classList.toggle('dark-mode');
      const nowDark = body.classList.contains('dark-mode');
      const icon = button.querySelector('i');
      setIcon(icon, nowDark);
      localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    });
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', function () {
    applyThemeFromStorage();
    attachButtonListener();
  });

  // Also run when navbar is injected
  document.addEventListener('navbar:ready', function () {
    applyThemeFromStorage();
    attachButtonListener();
  });

})();

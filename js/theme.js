document.addEventListener("DOMContentLoaded", () => {
  // Esperar a que el botón exista si navbar se carga dinámicamente
  const checkButton = setInterval(() => {
    const button = document.getElementById("oscuro");
    if (!button) return;

    clearInterval(checkButton);
    const body = document.body;
    const icon = button.querySelector("i");

    // Aplicar tema guardado
    if (localStorage.getItem("theme") === "dark") {
      body.classList.add("dark-mode");
      icon.className = "bi bi-sun-fill";
    } else {
      icon.className = "bi bi-moon-fill";
    }

    // Cambiar tema al hacer click
    button.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        icon.className = "bi bi-sun-fill";
        localStorage.setItem("theme", "dark");
      } else {
        icon.className = "bi bi-moon-fill";
        localStorage.setItem("theme", "light");
      }
    });
  }, 50);
});

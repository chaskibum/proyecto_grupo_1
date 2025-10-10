const button = document.getElementById("oscuro");
const body = document.body;
const icon = document.getElementById("luna"); 

// Aplicar tema guardado al cargar la página
addEventListener("DOMContentLoaded", () => {


    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
        icon.className = "bi bi-sun-fill"; // mostrar sol
    } else {
        icon.className = "bi bi-moon-fill"; // mostrar luna
    }
});



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

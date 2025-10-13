if (!localStorage.getItem("sesionActiva")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // Definición de categorías
    const categories = [
        { id: 101, name: "Autos" },
        { id: 102, name: "Juguetes" },
        { id: 103, name: "Muebles" },
        { id: 104, name: "Herramientas" },
        { id: 105, name: "Computadoras" },
        { id: 106, name: "Vestimenta" },
        { id: 107, name: "Electrodomésticos" },
        { id: 108, name: "Deporte" },
        { id: 109, name: "Celulares" }
    ];

    // Función para asignar evento a un elemento
    function assignCategoryEvent(element, cat) {
        if (element) {
            element.addEventListener("click", function (e) {
                e.preventDefault();
                localStorage.setItem("catID", cat.id);
                localStorage.setItem("catName", cat.name);
                window.location = "products.html";
            });
        }
    }

    // Portada (cards)
    categories.forEach(cat => {
        const el = document.getElementById(cat.name.toLowerCase());
        assignCategoryEvent(el, cat);
    });

    // Navbar
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function (item) {
        const text = item.textContent.trim();
        const cat = categories.find(c => c.name === text);
        if (cat) assignCategoryEvent(item, cat);
    });
});
const button = document.getElementById("oscuro");
const body = document.body;

// Si el usuario ya había elegido un tema antes, recuérdalo
if (localStorage.getItem("theme") === "dark") {
body.classList.add("dark-mode");
}

button.addEventListener("click", () => {
body.classList.toggle("dark-mode");
// Guardar preferencia
if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
} else {
    localStorage.setItem("theme", "light");
}
});

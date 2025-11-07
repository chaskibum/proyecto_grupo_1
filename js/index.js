// Verificar que el usuario haya iniciado sesión
if (!localStorage.getItem("sesionActiva")) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    // Lista de categorías disponibles
    const categorias = [
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

    // Asignar evento click para navegar a productos de categoría
    function asignarEventoCategoria(elemento, categoria) {
        if (elemento) {
            elemento.addEventListener("click", function (evento) {
                evento.preventDefault();
                localStorage.setItem("catID", categoria.id);
                localStorage.setItem("catName", categoria.name);
                window.location = "products.html";
            });
        }
    }

    // Asignar eventos a elementos con ID de categoría
    categorias.forEach(categoria => {
        const elemento = document.getElementById(categoria.name.toLowerCase());
        asignarEventoCategoria(elemento, categoria);
    });

    // Asignar eventos a elementos del menú dropdown
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function (item) {
        const texto = item.textContent.trim();
        const categoria = categorias.find(c => c.name === texto);
        if (categoria) asignarEventoCategoria(item, categoria);
    });
});

const cuerpo = document.body;

// Aplicar tema oscuro si está configurado
if (localStorage.getItem("theme") === "dark") {
    cuerpo.classList.add("dark-mode");
}

// Inicializar carrusel de anuncios con rotación automática
function inicializarDeslizadorAnuncios(idDeslizador, intervalo = 3500) {
    const deslizador = document.getElementById(idDeslizador);
    if (!deslizador) return;
    const diapositivas = Array.from(deslizador.querySelectorAll('.ad-slide'));
    if (!diapositivas.length) return;
    let actual = 0;

    // Mostrar diapositiva en el índice especificado
    function mostrar(indice) {
        diapositivas.forEach((diapositiva, i) => diapositiva.classList.toggle('active', i === indice));
    }

    mostrar(actual);

    // Rotar diapositivas automáticamente
    const temporizador = setInterval(() => {
        actual = (actual + 1) % diapositivas.length;
        mostrar(actual);
    }, intervalo);

    // Detener carrusel cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearInterval(temporizador);
    });
}

// Inicializar todos los carruseles de anuncios
document.addEventListener('DOMContentLoaded', () => {
    inicializarDeslizadorAnuncios('adSliderLeft', 4100);
    inicializarDeslizadorAnuncios('adSliderTopRight', 3700);
    inicializarDeslizadorAnuncios('adSliderBottomRight', 3800);
});
if (!localStorage.getItem("sesionActiva")) {
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        localStorage.setItem("catName", "Autos");
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        localStorage.setItem("catName", "Juguetes");
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        localStorage.setItem("catName", "Muebles");
        window.location = "products.html"
    });
    document.getElementById("computadoras").addEventListener("click", function() {
        localStorage.setItem("catID", 104);
        localStorage.setItem("catName", "Computadoras");
        window.location = "products.html"
    });
    // Navbar categorías
    const navbarCategories = [
        { selector: 'Autos', id: 101, name: 'Autos' },
        { selector: 'Juguetes', id: 102, name: 'Juguetes' },
        { selector: 'Muebles', id: 103, name: 'Muebles' },
        { selector: 'Herramientas', id: 104, name: 'Herramientas' },
        { selector: 'Computadoras', id: 105, name: 'Computadoras' },
        { selector: 'Vestimenta', id: 106, name: 'Vestimenta' },
        { selector: 'Electrodomésticos', id: 107, name: 'Electrodomésticos' },
        { selector: 'Deporte', id: 108, name: 'Deporte' },
        { selector: 'Celulares', id: 109, name: 'Celulares' }
    ];

    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function(item) {
        const text = item.textContent.trim();
        const cat = navbarCategories.find(c => c.selector === text);
        if (cat) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.setItem('catID', cat.id);
                localStorage.setItem('catName', cat.name);
                window.location = 'products.html';
            });
        }
    });
});
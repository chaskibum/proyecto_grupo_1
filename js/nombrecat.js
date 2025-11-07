document.addEventListener('DOMContentLoaded', () => {
    // Mapeo de nombres de categorías a IDs
    const MAPA_IDS = {
        'Autos': '101',
        'Juguetes': '102',
        'Muebles': '103',
        'Herramientas': '105',
        'Computadoras': '106',
        'Vestimenta': '107',
        'Electrodomésticos': '108',
        'Deporte': '109',
        'Celulares': '110'
    };

    // Guardar ID y nombre de categoría al hacer click
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(enlace => {
        enlace.addEventListener('click', () => {
            const nombre = (enlace.dataset.catName || enlace.textContent).trim();
            const id = enlace.dataset.catId || MAPA_IDS[nombre];
            if (id) {
                localStorage.setItem('catID', id);
                localStorage.setItem('catName', nombre);
            }
        });
    });
});

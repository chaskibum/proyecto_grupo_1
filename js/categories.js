document.addEventListener('DOMContentLoaded', () => {
    const CATS_URL = 'https://japceibal.github.io/emercado-api/cats/cat.json';
    const lista = document.getElementById('cat-list') || document.getElementById('categories-list') || document.querySelector('.list-group');

    // Guardar categoría seleccionada y redirigir a productos
    function establecerCategoria(id, nombre) {
        localStorage.setItem('catID', String(id));
        localStorage.setItem('catName', String(nombre));
        window.location = 'products.html';
    }

    // Escapar caracteres especiales para atributos HTML
    function escaparAtributo(texto) {
        return String(texto).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Renderizar lista de categorías
    function renderizar(categorias = []) {
        const html = categorias.map(categoria => {
            const id = categoria.id;
            const nombre = categoria.name ?? '';
            const imagen = categoria.imgSrc ?? '';
            const descripcion = categoria.description ?? '';
            const cantidad = categoria.productCount ?? 0;

            return `
            <div class="list-group-item list-group-item-action cursor-active"
                 data-cat-id="${id}"
                 data-cat-name="${escaparAtributo(nombre)}">
              <div class="row">
                <div class="col-3">
                  <img src="${imagen}" alt="${escaparAtributo(descripcion)}" class="img-thumbnail">
                </div>
                <div class="col">
                  <div class="d-flex w-100 justify-content-between">
                    <h4 class="mb-1">${nombre}</h4>
                    <small class="text-muted">${cantidad} artículos</small>
                  </div>
                  <p class="mb-1">${descripcion}</p>
                </div>
              </div>
            </div>
            `;
        }).join('');

        if (lista) lista.innerHTML = html;
    }

    // Manejar click en categoría para navegar a productos
    if (lista) {
        lista.addEventListener('click', (evento) => {
            const elemento = evento.target.closest('[data-cat-id]');
            if (!elemento) return;
            const id = elemento.getAttribute('data-cat-id');
            let nombre = elemento.getAttribute('data-cat-name');
            if (!nombre || nombre === 'undefined') {
                const h4 = elemento.querySelector('h4');
                nombre = h4 ? h4.textContent.trim() : '';
            }
            establecerCategoria(id, nombre);
        });
    }

    // Cargar categorías desde la API
    fetch(CATS_URL)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
            return respuesta.json();
        })
        .then(datos => {
            const categorias = Array.isArray(datos) ? datos : (Array.isArray(datos?.categories) ? datos.categories : []);
            renderizar(categorias);
        })
        .catch(error => {
            if (lista) {
                lista.innerHTML = `
                <div class="alert alert-danger m-3">
                    No se pudieron cargar las categorías. ${error.message}
                </div>
                `;
            }
        });
});

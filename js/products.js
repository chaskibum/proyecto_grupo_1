document.addEventListener('DOMContentLoaded', function () {
  // Verificar que el usuario haya iniciado sesión
  if (!localStorage.getItem('sesionActiva')) {
    window.location.href = 'login.html';
    return;
  }

  // Obtener categoría seleccionada y construir URL de API
  const catID = localStorage.getItem('catID') || '101';
  const catName = localStorage.getItem('catName');
  const nameSpan = document.getElementById('catname');
  if (nameSpan) nameSpan.textContent = catName;
  const url = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;

  let datosProductos = [];
  let productosMostrados = [];

  // Renderizar tarjetas de productos en la página
  function renderizarProductos(productos) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    // Mostrar mensaje si no hay productos en la categoría
    if (productos.length === 0) {
      container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning">
          No hay productos para la categoría ${catID}.
        </div>
      </div>`;
      return;
    }

    // Generar tarjeta para cada producto
    productos.forEach(producto => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4';
      col.innerHTML = `
      <div class="card h-100 shadow-sm custom-card product-select" data-product-id="${producto.id}" title="${producto.description}">
        <img src="${producto.image}" class="card-img-top" alt="${producto.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-2">${producto.name}</h5>
          <p class="card-text mb-1"><b>${producto.currency} ${producto.cost}</b></p>
          <div class="mb-2">
            <span class="text-warning">${'★'.repeat(producto.soldCount > 80 ? 5 : producto.soldCount > 50 ? 4 : producto.soldCount > 30 ? 3 : producto.soldCount > 15 ? 2 : 1)}</span>
            <span class="text-muted">${producto.soldCount} vendidos</span>
          </div>
          <button class="btn btn-dark mt-auto"><i class="fa fa-plus"></i></button>
        </div>
      </div>`;
      
      // Redirigir al hacer clic en el producto
      col.querySelector('.product-select').addEventListener('click', function () {
        window.location.href = `product-info.html?id=${producto.id}`;
      });
      container.appendChild(col);
    });

    // Tooltip para dispositivos móviles
    if (window.innerWidth < 1000) {
      const cards = container.querySelectorAll('.custom-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          const tooltip = document.createElement('span');
          tooltip.className = 'tooltip-cel';
          tooltip.innerText = card.getAttribute('title');
          card.appendChild(tooltip);
          setTimeout(() => tooltip.remove(), 4000);
        });
      });
    }
  }

  // Cargar productos desde la API
  fetch(url)
    .then(res => {
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} en ${url}`);
        err.status = res.status;
        throw err;
      }
      return res.json();
    })
    .then(data => {
      datosProductos = Array.isArray(data?.products) ? data.products : [];
      productosMostrados = [...datosProductos];
      renderizarProductos(productosMostrados);

      if (catName) {
        const catnameSpan = document.getElementById('catname');
        if (catnameSpan) catnameSpan.textContent = catName;
      }
    })
    .catch(err => {
      const container = document.getElementById('products-container');
      container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-danger">
        No se pudo cargar la categoría ${localStorage.getItem('catID')}. ${err.message}
      </div>
    </div>`;
    });

  // Referencias a botones de ordenamiento y filtros
  const botonValorado = document.querySelector('.orden .valorado');
  const botonAscendente = document.querySelector('.orden .orden-ascendente');
  const botonDescendente = document.querySelector('.orden .orden-descendente');
  const botonRelevancia = document.querySelector('.orden .rel');

  const inputMinimo = document.getElementById('precio-min');
  const inputMaximo = document.getElementById('precio-max');

  const botonFiltrar = document.getElementById('filtro');
  const botonLimpiar = document.getElementById('limpiar');

  // Ordenar por mejor valoración (más vendidos)
  botonValorado.addEventListener('click', () => {
    productosMostrados = [...productosMostrados].sort((a, b) => {
      const estrellasA = a.soldCount > 80 ? 5 : a.soldCount > 50 ? 4 : a.soldCount > 30 ? 3 : a.soldCount > 15 ? 2 : 1;
      const estrellasB = b.soldCount > 80 ? 5 : b.soldCount > 50 ? 4 : b.soldCount > 30 ? 3 : b.soldCount > 15 ? 2 : 1;
      return estrellasB - estrellasA;
    });
    renderizarProductos(productosMostrados);
  });

  // Ordenar por precio ascendente (menor a mayor)
  botonAscendente.addEventListener('click', () => {
    productosMostrados = [...productosMostrados].sort((a, b) => Number(a.cost) - Number(b.cost));
    renderizarProductos(productosMostrados);
  });

  // Ordenar por precio descendente (mayor a menor)
  botonDescendente.addEventListener('click', () => {
    productosMostrados = [...productosMostrados].sort((a, b) => Number(b.cost) - Number(a.cost));
    renderizarProductos(productosMostrados);
  });

  // Ordenar por relevancia (más vendidos primero)
  botonRelevancia.addEventListener('click', () => {
    productosMostrados = [...productosMostrados].sort((a, b) => Number(b.soldCount) - Number(a.soldCount));
    renderizarProductos(productosMostrados);
  });

  // Filtrar productos por rango de precio
  botonFiltrar.addEventListener('click', () => {
    const valorMinimo = inputMinimo?.value ?? '';
    const valorMaximo = inputMaximo?.value ?? '';

    const minimo = valorMinimo === '' ? 0 : parseFloat(valorMinimo);
    const maximo = valorMaximo === '' ? Infinity : parseFloat(valorMaximo);
    const precioMinimo = Number.isFinite(minimo) ? minimo : 0;
    const precioMaximo = Number.isFinite(maximo) ? maximo : Infinity;
    
    productosMostrados = datosProductos.filter(producto => {
      const precio = Number(producto.cost);
      return precio >= precioMinimo && precio <= precioMaximo;
    });
    renderizarProductos(productosMostrados);
  });

  // Limpiar filtros y mostrar todos los productos
  if (botonLimpiar) {
    botonLimpiar.addEventListener('click', (e) => {
      e.preventDefault();
      if (inputMinimo) inputMinimo.value = '';
      if (inputMaximo) inputMaximo.value = '';
      productosMostrados = [...datosProductos];
      renderizarProductos(productosMostrados);
    });
  }

  fetch("navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar").innerHTML = html;

      const usuario = localStorage.getItem('usuarioActivo');
      const enlaceInicio = document.getElementById('inicio-sesion');
      if (usuario && enlaceInicio) {
        enlaceInicio.textContent = usuario;
        enlaceInicio.href = 'my-profile.html';
      }
    });

  const buscador = document.getElementById('buscador');
  if (buscador) {
    buscador.addEventListener('input', e => {
      const texto = e.target.value.toLowerCase();
      productosMostrados = datosProductos.filter(producto =>
        (producto.name || '').toLowerCase().includes(texto) ||
        (producto.description || '').toLowerCase().includes(texto)
      );
      renderizarProductos(productosMostrados);
    });
  }

  const categoriasMap = {
    'Autos': '101', 'Juguetes': '102', 'Muebles': '103', 'Herramientas': '104',
    'Computadoras': '105', 'Vestimenta': '106', 'Electrodomésticos': '107',
    'Deporte': '108', 'Celulares': '109'
  };
  document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(enlace => {
    enlace.addEventListener('click', function (e) {
      e.preventDefault();
      const nombre = (enlace.dataset.catName || enlace.textContent).trim();
      const id = categoriasMap[nombre];
      if (id) {
        localStorage.setItem('catID', id);
        localStorage.setItem('catName', nombre);
        window.location.reload();
      }
    });
  });
});

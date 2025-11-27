document.addEventListener('DOMContentLoaded', function () {
  if (!localStorage.getItem('sesionActiva') && !localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  const catID = localStorage.getItem('catID') || '101';
  const catName = localStorage.getItem('catName');
  const nameSpan = document.getElementById('catname');
  if (nameSpan) nameSpan.textContent = catName;
  const url = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;

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
      const products = Array.isArray(data?.products) ? data.products : [];
      const container = document.getElementById('products-container');
      container.innerHTML = '';
      let productsData = [];
      let verData = [];

      function renderProducts(products) {
        const container = document.getElementById('products-container');
        container.innerHTML = '';

        if (products.length === 0) {
          container.innerHTML = `
          <div class="col-12">
            <div class="alert alert-warning">
              No hay productos para la categoría ${catID}.
            </div>
          </div>`;
          return;
        }


        products.forEach(product => {
          const col = document.createElement('div');
          col.className = 'col-12 col-sm-6 col-md-4';
          col.innerHTML = `
          <div class="card h-100 shadow-sm custom-card product-select" data-product-id="${product.id}" title="${product.description}">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-2">${product.name}</h5>
              <p class="card-text mb-1"><b>${product.currency} ${product.cost}</b></p>
              <div class="mb-2">
                <span class="text-warning">${'★'.repeat(product.soldCount > 80 ? 5 : product.soldCount > 50 ? 4 : product.soldCount > 30 ? 3 : product.soldCount > 15 ? 2 : 1)}</span>

                <span class="text-muted">${product.soldCount} vendidos</span>
              </div>
              <button class="btn btn-dark mt-auto"><i class="fa fa-plus"></i></button>
            </div>
          </div>`;
          col.querySelector('.product-select').addEventListener('click', function () {
            window.location.href = `product-info.html?id=${product.id}`;
          });
          container.appendChild(col);
        });

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
          productsData = Array.isArray(data?.products) ? data.products : [];
          verData = [...productsData];
          renderProducts(verData);


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
          console.error(err);
        });

      const buttonValorado = document.querySelector('.orden .valorado');
      const buttonAsc = document.querySelector('.orden .orden-ascendente');
      const buttonDes = document.querySelector('.orden .orden-descendente');
      const buttonRel = document.querySelector('.orden .rel');


      const inputMin = document.getElementById('precio-min');
      const inputMax = document.getElementById('precio-max');

      const buttonFiltrar = document.getElementById('filtro');
      const buttonLimpiar = document.getElementById('limpiar');

      buttonValorado.addEventListener('click', () => {
    verData = [...verData].sort((a, b) => {
      const estrellasA = a.soldCount > 80 ? 5 : a.soldCount > 50 ? 4 : a.soldCount > 30 ? 3 : a.soldCount > 15 ? 2 : 1;
      const estrellasB = b.soldCount > 80 ? 5 : b.soldCount > 50 ? 4 : b.soldCount > 30 ? 3 : b.soldCount > 15 ? 2 : 1;
      return estrellasB - estrellasA;
    });
     renderProducts(verData);
  });

      buttonAsc.addEventListener('click', () => {
    verData = [...verData].sort((a, b) => Number(a.cost) - Number(b.cost));
    renderProducts(verData);
  });

      buttonDes.addEventListener('click', () => {
    verData = [...verData].sort((a, b) => Number(b.cost) - Number(a.cost));
    renderProducts(verData);
  });

      buttonRel.addEventListener('click', () => {
    verData = [...verData].sort((a, b) => Number(b.soldCount) - Number(a.soldCount));
    renderProducts(verData);
  });


      buttonFiltrar.addEventListener('click', () => {
    const rawMin = inputMin?.value ?? '';
    const rawMax = inputMax?.value ?? '';

    const min = rawMin === '' ? 0 : parseFloat(rawMin);
    const max = rawMax === '' ? Infinity : parseFloat(rawMax);
    const xmin = Number.isFinite(min) ? min : 0;
    const xmax = Number.isFinite(max) ? max : Infinity;
    verData = productsData.filter(p => {
       const precio = Number(p.cost);
      return precio >= xmin && precio <= xmax;
     });
     renderProducts(verData);
  });

      if (buttonLimpiar) {
        buttonLimpiar.addEventListener('click', (e) => {
          e.preventDefault();
          if (inputMin) inputMin.value = '';
          if (inputMax) inputMax.value = '';
          verData = [...productsData];
          renderProducts(verData);
        });
      }

      fetch("navbar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar").innerHTML = html;

    const usuario = localStorage.getItem('usuarioActivo');
    const link = document.getElementById('inicio-sesion');
    if (usuario && link) {
      link.textContent = usuario;
      link.href = 'my-profile.html';
    }

  });

const buscador = document.getElementById('buscador');
if (buscador) {
  buscador.addEventListener('input', e => {
    const texto = e.target.value.toLowerCase();
    verData = productsData.filter(p =>
      (p.name || '').toLowerCase().includes(texto) ||
      (p.description || '').toLowerCase().includes(texto)
    );
    renderProducts(verData);
  });
}

          const localS = {
            'Autos': '101', 'Juguetes': '102', 'Muebles': '103', 'Herramientas': '104',
            'Computadoras': '105', 'Vestimenta': '106', 'Electrodomésticos': '107',
            'Deporte': '108', 'Celulares': '109'
          };
          document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(a => {
            a.addEventListener('click', function (e) {
              e.preventDefault();
              const name = (a.dataset.catName || a.textContent).trim();
              const id = localS[name];
              if (id) {
                localStorage.setItem('catID', id);
                localStorage.setItem('catName', name);
                window.location.reload();
              }
            });
          });
        });
    });

document.addEventListener('DOMContentLoaded', function() {
  if (!localStorage.getItem('sesionActiva')) {
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
          <div class="card h-100 shadow-sm custom-card" title="${product.description}">
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title mb-2">${product.name}</h5>
              <p class="card-text mb-1"><b>${product.currency} ${product.cost}</b></p>
              <div class="mb-2">
                <span class="text-warning">${'★'.repeat(product.soldCount > 200 ? 5 : product.soldCount > 100 ? 4 : 3)}</span>
                <span class="text-muted">${product.soldCount} vendidos</span>
              </div>
              <button class="btn btn-dark mt-auto"><i class="fa fa-plus"></i></button>
            </div>
          </div>`;
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
});

 

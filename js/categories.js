document.addEventListener('DOMContentLoaded', () => {
  const CATS_URL = 'https://japceibal.github.io/emercado-api/cats/cat.json';
  const list = document.getElementById('cat-list') || document.getElementById('categories-list') || document.querySelector('.list-group');

  function setCat(id, name) {
    console.log('Guardando catID:', id, 'catName:', name);
    localStorage.setItem('catID', String(id));
    localStorage.setItem('catName', String(name));
    window.location = 'products.html';
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function render(categories = []) {
    const html = categories.map(category => {
      const id = category.id;
      const name = category.name ?? '';
      const img = category.imgSrc ?? '';
      const desc = category.description ?? '';
      const count = category.productCount ?? 0;

      return `
        <div class="list-group-item list-group-item-action cursor-active"
             data-cat-id="${id}"
             data-cat-name="${escapeAttr(name)}">
          <div class="row">
            <div class="col-3">
              <img src="${img}" alt="${escapeAttr(desc)}" class="img-thumbnail">
            </div>
            <div class="col">
              <div class="d-flex w-100 justify-content-between">
                <h4 class="mb-1">${name}</h4>
                <small class="text-muted">${count} artículos</small>
              </div>
              <p class="mb-1">${desc}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (list) list.innerHTML = html;
  }

  if (list) {
    list.addEventListener('click', (e) => {
      const item = e.target.closest('[data-cat-id]');
      if (!item) return;
      const id = item.getAttribute('data-cat-id');
      let name = item.getAttribute('data-cat-name');
      if (!name || name === 'undefined') {
        const h4 = item.querySelector('h4');
        name = h4 ? h4.textContent.trim() : '';
      }
      setCat(id, name);
    });
  }

  fetch(CATS_URL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      const categories = Array.isArray(data) ? data : (Array.isArray(data?.categories) ? data.categories : []);
      render(categories);
    })
    .catch(err => {
      if (list) {
        list.innerHTML = `
          <div class="alert alert-danger m-3">
            No se pudieron cargar las categorías. ${err.message}
          </div>
        `;
      }
      console.error(err);
    });
});

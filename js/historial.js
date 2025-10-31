document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('historial-container');
  const noMsg = document.getElementById('no-purchases');

  function loadPurchases() {
    try {
      const raw = localStorage.getItem('purchases');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parseando purchases:', e);
      return [];
    }
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (e) { return iso; }
  }

  function render() {
    const purchases = loadPurchases();
    if (!container) return;
    container.innerHTML = '';

    if (!purchases || purchases.length === 0) {
      if (noMsg) noMsg.textContent = 'No has realizado compras aún.';
      return;
    }

    // Agrupar por purchasedAt
    const groups = {};
    purchases.forEach(item => {
      const key = item.purchasedAt || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    // Ordenar por fecha descendente
    const keys = Object.keys(groups).sort((a,b) => new Date(b) - new Date(a));

    keys.forEach(key => {
      const items = groups[key];
      // calcular total del pedido
      const total = items.reduce((s,it) => s + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
      const currency = (items[0] && items[0].currency) ? (items[0].currency + ' ') : '';

      const card = document.createElement('div');
      card.className = 'card mb-3 purchase-card';
      const body = document.createElement('div');
      body.className = 'card-body';

      body.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>Compra</strong>
            <div class="text-muted small">${formatDate(key)}</div>
          </div>
          <div class="fw-bold">${currency}${new Intl.NumberFormat('es-AR').format(total)}</div>
        </div>
      `;

      const list = document.createElement('div');
      list.className = 'list-group list-group-flush';

      items.forEach(it => {
        const row = document.createElement('div');
        row.className = 'list-group-item d-flex align-items-center';
        const name = it.name || 'Artículo';
        const qty = Number(it.count || 1);
        const unit = (it.currency ? it.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(it.unitCost || 0);
        const sub = (it.currency ? it.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format((Number(it.unitCost || 0) * qty));

        row.innerHTML = `
          <img src="${it.image || 'https://via.placeholder.com/80'}" alt="" class="me-3 purchase-img">
          <div class="flex-grow-1">
            <div class="fw-bold">${name}</div>
            <div class="text-muted small">${unit} x ${qty}</div>
          </div>
          <div class="fw-bold text-end ms-3">${sub}</div>
        `;

        list.appendChild(row);
      });

      body.appendChild(list);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  render();

  window.addEventListener('storage', function (e) {
    if (e.key === 'purchases' || e.key === 'cart') render();
  });
});

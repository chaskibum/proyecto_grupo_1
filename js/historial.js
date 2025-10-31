document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('historial-container');
  const noMsg = document.getElementById('no-purchases');

  function loadPurchases() {
    try {
      // Intentar leer clave por usuario primero (purchases_<usuario>), si no existe caer
      const usuario = localStorage.getItem('usuarioActivo');
      let raw = null;
      if (usuario) raw = localStorage.getItem(`purchases_${usuario}`);
      if (!raw) raw = localStorage.getItem('purchases');
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
      const displayDate = (key === 'unknown') ? 'Fecha desconocida' : formatDate(key);
      const items = groups[key];
  // calcular subtotal del pedido
  const subtotal = items.reduce((s,it) => s + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
  // calcular descuento acumulado (cada item puede llevar orderDiscountPercent)
  const totalDescuento = items.reduce((s,it) => s + ((Number(it.unitCost || 0) * Number(it.count || 0)) * (Number(it.orderDiscountPercent || 0) / 100)), 0);
  const finalTotal = subtotal - totalDescuento;
  const currency = (items[0] && items[0].currency) ? (items[0].currency + ' ') : '';

      const card = document.createElement('div');
      card.className = 'card mb-3 purchase-card';
      const body = document.createElement('div');
      body.className = 'card-body';

      body.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>Compra</strong>
            <div class="text-muted small">${displayDate}</div>
          </div>
          <div class="fw-bold">${currency}${new Intl.NumberFormat('es-AR').format(finalTotal)}</div>
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

      // Mostrar fila de descuento si corresponde
      if (totalDescuento > 0) {
        // Determinar si todos los items comparten el mismo porcentaje/razón
        const percentSet = new Set(items.map(i => Number(i.orderDiscountPercent || 0)));
        const reasonSet = new Set(items.map(i => i.orderDiscountReason || ''));
        const uniformPercent = percentSet.size === 1 ? Array.from(percentSet)[0] : null;
        const uniformReason = reasonSet.size === 1 ? Array.from(reasonSet)[0] : null;

        const discountRow = document.createElement('div');
        discountRow.className = 'd-flex justify-content-between align-items-center mt-2 small text-muted';
        const left = document.createElement('div');
        left.innerHTML = `<div>Descuento${uniformReason ? '' : ' (varios)'}</div>${uniformReason ? `<div class="text-muted small">${uniformReason}</div>` : ''}`;
        const right = document.createElement('div');
        const formattedDesc = new Intl.NumberFormat('es-AR').format(Math.round(totalDescuento));
        right.innerHTML = `- ${currency}${formattedDesc}${uniformPercent ? ` (${uniformPercent}%)` : ''}`;
        discountRow.appendChild(left);
        discountRow.appendChild(right);
        body.appendChild(discountRow);
      }

      // Mostrar subtotal / final total en pie si no mostrado ya (finalTotal mostrado at top)
      const footer = document.createElement('div');
      footer.className = 'd-flex justify-content-between align-items-center mt-3';
      footer.innerHTML = `<div class="text-muted small">Subtotal</div><div class="fw-bold">${currency}${new Intl.NumberFormat('es-AR').format(subtotal)}</div>`;
      body.appendChild(footer);

      body.appendChild(list);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  render();

  window.addEventListener('storage', function (e) {
    if (!e.key) return;
    if (e.key === 'purchases' || e.key === 'cart' || e.key.startsWith('purchases_') || e.key.startsWith('cart_')) render();
  });
});

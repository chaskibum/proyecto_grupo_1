document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('historial-container');
  const noMsg = document.getElementById('no-purchases');

  function loadPurchases() {
    try {
      const usuario = localStorage.getItem('usuarioActivo');
      let raw = null;
      if (usuario) raw = localStorage.getItem(`purchases_${usuario}`);
      if (!raw) raw = localStorage.getItem('purchases');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parseando compras:', e);
      return [];
    }
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch (e) {
      return iso;
    }
  }

  function formatMoney(value, currencyPrefix) {
    const num = Number(value);
    const safe = Number.isFinite(num) ? num : 0;
    return `${currencyPrefix}${new Intl.NumberFormat('es-AR').format(safe)}`;
  }

  function parseNumberLike(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
    if (typeof value === 'string') {
      const cleaned = value.trim();
      if (!cleaned) return NaN;
      let normalized = cleaned.replace(/[^0-9,.\-]/g, '');
      if (normalized.includes(',') && normalized.includes('.')) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else if (normalized.includes(',')) {
        normalized = normalized.replace(',', '.');
      } else if (normalized.includes('.')) {
        const parts = normalized.split('.');
        if (parts.length > 1 && parts[parts.length - 1].length === 3) {
          normalized = parts.join('');
        }
      }
      const num = Number(normalized);
      return Number.isFinite(num) ? num : NaN;
    }
    return NaN;
  }

  function pickAmount(source, keys, fallback) {
    for (const key of keys) {
      if (!source) continue;
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const num = parseNumberLike(source[key]);
        if (Number.isFinite(num)) return num;
      }
    }
    return fallback;
  }

  function loadPurchaseMeta(key) {
    if (!key || key === 'unknown') return null;
    try {
      const raw = localStorage.getItem(`purchase_meta_${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function render() {
    const purchases = loadPurchases();
    if (!container) return;
    container.innerHTML = '';

    if (!purchases || purchases.length === 0) {
      if (noMsg) noMsg.textContent = 'No has realizado compras aun.';
      return;
    }

    const groups = {};
    purchases.forEach(item => {
      const key = item.purchasedAt || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    const keys = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

    keys.forEach(key => {
      const displayDate = key === 'unknown' ? 'Fecha desconocida' : formatDate(key);
      const items = groups[key];
      const sample = items[0] || {};
      const storedMeta = loadPurchaseMeta(key);
      const combined = Object.assign({}, sample, storedMeta || {});

      const baseSubtotal = items.reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
      const orderSubtotal = pickAmount(combined, ['orderSubtotal', 'subtotal', 'subTotal', 'subtotalProductos'], baseSubtotal) || baseSubtotal;

      const discountFallback = items.reduce((sum, it) => sum + ((Number(it.unitCost || 0) * Number(it.count || 0)) * (Number(it.orderDiscountPercent || 0) / 100)), 0);
      const discountAmountRaw = pickAmount(combined, ['orderDiscountAmount', 'discountAmount', 'discount', 'descuento', 'orderDiscount'], null);
      const discountAmount = Number.isFinite(discountAmountRaw) ? discountAmountRaw : discountFallback;
      const discountPercentRaw = pickAmount(combined, ['orderDiscountPercent', 'discountPercent', 'porcentajeDescuento'], null);
      const discountPercent = Number.isFinite(discountPercentRaw)
        ? discountPercentRaw
        : (orderSubtotal ? Math.round((discountAmount / orderSubtotal) * 10000) / 100 : 0);
      const discountReason = combined.orderDiscountReason || combined.discountReason || combined.motivoDescuento || '';

      const shippingCostRaw = pickAmount(combined, ['orderShippingCost', 'shippingCost', 'envioCost', 'envio', 'shipping'], null);
      let shippingCost = Number.isFinite(shippingCostRaw) ? shippingCostRaw : null;
      const shippingPercentRaw = pickAmount(combined, ['orderShippingPercent', 'shippingPercent', 'envioPercent', 'porcentajeEnvio'], null);
      let shippingPercent = Number.isFinite(shippingPercentRaw) ? shippingPercentRaw : null;
      const shippingLabel = combined.orderShippingLabel || combined.shippingLabel || combined.envioLabel || combined.tipoEnvio || combined.selectedShipping || '';

      const storedTotalRaw = pickAmount(combined, ['orderTotal', 'total', 'totalPagado'], null);
      let orderTotal = Number.isFinite(storedTotalRaw) ? storedTotalRaw : null;

      if (shippingCost !== null && orderTotal === null) {
        orderTotal = orderSubtotal + shippingCost - discountAmount;
      }
      if ((shippingCost === null || !Number.isFinite(shippingCost)) && Number.isFinite(orderTotal)) {
        const derived = orderTotal - orderSubtotal + discountAmount;
        if (Number.isFinite(derived)) shippingCost = derived;
      }

      const hasShippingData = Number.isFinite(shippingCost);
      const shippingForMath = hasShippingData ? shippingCost : 0;
      if (!Number.isFinite(orderTotal)) {
        orderTotal = orderSubtotal + shippingForMath - discountAmount;
      }
      if (!Number.isFinite(orderTotal)) {
        orderTotal = orderSubtotal - discountAmount;
      }

      if (!Number.isFinite(shippingPercent)) {
        shippingPercent = orderSubtotal ? Math.round((shippingForMath / orderSubtotal) * 10000) / 100 : 0;
      }

      const currencyCode = combined.orderCurrency || combined.currency || (items[0] && items[0].currency) || '';
      const currencyPrefix = currencyCode ? `${currencyCode} ` : '';

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
          <div class="fw-bold">${formatMoney(orderTotal, currencyPrefix)}</div>
        </div>
      `;

      const list = document.createElement('div');
      list.className = 'list-group list-group-flush';

      items.forEach(it => {
        const row = document.createElement('div');
        row.className = 'list-group-item d-flex align-items-center';
        const name = it.name || 'Articulo';
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

      const summary = document.createElement('div');
      summary.className = 'purchase-summary border-top pt-3 mt-3';
      const shippingLabelTxt = shippingLabel
        ? ` (${shippingLabel})`
        : (shippingPercent ? ` (${shippingPercent}%)` : '');
      const discountLabelTxt = discountPercent ? ` (${discountPercent}%)` : '';
      const shippingValueTxt = hasShippingData && Number.isFinite(shippingCost)
        ? formatMoney(shippingCost, currencyPrefix)
        : 'No registrado';
      const discountReasonTxt = discountReason ? ` - ${discountReason}` : '';

      summary.innerHTML = `
        <div class="d-flex justify-content-between text-muted small">
          <span>Subtotal productos</span>
          <span>${formatMoney(orderSubtotal, currencyPrefix)}</span>
        </div>
        <div class="d-flex justify-content-between text-muted small">
          <span>Envio${shippingLabelTxt}</span>
          <span>${shippingValueTxt}</span>
        </div>
        <div class="d-flex justify-content-between text-muted small">
          <span>Descuento${discountLabelTxt}${discountReasonTxt}</span>
          <span class="text-success">- ${formatMoney(discountAmount, currencyPrefix)}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold mt-2">
          <span>Total pagado</span>
          <span>${formatMoney(orderTotal, currencyPrefix)}</span>
        </div>
      `;

      body.appendChild(summary);
      card.appendChild(body);
      container.appendChild(card);
    });
  }

  render();

  window.addEventListener('storage', function (e) {
    if (!e.key) return;
    if (e.key === 'purchases' || e.key === 'cart' || e.key.startsWith('purchases_') || e.key.startsWith('cart_')) {
      render();
    }
  });
});

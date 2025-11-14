// ================================
// cart.js - Gestión del carrito
// Descripción: funciones para cargar/guardar el carrito en localStorage,
// renderizar la UI del carrito, calcular totales (subtotal, envío, descuento)
// y procesamiento básico del checkout (validaciones y creación de compras).
// Todos los comentarios y mensajes de usuario están en español.
// ================================

// Calcula un descuento basado en la fecha de nacimiento almacenada en
// `perfilUsuario` en localStorage. Devuelve un número entre 0 y 1.
function obtenerDescuentoNacimiento() {
  try {
    const rawPerfil = localStorage.getItem('perfilUsuario');
    if (!rawPerfil) return 0;
    const perfil = JSON.parse(rawPerfil);
    if (!perfil || !perfil.birthdate) return 0;
    const b = new Date(perfil.birthdate);
    if (isNaN(b.getTime())) return 0;
    const today = new Date();
    if (b.getDate() === today.getDate() && b.getMonth() === today.getMonth()) {
      return 0.1; // 10% cumpleanos
    }
    return (b.getMonth() + 1) / 100; // porcentaje por mes
  } catch (e) {
    return 0;
  }
}

// Carga datos guardados de tarjeta y dirección desde localStorage.
// Devuelve un objeto normalizado con las propiedades `tarjeta` y `direccion`.
function loadSavedCheckoutData() {
  const defaults = {
    tarjeta: { enabled: false, nombre: '', numero: '', vencimiento: '', cvv: '' },
    direccion: { enabled: false, departamento: '', localidad: '', calle: '', numero: '', esquina: '' }
  };
  try {
    const raw = localStorage.getItem('tarjetasDirecciones');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const normalized = {
      tarjeta: Object.assign({}, defaults.tarjeta, parsed.tarjeta && typeof parsed.tarjeta === 'object' ? parsed.tarjeta : {}),
      direccion: Object.assign({}, defaults.direccion, parsed.direccion && typeof parsed.direccion === 'object' ? parsed.direccion : {})
    };
    if (typeof parsed.tarjeta === 'string' && !normalized.tarjeta.numero) {
      normalized.tarjeta.numero = parsed.tarjeta;
      normalized.tarjeta.enabled = true;
    }
    if (typeof parsed.direccion === 'string' && !normalized.direccion.calle) {
      normalized.direccion.calle = parsed.direccion;
      normalized.direccion.enabled = true;
    }
    return normalized;
  } catch (e) {
    console.warn('No se pudo leer tarjetasDirecciones:', e);
    return null;
  }
}

// Inicialización principal al cargar el DOM: configura referencias a elementos
// del DOM, toggles para usar datos guardados y renderiza el carrito.
document.addEventListener('DOMContentLoaded', function () {
  const CLAVE_ALMACENAMIENTO = 'cart';
  const contenedorItems = document.getElementById('cart-items');
  const mensajeVacio = document.getElementById('cart-empty');
  const tarjetaTotal = document.getElementById('cart-total-card');
  const elementoTotal = document.getElementById('cart-total');
  const botonFinalizar = document.getElementById('checkout-btn');

  // Secciones adicionales
  const envioCard = document.querySelector('.card.mb-3'); // Tipo de envío
  const direccionCard = document.querySelectorAll('.card.mb-3')[1]; // Dirección
  const pagoCard = document.getElementById('card-forma-de-pago');

  // Elementos de resumen
  const elementoSubtotal = document.getElementById('cart-subtotal-all');
  const filaDescuento = document.getElementById('cart-discount-row');
  const montoDescuentoEl = document.getElementById('cart-discount-amount');
  const filaEnvio = document.getElementById('cart-shipping-row'); // fila de envío
  const elementoEnvio = document.getElementById('cart-shipping-amount');

  // Radios de envío
  const radiosEnvio = document.querySelectorAll('input[name="tipoEnvio"]');
  const savedProfileData = loadSavedCheckoutData();

  // Comprueba si una dirección guardada está completa (todos los campos requeridos)
  function direccionCompleta(dir) {
    if (!dir || !dir.enabled) return false;
    return ['departamento', 'localidad', 'calle', 'numero', 'esquina'].every(key => dir[key] && String(dir[key]).trim());
  }

  // Comprueba si una tarjeta guardada tiene todos los campos necesarios
  function tarjetaCompleta(card) {
    if (!card || !card.enabled) return false;
    return ['nombre', 'numero', 'vencimiento', 'cvv'].every(key => card[key] && String(card[key]).trim());
  }

  // Rellena inputs del formulario de envío con los valores de la dirección
  // guardada (si existen).
  function aplicarDireccionGuardada(dir) {
    const map = {
      departamento: 'departamento',
      localidad: 'localidad',
      calle: 'calle',
      numero: 'numero',
      esquina: 'esquina'
    };
    Object.keys(map).forEach(key => {
      const el = document.getElementById(map[key]);
      if (el && typeof dir[key] !== 'undefined') {
        el.value = dir[key] || '';
      }
    });
  }

  // Rellena inputs del formulario de pago con los valores de la tarjeta
  // guardada (si existen).
  function aplicarTarjetaGuardada(card) {
    const fields = {
      nombre: document.getElementById('nombreTarjeta'),
      numero: document.getElementById('numeroTarjeta'),
      vencimiento: document.getElementById('vencimiento'),
      cvv: document.getElementById('cvv')
    };
    Object.keys(fields).forEach(key => {
      if (fields[key]) fields[key].value = card[key] || '';
    });
  }

  // Devuelve una cadena corta que resume la dirección (calle, localidad, departamento)
  function resumenDireccionGuardada(dir) {
    if (!dir) return '';
    const parts = [dir.calle && `${dir.calle} ${dir.numero || ''}`.trim(), dir.localidad, dir.departamento].filter(Boolean);
    return parts.join(', ');
  }

  // Devuelve la tarjeta enmascarada (****1234) para mostrar en la UI
  function resumenTarjetaGuardada(card) {
    if (!card || !card.numero) return '';
    const clean = card.numero.replace(/[^0-9]/g, '');
    if (clean.length <= 4) return clean;
    return `****${clean.slice(-4)}`;
  }

  // Añade al DOM un switch para permitir al usuario usar la dirección guardada
  // y rellena los campos si marca la opción.
  function agregarToggleDireccionGuardada() {
    if (!direccionCard || !savedProfileData || !direccionCompleta(savedProfileData.direccion)) return;
    const body = direccionCard.querySelector('.card-body');
    if (!body) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'form-check form-switch mb-3';
    const resumen = resumenDireccionGuardada(savedProfileData.direccion);
    wrapper.innerHTML = `
      <input class="form-check-input" type="checkbox" id="usarDireccionGuardada">
      <label class="form-check-label" for="usarDireccionGuardada">Usar direccion guardada${resumen ? ` (${resumen})` : ''}</label>
    `;
    body.prepend(wrapper);
    const checkbox = wrapper.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) aplicarDireccionGuardada(savedProfileData.direccion);
    });
  }

  // Añade al DOM un switch para permitir al usuario usar la tarjeta guardada
  // y selecciona la opción de pago correspondiente.
  function agregarToggleTarjetaGuardada() {
    if (!pagoCard || !savedProfileData || !tarjetaCompleta(savedProfileData.tarjeta)) return;
    const body = pagoCard.querySelector('.card-body');
    if (!body) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'form-check form-switch mb-3';
    const masked = resumenTarjetaGuardada(savedProfileData.tarjeta);
    wrapper.innerHTML = `
      <input class="form-check-input" type="checkbox" id="usarTarjetaGuardada">
      <label class="form-check-label" for="usarTarjetaGuardada">Usar tarjeta guardada${masked ? ` (${masked})` : ''}</label>
    `;
    body.prepend(wrapper);
    const checkbox = wrapper.querySelector('input');
    checkbox.addEventListener('change', () => {
      if (!checkbox.checked) return;
      const radio = document.getElementById('pagoTarjeta');
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
      aplicarTarjetaGuardada(savedProfileData.tarjeta);
    });
  }

  agregarToggleDireccionGuardada();
  agregarToggleTarjetaGuardada();

  // Cargar carrito desde localStorage
  // Devuelve un array de items o [] en caso de error/ausencia.
  function cargarCarrito() {
    try {
      const raw = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parseando carrito desde localStorage:', e);
      return [];
    }
  }

  // Guarda el carrito en localStorage y emite un evento `cart:updated`
  // con el total de ítems para actualizar visualizaciones externas.
  function guardarCarrito(cart) {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(cart));
    const totalItems = Array.isArray(cart) ? cart.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total: totalItems } }));
  }

  // Calcula el subtotal de los productos seleccionados en el carrito.
  function calcularSubtotal(cart) {
    return cart
      .filter(it => it && it.selected !== false)
      .reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
  }

  // Lee el radio seleccionado de tipo de envío y devuelve su valor numérico
  // (porcentaje usado para calcular costo de envío).
  function obtenerPorcentajeEnvio() {
    const seleccionado = document.querySelector('input[name="tipoEnvio"]:checked');
    return seleccionado ? Number(seleccionado.value) : 0;
  }

  // Calcula el costo de envío aplicando el porcentaje al subtotal.
  function calcularEnvio(subtotal) {
    const porcentaje = obtenerPorcentajeEnvio();
    return subtotal * porcentaje;
  }

  // Suma subtotal + envio - descuento para obtener el total final.
  function calcularTotal(subtotal, envio, descuento) {
    return subtotal + envio - descuento;
  }

  // Renderiza la lista de items del carrito en la UI, y gestiona visibilidad
  // de secciones (envío, dirección, pago) según si hay items.
  function renderizarCarrito() {
    const cart = cargarCarrito();
    contenedorItems.innerHTML = '';

    if (!cart || cart.length === 0) {
      mensajeVacio.style.display = 'block';
      tarjetaTotal.style.display = 'none';
      if (filaDescuento) filaDescuento.style.display = 'none';
      if (filaEnvio) filaEnvio.style.display = 'none';
      if (envioCard) envioCard.style.display = 'none';
      if (direccionCard) direccionCard.style.display = 'none';
      if (pagoCard) pagoCard.style.display = 'none';
      return;
    }

    mensajeVacio.style.display = 'none';
    tarjetaTotal.style.display = 'block';
    if (envioCard) envioCard.style.display = 'block';
    if (direccionCard) direccionCard.style.display = 'block';
    if (pagoCard) pagoCard.style.display = 'block';

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'card mb-3 cart-card cart-item';
      const formattedUnit = (item.currency ? item.currency + ' ' : '') +
        new Intl.NumberFormat('es-AR').format(item.unitCost);
      if (typeof item.selected === 'undefined') item.selected = true;
      row.innerHTML = `
        <div class="row g-0 align-items-center">
          <div class="col-md-3 text-center">
            <div class="form-check cart-select-pos">
              <input class="form-check-input cart-select" type="checkbox" id="select-${item.id}" data-id="${item.id}" ${item.selected ? 'checked' : ''}>
            </div>
            <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name || ''}" class="img-fluid p-2" style="max-height:120px; object-fit:contain;">
          </div>
          <div class="col-md-5">
            <div class="card-body">
              <h5 class="card-title">${item.name || ''}</h5>
              <p class="card-text fw-bold text-success">${formattedUnit}</p>
            </div>
          </div>
          <div class="col-md-2 text-center">
            <input type="number" class="form-control w-75 mx-auto cart-qty" min="1" value="${item.count || 1}" data-id="${item.id}">
          </div>
          <div class="col-md-2 text-center">
            <button class="btn btn-danger btn-sm btn-delete" data-id="${item.id}">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>`;
      contenedorItems.appendChild(row);
    });

    actualizarTotales();
    adjuntarControles();
  }

  // Recalcula y actualiza los valores monetarios mostrados (subtotal, envío,
  // descuento, total) y habilita/deshabilita el botón de finalizar.
  function actualizarTotales() {
    const cart = cargarCarrito();
    const subtotal = calcularSubtotal(cart);
    const envio = calcularEnvio(subtotal);
    const descuento = Math.round(subtotal * obtenerDescuentoNacimiento());
    const total = calcularTotal(subtotal, envio, descuento);
    const currency = (cart[0] && cart[0].currency) ? (cart[0].currency + ' ') : '$';

    if (elementoSubtotal) elementoSubtotal.textContent = currency + new Intl.NumberFormat('es-AR').format(subtotal);

    // Fila de envío
    if (filaEnvio && elementoEnvio) {
      filaEnvio.style.display = 'flex';
      elementoEnvio.textContent = currency + new Intl.NumberFormat('es-AR').format(envio);
    }

    // Fila de descuento
    if (filaDescuento && montoDescuentoEl) {
      if (descuento > 0) {
        filaDescuento.style.display = 'flex';
        montoDescuentoEl.textContent = `- ${currency}${new Intl.NumberFormat('es-AR').format(descuento)}`;
      } else {
        filaDescuento.style.display = 'none';
      }
    }

    if (elementoTotal) elementoTotal.textContent = currency + new Intl.NumberFormat('es-AR').format(total);

    const anySelected = cart.some(it => it && it.selected !== false);
    const selectAllBox = document.getElementById('select-all');
    const permitirFinalizar = anySelected;

    if (botonFinalizar) {
      botonFinalizar.disabled = !permitirFinalizar;
      botonFinalizar.classList.toggle('disabled', !permitirFinalizar);
    }
    const allSelected = cart.length > 0 && cart.every(it => it && it.selected !== false);
    if (selectAllBox) selectAllBox.checked = allSelected;
  }

  // Adjunta manejadores de eventos a inputs dinámicos (cantidad, eliminar,
  // seleccionar) y controles globales (select all, cambios de envío).
  function adjuntarControles() {
    const qtyInputs = document.querySelectorAll('.cart-qty');
    const deleteBtns = document.querySelectorAll('.btn-delete');
    const selectBoxes = document.querySelectorAll('.cart-select');
    const selectAllBox = document.getElementById('select-all');

    qtyInputs.forEach(inp => inp.addEventListener('change', cambioCantidad));
    deleteBtns.forEach(btn => btn.addEventListener('click', eliminarItem));
    selectBoxes.forEach(cb => cb.addEventListener('change', cambioSeleccion));

    if (selectAllBox) selectAllBox.addEventListener('change', seleccionarTodo);
    radiosEnvio.forEach(radio => radio.addEventListener('change', actualizarTotales));
  }

  // Handler: cuando cambia la cantidad de un item, actualiza el carrito.
  function cambioCantidad(e) {
    const id = e.target.getAttribute('data-id');
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    const cart = cargarCarrito();
    const idx = cart.findIndex(it => String(it.id) === String(id));
    if (idx > -1) {
      cart[idx].count = val;
      guardarCarrito(cart);
      renderizarCarrito();
    }
  }

  // Handler: marca/desmarca un item como seleccionado para la compra.
  function cambioSeleccion(e) {
    const id = e.target.getAttribute('data-id');
    const checked = e.target.checked;
    const cart = cargarCarrito();
    const idx = cart.findIndex(it => String(it.id) === String(id));
    if (idx > -1) {
      cart[idx].selected = checked;
      guardarCarrito(cart);
      renderizarCarrito();
    }
  }

  // Handler: selecciona o deselecciona todos los items del carrito.
  function seleccionarTodo(e) {
    const checked = e.target.checked;
    const cart = cargarCarrito();
    const newCart = cart.map(it => Object.assign({}, it, { selected: checked }));
    guardarCarrito(newCart);
    renderizarCarrito();
  }

  // Handler: elimina un item del carrito y lo persiste.
  function eliminarItem(e) {
    const id = e.currentTarget.getAttribute('data-id');
    let cart = cargarCarrito();
    cart = cart.filter(it => String(it.id) !== String(id));
    guardarCarrito(cart);
    renderizarCarrito();
  }

  renderizarCarrito();
});

// Manejo del formulario de pago
document.addEventListener('DOMContentLoaded', function () {
  const tarjetaRadio = document.getElementById('pagoTarjeta');
  const transferenciaRadio = document.getElementById('pagoTransferencia');
  const formTarjeta = document.getElementById('form-tarjeta');
  const formTransferencia = document.getElementById('form-transferencia');

  if (!tarjetaRadio || !transferenciaRadio) return;

  formTarjeta.style.display = 'none';
  formTransferencia.style.display = 'none';

  tarjetaRadio.addEventListener('change', () => {
    formTarjeta.style.display = 'block';
    formTransferencia.style.display = 'none';
  });

  transferenciaRadio.addEventListener('change', () => {
    formTarjeta.style.display = 'none';
    formTransferencia.style.display = 'block';
  });
});















document.getElementById("checkout-btn")?.addEventListener("click", function () {
  const selectedShipping = document.querySelector('input[name="tipoEnvio"]:checked');
  const departamento = document.getElementById("departamento").value.trim();
  const localidad = document.getElementById("localidad").value.trim();
  const calle = document.getElementById("calle").value.trim();
  const numero = document.getElementById("numero").value.trim();
  const esquina = document.getElementById("esquina").value.trim();
  const pago = document.querySelector('input[name="pago"]:checked');

  const radios = document.querySelectorAll('input[name="tipoEnvio"]');
  if (!selectedShipping) {
    radios.forEach(r => r.parentElement.classList.add('border', 'border-danger', 'rounded'));
    setTimeout(() => {
      radios.forEach(r => r.parentElement.classList.remove('border', 'border-danger', 'rounded'));
    }, 3000);
    showError("Debes seleccionar un tipo de envío.");
    return;
  }

  const direccionInputs = [departamento, localidad, calle, numero, esquina];
  const direccionCampos = [ "departamento", "localidad", "calle", "numero", "esquina" ];
  if (direccionInputs.some(v => !v)) {
    direccionCampos.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) el.classList.add('is-invalid');
    });
    setTimeout(() => {
      direccionCampos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-invalid');
      });
    }, 3000);
    showError("Debes completar todos los campos de la dirección de envío.");
    return;
  }

  if (!pago) {
    showError("Debes seleccionar una forma de pago.");
    return;
  }

  if (pago.value === "tarjeta") {
    const camposTarjeta = ["nombreTarjeta", "numeroTarjeta", "vencimiento", "cvv"];
    const incompletos = camposTarjeta.filter(id => !document.getElementById(id).value.trim());
    if (incompletos.length > 0) {
      incompletos.forEach(id => document.getElementById(id).classList.add('is-invalid'));
      setTimeout(() => {
        incompletos.forEach(id => document.getElementById(id).classList.remove('is-invalid'));
      }, 3000);
      showError("Debes completar todos los campos de la tarjeta.");
      return;
    }
  }

  if (pago.value === "transferencia") {
    const camposTransferencia = ["banco", "numeroCuenta"];
    const incompletos = camposTransferencia.filter(id => !document.getElementById(id).value.trim());
    if (incompletos.length > 0) {
      incompletos.forEach(id => document.getElementById(id).classList.add('is-invalid'));
      setTimeout(() => {
        incompletos.forEach(id => document.getElementById(id).classList.remove('is-invalid'));
      }, 3000);
      showError("Debes completar los datos de la transferencia.");
      return;
    }
  }

  const modalConfirm = new bootstrap.Modal(document.getElementById("modalConfirmar"));
  modalConfirm.show();
});

function showError(msg) {
  const modal = new bootstrap.Modal(document.getElementById("modalError"));
  document.getElementById("modalErrorMsg").innerText = msg;
  modal.show();
}










document.getElementById("btnConfirmarCompra")?.addEventListener("click", function () {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const seleccionados = cart.filter(it => it && it.selected !== false);

    if (seleccionados.length === 0) {
      showError("No hay productos seleccionados para comprar.");
      return;
    }

    const usuario = localStorage.getItem('usuarioActivo');
    const claveCompras = usuario ? `purchases_${usuario}` : 'purchases';

    const prev = JSON.parse(localStorage.getItem(claveCompras) || '[]');
    const timestamp = new Date().toISOString();
    const subtotal = seleccionados.reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
    const descuentoPercent = obtenerDescuentoNacimiento();
    const descuento = Math.round(subtotal * descuentoPercent);
    const shippingRadio = document.querySelector('input[name="tipoEnvio"]:checked');
    const shippingPercent = shippingRadio ? Number(shippingRadio.value) : 0;
    const envio = subtotal * shippingPercent;
    const shippingLabel = shippingRadio ? (shippingRadio.nextElementSibling?.textContent || '').trim() : '';
    const currency = (seleccionados[0] && seleccionados[0].currency) ? seleccionados[0].currency : '$';
    const total = subtotal + envio - descuento;

    const orderMeta = {
      purchasedAt: timestamp,
      orderCurrency: currency,
      orderSubtotal: subtotal,
      orderDiscountAmount: descuento,
      orderDiscountPercent: Math.round(descuentoPercent * 100 * 100) / 100, // porcentaje con dos decimales
      orderDiscountReason: descuento > 0 ? 'Descuento por fecha de nacimiento' : '',
      orderShippingPercent: Math.round(shippingPercent * 100 * 100) / 100,
      orderShippingCost: envio,
      orderShippingLabel: shippingLabel,
      shippingPercent: Math.round(shippingPercent * 100 * 100) / 100,
      shippingCost: envio,
      shippingLabel: shippingLabel,
      envioPercent: Math.round(shippingPercent * 100 * 100) / 100,
      envioCost: envio,
      selectedShipping: shippingLabel,
      orderTotal: total
    };

    const nuevasCompras = seleccionados.map(it => ({
      ...it,
      ...orderMeta
    }));

    localStorage.setItem(claveCompras, JSON.stringify(prev.concat(nuevasCompras)));
    localStorage.setItem(`purchase_meta_${timestamp}`, JSON.stringify(orderMeta));

    const restantes = cart.filter(it => !(it && it.selected !== false));
    localStorage.setItem('cart', JSON.stringify(restantes));

    if (typeof renderizarCarrito === "function") {
      renderizarCarrito();
    }

    const modalExito = new bootstrap.Modal(document.getElementById("modalExito"));
    modalExito.show();

    const modalConfirmar = bootstrap.Modal.getInstance(document.getElementById("modalConfirmar"));
    if (modalConfirmar) modalConfirmar.hide();

  } catch (e) {
    console.error(e);
    showError("Ocurrió un error al procesar la compra.");
  }
});


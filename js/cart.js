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

  // Cargar carrito desde localStorage
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

  function guardarCarrito(cart) {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(cart));
    const totalItems = Array.isArray(cart) ? cart.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total: totalItems } }));
  }

  function calcularSubtotal(cart) {
    return cart
      .filter(it => it && it.selected !== false)
      .reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
  }

  function obtenerPorcentajeEnvio() {
    const seleccionado = document.querySelector('input[name="tipoEnvio"]:checked');
    return seleccionado ? Number(seleccionado.value) : 0;
  }

  function calcularEnvio(subtotal) {
    const porcentaje = obtenerPorcentajeEnvio();
    return subtotal * porcentaje;
  }

  function calcularTotal(subtotal, envio, descuento) {
    return subtotal + envio - descuento;
  }

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
        return 0.1; // 10% cumpleaños
      }
      return (b.getMonth() + 1) / 100; // porcentaje por mes
    } catch (e) {
      return 0;
    }
  }

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

  function seleccionarTodo(e) {
    const checked = e.target.checked;
    const cart = cargarCarrito();
    const newCart = cart.map(it => Object.assign({}, it, { selected: checked }));
    guardarCarrito(newCart);
    renderizarCarrito();
  }

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

    const nuevasCompras = seleccionados.map(it => ({
      ...it,
      purchasedAt: timestamp
    }));

    localStorage.setItem(claveCompras, JSON.stringify(prev.concat(nuevasCompras)));

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
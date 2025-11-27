// --- Perfil (Información personal) ---
(function () {
    // Id---DOM
    const STORAGE_KEY = 'perfilUsuario';

    const editarBtn = document.getElementById('editarPerfil');
    const personalDetails = document.getElementById('personal-details');
    const personalForm = document.getElementById('personal-form');

    const nombreValor = document.getElementById('nombreValor');
    const apellidoValor = document.getElementById('apellidoValor');
    const emailValor = document.getElementById('emailValor');
    const telefonoValor = document.getElementById('telefonoValor');
    const fechaNacimientoValor = document.getElementById('birthdateValor');
    const inputNombre = document.getElementById('inputNombre');
    const inputApellido = document.getElementById('inputApellido');
    const inputEmail = document.getElementById('inputEmail');
    const inputTelefono = document.getElementById('inputTelefono');

    const guardarBtn = document.getElementById('guardarPerfil');
    const cancelarBtn = document.getElementById('cancelarPerfil');

    function loadPerfil() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
          console.error('Error al parsear el perfil', e);
            return null;
        }
    }

    function savePerfil(obj) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    }

    function populateDisplay(obj) {
        nombreValor.textContent = obj && obj.nombre ? obj.nombre : '-';
        apellidoValor.textContent = obj && obj.apellido ? obj.apellido : '-';
        emailValor.textContent = obj && obj.email ? obj.email : '-';
    telefonoValor.textContent = obj && obj.telefono ? obj.telefono : '-';
    // Mostrar fecha de nacimiento en formato local si existe
    try {
      if (fechaNacimientoValor) {
        if (obj && obj.birthdate) {
          const d = new Date(obj.birthdate);
          if (!isNaN(d.getTime())) {
            fechaNacimientoValor.textContent = new Intl.DateTimeFormat('es-ES').format(d);
          } else {
            fechaNacimientoValor.textContent = obj.birthdate || '-';
          }
        } else {
          fechaNacimientoValor.textContent = '-';
        }
      }
    } catch (e) { if (fechaNacimientoValor) fechaNacimientoValor.textContent = '-'; }
    }

    function populateForm(obj) {
        inputNombre.value = obj && obj.nombre ? obj.nombre : '';
        inputApellido.value = obj && obj.apellido ? obj.apellido : '';
        inputEmail.value = obj && obj.email ? obj.email : '';
        inputTelefono.value = obj && obj.telefono ? obj.telefono : '';
    }

    function showForm(show) {
        if (show) {
            personalForm.classList.remove('d-none');
            personalDetails.classList.add('d-none');
            editarBtn.textContent = 'Editar perfil';
        } else {
            personalForm.classList.add('d-none');
            personalDetails.classList.remove('d-none');
        }
    }

    // Initialize
    const existing = loadPerfil();
    populateDisplay(existing);

    if (editarBtn) {
        editarBtn.addEventListener('click', function () {
            const data = loadPerfil();
            populateForm(data);
            showForm(true);
        });
    }

    if (guardarBtn) {
        guardarBtn.addEventListener('click', function () {
      // Preservar la fecha de nacimiento existente si la hay
      const existente = loadPerfil();
      const newData = {
        nombre: inputNombre.value && inputNombre.value.trim(),
        apellido: inputApellido.value && inputApellido.value.trim(),
        email: inputEmail.value && inputEmail.value.trim(),
        telefono: inputTelefono.value && inputTelefono.value.trim(),
        birthdate: existente && existente.birthdate ? existente.birthdate : undefined
      };

            // Validación básica: si se proporciona email debe incluir @
            if (newData.email && !newData.email.includes('@')) {
                alert('Ingrese un email válido.');
                return;
            }

            savePerfil(newData);
            populateDisplay(newData);
            showForm(false);
        });
    }

    if (cancelarBtn) {
      cancelarBtn.addEventListener('click', function () {
        // solo ocultar el formulario y mantener la visualización existente
        showForm(false);
      });
    }

})();










document.addEventListener("DOMContentLoaded", () => {
  const fotoPerfil = document.getElementById("fotoPerfil");
  const agregarFotoBtn = document.getElementById("agregarFoto");
  const inputFoto = document.getElementById("inputFoto");

  let cropper = null;
  let modal = null;

  const fotoGuardada = localStorage.getItem("fotoPerfilUsuario");
  if (fotoGuardada) {
    aplicarFoto(fotoGuardada);
  }

  agregarFotoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelector(".globo-opciones")?.remove();

    const globo = document.createElement("div");
    globo.className = "globo-opciones shadow";
    globo.innerHTML = `
      <button class="btn btn-outline-primary btn-sm w-100 mb-2" id="btnAgregarFoto">Agregar foto</button>
      <button class="btn btn-outline-danger btn-sm w-100" id="btnEliminarFoto">Eliminar foto</button>
      <div class="globo-flechita"></div>
    `;
    agregarFotoBtn.parentElement.appendChild(globo);

    globo.querySelector("#btnAgregarFoto").addEventListener("click", () => {
      globo.remove();
      inputFoto.click();
    });

    globo.querySelector("#btnEliminarFoto").addEventListener("click", () => {
      globo.remove();
      eliminarFoto();
    });

    document.addEventListener(
      "click",
      function cerrar(e) {
        if (!globo.contains(e.target) && e.target !== agregarFotoBtn) {
          globo.remove();
          document.removeEventListener("click", cerrar);
        }
      },
      { once: true }
    );
  });

  inputFoto.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => mostrarModalRecorte(ev.target.result);
    reader.readAsDataURL(file);
  });

  function mostrarModalRecorte(imagenSrc) {
    modal = document.createElement("div");
    modal.classList.add("modal", "fade");
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajustar foto de perfil</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img id="imgRecorte" src="${imagenSrc}" class="imagen-recorte">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="cancelarRecorte">Cancelar</button>
            <button type="button" class="btn btn-success" id="aceptarRecorte">Aceptar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener("shown.bs.modal", () => {
      const img = document.getElementById("imgRecorte");
      cropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 2,
        background: false,
        dragMode: "move",
        autoCropArea: 1,
        responsive: true,
        movable: true,
        zoomable: true,
        scalable: false
      });
    });

    modal.querySelector("#cancelarRecorte").addEventListener("click", () => {
      bsModal.hide();
    });

    modal.querySelector("#aceptarRecorte").addEventListener("click", () => {
      const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
      const dataURL = canvas.toDataURL("image/png");
      aplicarFoto(dataURL);
      localStorage.setItem("fotoPerfilUsuario", dataURL);
      bsModal.hide();
    });

    modal.addEventListener("hidden.bs.modal", () => {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      modal.remove();
    });
  }

  function aplicarFoto(dataURL) {
    fotoPerfil.style.backgroundImage = `url(${dataURL})`;
    fotoPerfil.classList.remove("bi-person-circle");
  }

  function eliminarFoto() {
    fotoPerfil.style.backgroundImage = "";
    fotoPerfil.classList.add("bi-person-circle");
    localStorage.removeItem("fotoPerfilUsuario");
  }

  function cargarCropper(callback) {
    if (window.Cropper) return callback();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/cropperjs@1.6.2/dist/cropper.min.js";
    script.onload = callback;
    document.body.appendChild(script);
  }
  cargarCropper(() => {});
});





// --- Resumen del Historial de Compras: total gastado y número de compras ---
document.addEventListener('DOMContentLoaded', function () {
  const summaryEl = document.getElementById('purchase-summary');
  const countEl = document.getElementById('purchases-count');
  const totalEl = document.getElementById('purchases-total');

  function getUserKey(prefix) {
    const usuario = localStorage.getItem('usuarioActivo');
    return usuario ? `${prefix}_${usuario}` : prefix;
  }

  function loadPurchases() {
    try {
      // Intentar leer primero la clave por usuario (p.ej. purchases_<usuario>).
      // Si no existe, caer a la clave global 'purchases' para compatibilidad.
      const userKey = getUserKey('purchases');
      let raw = localStorage.getItem(userKey);
      if (!raw) raw = localStorage.getItem('purchases');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parseando compras:', e);
      return [];
    }
  }


  function computeSummary() {
    const purchases = loadPurchases();
    if (!summaryEl) return;

    if (!purchases || purchases.length === 0) {
      if (countEl) countEl.textContent = '0';
      if (totalEl) totalEl.textContent = 'USD 0';
      return;
    }

    // contar compras por marcas de tiempo únicas (purchasedAt)
    const groups = {};
    purchases.forEach(item => {
      const key = item.purchasedAt || (Math.random().toString(36).slice(2));
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    const purchaseCount = Object.keys(groups).length;

    // total gastado en todas las compras
    const total = purchases.reduce((s, it) => s + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);

    // moneda: preferir la moneda del primer elemento
    const currency = (purchases[0] && purchases[0].currency) ? (purchases[0].currency + ' ') : '';

    if (countEl) countEl.textContent = String(purchaseCount);
    if (totalEl) totalEl.textContent = currency + new Intl.NumberFormat('es-AR').format(total);
  }

  computeSummary();

  // actualizar si hay cambios en storage
  window.addEventListener('storage', function (e) {
    if (!e.key) return;
    if (e.key === 'purchases' || e.key === 'cart' || e.key.startsWith('purchases_') || e.key.startsWith('cart_')) {
      computeSummary();
    }
  });
});
















(function () {
  const STORAGE_KEY = 'tarjetasDirecciones';
  const triggerBtn = document.querySelector('.tarjetas-direcciones');
  if (!triggerBtn) return;

  const summaryEl = document.createElement('div');
  summaryEl.classList.add('mt-2', 'text-muted');
  triggerBtn.after(summaryEl);

  const formWrapper = document.createElement('div');
  formWrapper.className = 'mt-3 d-none';
  formWrapper.innerHTML = `
    <div class="p-3 border rounded-3 bg-white shadow-sm">
      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="perfilGuardarTarjeta">
        <label class="form-check-label" for="perfilGuardarTarjeta">Guardar datos de tarjeta</label>
      </div>
      <div id="perfilTarjetaFields" class="bg-light border rounded-3 p-3 mb-3">
        <div class="mb-3">
          <label class="form-label" for="perfilNombreTarjeta">Nombre en la tarjeta</label>
          <input type="text" class="form-control" id="perfilNombreTarjeta" placeholder="Ej: Fernanda Perez">
        </div>
        <div class="mb-3">
          <label class="form-label" for="perfilNumeroTarjeta">Numero de tarjeta</label>
          <input type="text" class="form-control" id="perfilNumeroTarjeta" placeholder="XXXX-XXXX-XXXX-XXXX">
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="perfilVencimientoTarjeta">Vencimiento</label>
            <input type="month" class="form-control" id="perfilVencimientoTarjeta">
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label" for="perfilCvvTarjeta">CVV</label>
            <input type="text" class="form-control" maxlength="3" id="perfilCvvTarjeta" placeholder="123">
          </div>
        </div>
      </div>

      <div class="form-check form-switch mb-3">
        <input class="form-check-input" type="checkbox" id="perfilGuardarDireccion">
        <label class="form-check-label" for="perfilGuardarDireccion">Guardar direccion de envio</label>
      </div>
      <div id="perfilDireccionFields" class="bg-light border rounded-3 p-3 mb-3">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label" for="perfilDepartamento">Departamento</label>
            <input type="text" class="form-control" id="perfilDepartamento" placeholder="Ej: Montevideo">
          </div>
          <div class="col-md-4">
            <label class="form-label" for="perfilLocalidad">Localidad</label>
            <input type="text" class="form-control" id="perfilLocalidad" placeholder="Ej: Pocitos">
          </div>
          <div class="col-md-4">
            <label class="form-label" for="perfilCalle">Calle</label>
            <input type="text" class="form-control" id="perfilCalle" placeholder="Ej: Rivera">
          </div>
          <div class="col-md-2">
            <label class="form-label" for="perfilNumero">Numero</label>
            <input type="text" class="form-control" id="perfilNumero" placeholder="Ej: 1234">
          </div>
          <div class="col-md-4">
            <label class="form-label" for="perfilEsquina">Esquina</label>
            <input type="text" class="form-control" id="perfilEsquina" placeholder="Ej: Soca">
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-success" id="perfilGuardarDatos">Guardar</button>
        <button type="button" class="btn btn-secondary" id="perfilCancelarDatos">Cancelar</button>
      </div>
    </div>
  `;
  summaryEl.after(formWrapper);

  const cardToggle = formWrapper.querySelector('#perfilGuardarTarjeta');
  const addressToggle = formWrapper.querySelector('#perfilGuardarDireccion');
  const cardFields = formWrapper.querySelector('#perfilTarjetaFields');
  const addressFields = formWrapper.querySelector('#perfilDireccionFields');
  const saveBtn = formWrapper.querySelector('#perfilGuardarDatos');
  const cancelBtn = formWrapper.querySelector('#perfilCancelarDatos');

  const inputs = {
    card: {
      nombre: formWrapper.querySelector('#perfilNombreTarjeta'),
      numero: formWrapper.querySelector('#perfilNumeroTarjeta'),
      vencimiento: formWrapper.querySelector('#perfilVencimientoTarjeta'),
      cvv: formWrapper.querySelector('#perfilCvvTarjeta')
    },
    address: {
      departamento: formWrapper.querySelector('#perfilDepartamento'),
      localidad: formWrapper.querySelector('#perfilLocalidad'),
      calle: formWrapper.querySelector('#perfilCalle'),
      numero: formWrapper.querySelector('#perfilNumero'),
      esquina: formWrapper.querySelector('#perfilEsquina')
    }
  };

  const defaults = {
    tarjeta: { enabled: false, nombre: '', numero: '', vencimiento: '', cvv: '' },
    direccion: { enabled: false, departamento: '', localidad: '', calle: '', numero: '', esquina: '' }
  };

  function cloneDefaults() {
    return {
      tarjeta: Object.assign({}, defaults.tarjeta),
      direccion: Object.assign({}, defaults.direccion)
    };
  }

  function loadDatos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefaults();
      const parsed = JSON.parse(raw);
      return {
        tarjeta: Object.assign({}, defaults.tarjeta, parsed && parsed.tarjeta ? parsed.tarjeta : {}),
        direccion: Object.assign({}, defaults.direccion, parsed && parsed.direccion ? parsed.direccion : {})
      };
    } catch (e) {
      console.error('Error al parsear tarjetas/direcciones', e);
      return cloneDefaults();
    }
  }

  function saveDatos(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function maskCard(numero) {
    if (!numero) return '';
    const clean = numero.replace(/[^0-9]/g, '');
    if (clean.length <= 4) return clean;
    return `****${clean.slice(-4)}`;
  }

  function resumenDireccion(dir) {
    if (!dir) return '';
    const parts = [dir.calle && `${dir.calle} ${dir.numero || ''}`.trim(), dir.localidad, dir.departamento].filter(Boolean);
    return parts.join(', ');
  }

  function populateDisplay(data) {
    const cardTxt = (data.tarjeta.enabled && data.tarjeta.numero)
      ? `${maskCard(data.tarjeta.numero)} (vence ${data.tarjeta.vencimiento || '-'})`
      : 'No guardada';
    const dirTxt = data.direccion.enabled
      ? (resumenDireccion(data.direccion) || 'Datos incompletos')
      : 'No guardada';
    summaryEl.innerHTML = `
      <p class="mb-1"><strong>Tarjeta:</strong> ${cardTxt}</p>
      <p class="mb-1"><strong>Direccion:</strong> ${dirTxt}</p>
      <small class="text-muted">Haz click en esta seccion para editar o guardar tus datos.</small>
    `;
  }

  function toggleSection(section, enabled) {
    if (!section) return;
    section.classList.toggle('opacity-50', !enabled);
    section.querySelectorAll('input').forEach(inp => {
      inp.disabled = !enabled;
    });
  }

  function setFormValues(data) {
    cardToggle.checked = Boolean(data.tarjeta.enabled);
    addressToggle.checked = Boolean(data.direccion.enabled);
    inputs.card.nombre.value = data.tarjeta.nombre || '';
    inputs.card.numero.value = data.tarjeta.numero || '';
    inputs.card.vencimiento.value = data.tarjeta.vencimiento || '';
    inputs.card.cvv.value = data.tarjeta.cvv || '';

    inputs.address.departamento.value = data.direccion.departamento || '';
    inputs.address.localidad.value = data.direccion.localidad || '';
    inputs.address.calle.value = data.direccion.calle || '';
    inputs.address.numero.value = data.direccion.numero || '';
    inputs.address.esquina.value = data.direccion.esquina || '';

    toggleSection(cardFields, cardToggle.checked);
    toggleSection(addressFields, addressToggle.checked);
  }

  cardToggle.addEventListener('change', () => toggleSection(cardFields, cardToggle.checked));
  addressToggle.addEventListener('change', () => toggleSection(addressFields, addressToggle.checked));

  triggerBtn.addEventListener('click', () => {
    const datos = loadDatos();
    setFormValues(datos);
    formWrapper.classList.toggle('d-none');
  });

  saveBtn.addEventListener('click', () => {
    const cardValues = {
      nombre: inputs.card.nombre.value.trim(),
      numero: inputs.card.numero.value.trim(),
      vencimiento: inputs.card.vencimiento.value.trim(),
      cvv: inputs.card.cvv.value.trim()
    };
    const addressValues = {
      departamento: inputs.address.departamento.value.trim(),
      localidad: inputs.address.localidad.value.trim(),
      calle: inputs.address.calle.value.trim(),
      numero: inputs.address.numero.value.trim(),
      esquina: inputs.address.esquina.value.trim()
    };

    if (cardToggle.checked) {
      const faltan = Object.values(cardValues).some(v => !v);
      if (faltan) {
        alert('Completa todos los campos de la tarjeta para guardarla.');
        return;
      }
    }

    if (addressToggle.checked) {
      const faltan = Object.values(addressValues).some(v => !v);
      if (faltan) {
        alert('Completa todos los campos de direccion para guardarla.');
        return;
      }
    }

    const payload = {
      tarjeta: Object.assign({}, cardValues, { enabled: cardToggle.checked }),
      direccion: Object.assign({}, addressValues, { enabled: addressToggle.checked })
    };

    saveDatos(payload);
    populateDisplay(payload);
    formWrapper.classList.add('d-none');
  });

  cancelBtn.addEventListener('click', () => {
    formWrapper.classList.add('d-none');
  });

  populateDisplay(loadDatos());
})();

(function () {
  const helpButton = document.querySelector('.ayuda-soporte');
  if (!helpButton) return;

  helpButton.addEventListener('click', () => {
    try {
      sessionStorage.setItem('openChatRedirect', '1');
    } catch (e) {
      // Ignorar errores de almacenamiento (modo incógnito, etc.)
    }
    window.location.href = 'index.html?openChat=1';
  });
})();









const mensajes = [
  { texto: "Nueva oferta disponible", icono: "bi bi-bag-check-fill" },
  { texto: "La oferta ha caducado", icono: "bi bi-x-octagon-fill" },
  { texto: "Tu producto ya está en camino", icono: "bi bi-truck" },
  { texto: "¡Anotate a nuestro nuevo sorteo!", icono: "bi bi-gift-fill" },
  { texto: "Tienes un nuevo mensaje", icono: "bi bi-chat-left-dots-fill" },
  { texto: "Actualizamos tu perfil exitosamente", icono: "bi bi-person-check-fill" }
];

let notificacionesActivas = localStorage.getItem("notificacionesActivas") !== "false";

const btnToggle = document.getElementById("toggleNotificacionesBtn");

if (btnToggle) {
  actualizarBoton();
  btnToggle.addEventListener("click", () => {
    notificacionesActivas = !notificacionesActivas;
    localStorage.setItem("notificacionesActivas", notificacionesActivas);
    actualizarBoton();
  });
}

function actualizarBoton() {
  btnToggle.textContent = `Notificaciones: ${notificacionesActivas ? "ACTIVADAS" : "DESACTIVADAS"}`;
}

function mostrarToast(msg) {
  const cont = document.getElementById("notificaciones-container");

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <i class="${msg.icono}"></i>
    <span>${msg.texto}</span>
    <span class="cerrar">&times;</span>
  `;

  cont.appendChild(toast);

  toast.querySelector(".cerrar").addEventListener("click", () => toast.remove());

  setTimeout(() => toast.remove(), 8000);
}

setInterval(() => {
  if (!notificacionesActivas) return;
  const msg = mensajes[Math.floor(Math.random() * mensajes.length)];
  mostrarToast(msg);
}, 15000);
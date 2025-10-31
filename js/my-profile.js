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
            console.error('perfil parse error', e);
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
            const newData = {
                nombre: inputNombre.value && inputNombre.value.trim(),
                apellido: inputApellido.value && inputApellido.value.trim(),
                email: inputEmail.value && inputEmail.value.trim(),
                telefono: inputTelefono.value && inputTelefono.value.trim()
            };

            // Basic validation: email if provided should include @
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
            // just hide form and keep existing display
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
      const key = getUserKey("purchases");
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parseando purchases:', e);
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

    // count purchases by unique purchasedAt timestamps
    const groups = {};
    purchases.forEach(item => {
      const key = item.purchasedAt || (Math.random().toString(36).slice(2));
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    const purchaseCount = Object.keys(groups).length;

    // total spent across all purchases
    const total = purchases.reduce((s, it) => s + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);

    // currency: prefer first item's currency
    const currency = (purchases[0] && purchases[0].currency) ? (purchases[0].currency + ' ') : '';

    if (countEl) countEl.textContent = String(purchaseCount);
    if (totalEl) totalEl.textContent = currency + new Intl.NumberFormat('es-AR').format(total);
  }

  computeSummary();

  // actualizar si hay cambios en storage
  window.addEventListener('storage', function (e) {
    if (e.key && (e.key.includes('purchases_') || e.key.includes('cart_'))) {
      computeSummary();
    }
  });
});
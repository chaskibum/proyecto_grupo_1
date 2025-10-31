document.addEventListener('DOMContentLoaded', function () {
	const CLAVE_ALMACENAMIENTO = 'cart';
	const contenedorItems = document.getElementById('cart-items');
	const mensajeVacio = document.getElementById('cart-empty');
	const tarjetaTotal = document.getElementById('cart-total-card');
	const elementoTotal = document.getElementById('cart-total');
	const botonFinalizar = document.getElementById('checkout-btn');

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

	// Guardar carrito en localStorage
	function guardarCarrito(cart) {
				localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(cart));
			// Despachar un evento para que otras partes de la app (navbar) se actualicen inmediatamente
			try {
				const total = Array.isArray(cart) ? cart.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
				document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total } }));
			} catch (e) {
				console.warn('Error despachando cart:updated', e);
			}
	}

	// Calcular total (no hace conversión de monedas: asume misma moneda)
	function calcularTotal(cart) {
		// Sumar solo los items que estén seleccionados (selected !== false)
		return cart
			.filter(it => it && it.selected !== false)
			.reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
	}

	// Render del carrito
	function renderizarCarrito() {
	const cart = cargarCarrito();
	contenedorItems.innerHTML = '';

		if (!cart || cart.length === 0) {
			mensajeVacio.style.display = 'block';
			tarjetaTotal.style.display = 'none';
			return;
		}

		mensajeVacio.style.display = 'none';
		tarjetaTotal.style.display = 'block';

			cart.forEach(item => {
			const row = document.createElement('div');
			row.className = 'card mb-3 cart-card cart-item';
					// Formato del precio unitario y subtotal/desglose
					const formattedUnit = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(item.unitCost);

					// Asegurar propiedad selected por defecto (persistencia)
					if (typeof item.selected === 'undefined') item.selected = true;
					row.innerHTML = `
				<div class="row g-0 align-items-center">
					<div class="col-md-3 text-center">
						<div class="form-check cart-select-pos">
							<input class="form-check-input cart-select" type="checkbox" value="" id="select-${item.id}" data-id="${item.id}" ${item.selected ? 'checked' : ''}>
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
				</div>
			`;

			contenedorItems.appendChild(row);
		});

				// Construir el desglose por artículos (lista en la tarjeta de totales)
				const breakdownEl = document.getElementById('cart-breakdown');
				if (breakdownEl) {
					breakdownEl.innerHTML = '';
						cart.forEach(item => {
						const sub = Number(item.unitCost || 0) * Number(item.count || 0);
						const formattedSub = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(sub);
						const formattedUnitLocal = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(item.unitCost);
							// Mostrar en el desglose solo si el item está seleccionado
							if (item.selected !== false) {
								const li = document.createElement('li');
								li.className = 'list-group-item d-flex justify-content-between align-items-center';
								li.textContent = `${item.name} — ${formattedUnitLocal} x ${item.count} = `;
								const span = document.createElement('span');
								span.className = 'fw-bold text-muted';
								span.textContent = formattedSub;
								li.appendChild(span);
								breakdownEl.appendChild(li);
							}
					});
				}

				actualizarMostradorTotal(cart);
				adjuntarControles();
	}
	function actualizarMostradorTotal(cart) {
		const subtotal = calcularTotal(cart);
		// Mostrar con separador de miles y sin decimales si entero
		const formattedSubtotal = new Intl.NumberFormat('es-AR').format(subtotal);
		// Intentamos obtener la moneda del primer item
		const currency = (cart[0] && cart[0].currency) ? (cart[0].currency + ' ') : '';
		// Subtotal (todos los artículos)
	const subtotalAllEl = document.getElementById('cart-subtotal-all');
		if (subtotalAllEl) subtotalAllEl.textContent = currency + formattedSubtotal;

	// Calcular descuento según perfil del usuario (misma lógica que en checkout)
	function obtenerDescuentoNacimiento() {
			try {
				const rawPerfil = localStorage.getItem('perfilUsuario');
				if (!rawPerfil) return { percent: 0, reason: null };
				const perfil = JSON.parse(rawPerfil);
				if (!perfil || !perfil.birthdate) return { percent: 0, reason: null };
				const b = new Date(perfil.birthdate);
				if (isNaN(b.getTime())) return { percent: 0, reason: null };
				const today = new Date();
				const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
				// Si hoy es tu cumpleaños -> 10% (prioritario)
				if (b.getDate() === today.getDate() && b.getMonth() === today.getMonth()) {
					return { percent: 10, reason: `Descuento por cumpleaños (${monthNames[b.getMonth()]} ${b.getDate()})` };
				}
				// Si no, descuento igual al número del mes de nacimiento (enero=1 -> 1%)
				const monthPercent = (b.getMonth() + 1);
				return { percent: monthPercent, reason: `Descuento por mes de nacimiento (${monthNames[b.getMonth()]})` };
			} catch (e) {
				console.warn('Error leyendo perfil para descuentos', e);
				return { percent: 0, reason: null };
			}
		}

		const birthDiscount = obtenerDescuentoNacimiento();
		const porcentajeDescuento = birthDiscount.percent || 0;
		const razonDescuento = birthDiscount.reason || null;

		const filaDescuento = document.getElementById('cart-discount-row');
		const montoDescuentoEl = document.getElementById('cart-discount-amount');
		const razonDescuentoEl = document.getElementById('cart-discount-reason');
		if (porcentajeDescuento > 0) {
			const montoDescuento = Math.round((subtotal * porcentajeDescuento) / 100);
			const formattedDescuento = new Intl.NumberFormat('es-AR').format(montoDescuento);
			if (filaDescuento) filaDescuento.style.display = 'flex';
			if (montoDescuentoEl) montoDescuentoEl.textContent = `- ${currency}${formattedDescuento} (${porcentajeDescuento}%)`;
			if (razonDescuentoEl) {
				razonDescuentoEl.textContent = razonDescuento || '';
				razonDescuentoEl.style.display = razonDescuento ? 'block' : 'none';
			}
			if (subtotalAllEl) subtotalAllEl.classList.add('subtotal-tachado');
			// Total después del descuento
			const totalDespues = subtotal - montoDescuento;
			const formattedTotalAfter = new Intl.NumberFormat('es-AR').format(totalDespues);
			if (elementoTotal) elementoTotal.textContent = currency + formattedTotalAfter;
		} else {
			if (filaDescuento) filaDescuento.style.display = 'none';
			if (razonDescuentoEl) { razonDescuentoEl.textContent = ''; razonDescuentoEl.style.display = 'none'; }
			if (subtotalAllEl) subtotalAllEl.classList.remove('subtotal-tachado');
			if (elementoTotal) elementoTotal.textContent = currency + formattedSubtotal;
		}

		// Habilitar/deshabilitar botón de checkout según existan artículos seleccionados
		const anySelected = cart.some(it => it && it.selected !== false);
		if (botonFinalizar) {
			botonFinalizar.disabled = !anySelected;
			if (botonFinalizar.disabled) botonFinalizar.classList.add('disabled'); else botonFinalizar.classList.remove('disabled');
		}
	}
	// Adjuntar listeners a inputs y botones dinamicamente
	function adjuntarControles() {
		const qtyInputs = document.querySelectorAll('.cart-qty');
		const deleteBtns = document.querySelectorAll('.btn-delete');
		const selectBoxes = document.querySelectorAll('.cart-select');
	const selectAllBox = document.getElementById('select-all');

		qtyInputs.forEach(inp => {
			inp.removeEventListener('change', cambioCantidad);
			inp.addEventListener('change', cambioCantidad);
		});

		deleteBtns.forEach(btn => {
			btn.removeEventListener('click', eliminarItem);
			btn.addEventListener('click', eliminarItem);
		});

		selectBoxes.forEach(cb => {
			cb.removeEventListener('change', cambioSeleccion);
			cb.addEventListener('change', cambioSeleccion);
		});

		if (selectAllBox) {
			selectAllBox.removeEventListener('change', seleccionarTodo);
			selectAllBox.addEventListener('change', seleccionarTodo);
			// Inicializar estado del selectAll según si todos los items están seleccionados
			const cart = cargarCarrito();
			selectAllBox.checked = cart.length > 0 && cart.every(it => it.selected !== false);
		}
	}

	function cambioCantidad(e) {
		const id = e.target.getAttribute('data-id');
		let val = parseInt(e.target.value, 10);
		if (isNaN(val) || val < 1) val = 1;
		e.target.value = val;

		const cart = cargarCarrito();
		const idx = cart.findIndex(it => String(it.id) === String(id));
		if (idx > -1) {
			cart[idx].count = val;
			guardarCarrito(cart);
			// Re-render para actualizar el desglose y totales
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
		const newCart = cart.map(it => (Object.assign({}, it, { selected: checked })));
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

	// Accion de finalizar compra: guardar los productos seleccionados en 'purchases'
	// y eliminarlos del carrito
	botonFinalizar && botonFinalizar.addEventListener('click', function () {
		const cart = cargarCarrito();
		if (!cart || cart.length === 0) return;

		// Items seleccionados (selected !== false)
		const selected = cart.filter(it => it && it.selected !== false);
		if (!selected || selected.length === 0) {
			alert('Seleccione al menos un producto para comprar.');
			return;
		}

		// Guardar en localStorage bajo la clave 'purchases' (concatenando compras previas)
		try {
			const rawPrev = localStorage.getItem('purchases');
			const prev = rawPrev ? JSON.parse(rawPrev) : [];
			const timestamp = new Date().toISOString();
			// Unificar cálculo de descuento para metadata y notificación
			function obtenerDescuentoParaCompra() {
				try {
					const rawPerfil = localStorage.getItem('perfilUsuario');
					if (!rawPerfil) return { percent: 0, reason: null };
					const perfil = JSON.parse(rawPerfil);
					if (!perfil || !perfil.birthdate) return { percent: 0, reason: null };
					const b = new Date(perfil.birthdate);
					if (isNaN(b.getTime())) return { percent: 0, reason: null };
					const today = new Date();
					const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
					if (b.getDate() === today.getDate() && b.getMonth() === today.getMonth()) {
						return { percent: 10, reason: `Descuento por cumpleaños (${monthNames[b.getMonth()]} ${b.getDate()})` };
					}
					const monthPercent = (b.getMonth() + 1);
					return { percent: monthPercent, reason: `Descuento por mes de nacimiento (${monthNames[b.getMonth()]})` };
				} catch (e) { return { percent: 0, reason: null }; }
			}
			const metaDescuento = obtenerDescuentoParaCompra();
			const toSave = selected.map(item => Object.assign({}, item, { purchasedAt: timestamp, orderDiscountPercent: metaDescuento.percent || 0, orderDiscountReason: metaDescuento.reason || null }));
			const merged = Array.isArray(prev) ? prev.concat(toSave) : toSave;
			localStorage.setItem('purchases', JSON.stringify(merged));

				// Calcular totales y notificar al usuario del descuento (usar bd_meta calculado antes)
				try {
					const descuento = metaDescuento || { percent: 0, reason: null };
					const subtotal = selected.reduce((s, it) => s + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
					const montoDescuento = Math.round((subtotal * (descuento.percent || 0)) / 100);
					const totalAfter = subtotal - montoDescuento;
					// No mostrar alert() bloqueante. Guardamos un resumen no intrusivo en localStorage
					// para que otras partes de la app puedan leerlo si lo desean.
					try {
						localStorage.setItem('lastPurchaseSummary', JSON.stringify({ subtotal, montoDescuento, totalAfter, descuento }));
					} catch (err) { /* ignore storage errors */ }
					// opcional: log para debug
					console.info('Compra procesada', { subtotal, montoDescuento, totalAfter, descuento });
				} catch (e) { /* ignore */ }
		} catch (e) {
			console.error('No se pudo guardar la compra en localStorage:', e);
			alert('Ocurrió un error al procesar la compra. Intente nuevamente.');
			return;
		}

		// Eliminar los productos seleccionados del carrito y guardar el resto
		const remaining = cart.filter(it => !(it && it.selected !== false));
		guardarCarrito(remaining);

		// Notificar a otros listeners del nuevo total (guardarCarrito ya despacha cart:updated,
		// pero aseguramos que el detalle esté actualizado)
		try {
			const totalRemaining = Array.isArray(remaining) ? remaining.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
			document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total: totalRemaining } }));
		} catch (e) { /* ignore */ }

		// Re-renderizar y notificar al usuario
		renderizarCarrito();
		// Opcional: redirigir a inicio
		window.location.href = "index.html";
	});

	// Render inicial
	renderizarCarrito();
});


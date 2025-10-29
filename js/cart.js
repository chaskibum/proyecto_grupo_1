document.addEventListener('DOMContentLoaded', function () {
	const STORAGE_KEY = 'cart';
	const containerItems = document.getElementById('cart-items');
	const emptyMessage = document.getElementById('cart-empty');
	const totalCard = document.getElementById('cart-total-card');
	const totalEl = document.getElementById('cart-total');
	const checkoutBtn = document.getElementById('checkout-btn');

	// Cargar carrito desde localStorage
	function cargarCarrito() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const parsed = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			console.error('Error parseando carrito desde localStorage:', e);
			return [];
		}
	}

	// Guardar carrito en localStorage
	function guardarCarrito(cart) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
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
		containerItems.innerHTML = '';

		if (!cart || cart.length === 0) {
			emptyMessage.style.display = 'block';
			totalCard.style.display = 'none';
			return;
		}

		emptyMessage.style.display = 'none';
		totalCard.style.display = 'block';

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

			containerItems.appendChild(row);
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
		const total = calcularTotal(cart);
		// Mostrar con separador de miles y sin decimales si entero
		const formatted = new Intl.NumberFormat('es-AR').format(total);
		// Intentamos obtener la moneda del primer item
		const currency = (cart[0] && cart[0].currency) ? (cart[0].currency + ' ') : '';
				// Subtotal (todos los artículos)
				const subtotalAllEl = document.getElementById('cart-subtotal-all');
				if (subtotalAllEl) subtotalAllEl.textContent = currency + formatted;

				// Total (por ahora igual al subtotal agregado; en el futuro puede incluir impuestos/envío)
				totalEl.textContent = currency + formatted;

				// Habilitar/deshabilitar botón de checkout según existan artículos seleccionados
				const anySelected = cart.some(it => it && it.selected !== false);
				if (checkoutBtn) {
					checkoutBtn.disabled = !anySelected;
					if (checkoutBtn.disabled) checkoutBtn.classList.add('disabled'); else checkoutBtn.classList.remove('disabled');
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

	// Accion de finalizar compra: aquí solo limpia el carrito y muestra mensaje simple
	checkoutBtn && checkoutBtn.addEventListener('click', function () {
		const cart = cargarCarrito();
		if (!cart || cart.length === 0) return;
		// Por simplicidad: vaciamos el carrito y mostramos mensaje
		localStorage.removeItem(STORAGE_KEY);
		// notificar a otros listeners que el carrito ahora está vacío
		document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total: 0 } }));
		renderizarCarrito();
		alert('Gracias por su compra. (Simulación)');
		window.location.href = "index.html"
	});

	// Render inicial
	renderizarCarrito();
});


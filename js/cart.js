document.addEventListener('DOMContentLoaded', function () {
	const STORAGE_KEY = 'cart';
	const containerItems = document.getElementById('cart-items');
	const emptyMessage = document.getElementById('cart-empty');
	const totalCard = document.getElementById('cart-total-card');
	const totalEl = document.getElementById('cart-total');
	const checkoutBtn = document.getElementById('checkout-btn');

	// Cargar carrito desde localStorage
	function loadCart() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const parsed = raw ? JSON.parse(raw) : [];
			return Array.isArray(parsed) ? parsed : [];
		} catch (e) {
			console.error('Error parsing cart from localStorage:', e);
			return [];
		}
	}

	// Guardar carrito en localStorage
	function saveCart(cart) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
	}

	// Calcular total (no hace conversión de monedas: asume misma moneda)
	function calcTotal(cart) {
		// Sumar solo los items que estén seleccionados (selected !== false)
		return cart
			.filter(it => it && it.selected !== false)
			.reduce((sum, it) => sum + (Number(it.unitCost || 0) * Number(it.count || 0)), 0);
	}

	// Render del carrito
	function renderCart() {
		const cart = loadCart();
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

				updateTotalDisplay(cart);
				attachControls();
	}

	function updateTotalDisplay(cart) {
		const total = calcTotal(cart);
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
	function attachControls() {
		const qtyInputs = document.querySelectorAll('.cart-qty');
		const deleteBtns = document.querySelectorAll('.btn-delete');
		const selectBoxes = document.querySelectorAll('.cart-select');
		const selectAllBox = document.getElementById('select-all');

		qtyInputs.forEach(inp => {
			inp.removeEventListener('change', onQtyChange);
			inp.addEventListener('change', onQtyChange);
		});

		deleteBtns.forEach(btn => {
			btn.removeEventListener('click', onDelete);
			btn.addEventListener('click', onDelete);
		});

		selectBoxes.forEach(cb => {
			cb.removeEventListener('change', onSelectChange);
			cb.addEventListener('change', onSelectChange);
		});

		if (selectAllBox) {
			selectAllBox.removeEventListener('change', onSelectAll);
			selectAllBox.addEventListener('change', onSelectAll);
			// Inicializar estado del selectAll según si todos los items están seleccionados
			const cart = loadCart();
			selectAllBox.checked = cart.length > 0 && cart.every(it => it.selected !== false);
		}
	}

	function onQtyChange(e) {
		const id = e.target.getAttribute('data-id');
		let val = parseInt(e.target.value, 10);
		if (isNaN(val) || val < 1) val = 1;
		e.target.value = val;

		const cart = loadCart();
		const idx = cart.findIndex(it => String(it.id) === String(id));
		if (idx > -1) {
			cart[idx].count = val;
			saveCart(cart);
			// Re-render para actualizar el desglose y totales
			renderCart();
		}
	}

	function onSelectChange(e) {
		const id = e.target.getAttribute('data-id');
		const checked = e.target.checked;
		const cart = loadCart();
		const idx = cart.findIndex(it => String(it.id) === String(id));
		if (idx > -1) {
			cart[idx].selected = checked;
			saveCart(cart);
			renderCart();
		}
	}

	function onSelectAll(e) {
		const checked = e.target.checked;
		const cart = loadCart();
		const newCart = cart.map(it => (Object.assign({}, it, { selected: checked })));
		saveCart(newCart);
		renderCart();
	}

	function onDelete(e) {
		const id = e.currentTarget.getAttribute('data-id');
		let cart = loadCart();
		cart = cart.filter(it => String(it.id) !== String(id));
		saveCart(cart);
		renderCart();
	}

	// Accion de finalizar compra: aquí solo limpia el carrito y muestra mensaje simple
	checkoutBtn && checkoutBtn.addEventListener('click', function () {
		const cart = loadCart();
		if (!cart || cart.length === 0) return;
		// Por simplicidad: vaciamos el carrito y mostramos mensaje
		localStorage.removeItem(STORAGE_KEY);
		renderCart();
		alert('Gracias por su compra. (Simulación)');
	});

	// Inicial render
	renderCart();
});


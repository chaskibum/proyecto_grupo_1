document.addEventListener('DOMContentLoaded', function () {
	const CLAVE_ALMACENAMIENTO = 'cart';
	const contenedorItems = document.getElementById('cart-items');
	const mensajeVacio = document.getElementById('cart-empty');
	const tarjetaTotal = document.getElementById('cart-total-card');
	const elementoTotal = document.getElementById('cart-total');
	const botonFinalizar = document.getElementById('checkout-btn');

	// Obtener carrito guardado en localStorage
	function cargarCarrito() {
		try {
			const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);
			const parseado = datos ? JSON.parse(datos) : [];
			return Array.isArray(parseado) ? parseado : [];
		} catch (e) {
			return [];
		}
	}

	// Persistir carrito en localStorage y notificar cambios
	function guardarCarrito(carrito) {
		localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(carrito));
		try {
			// Emitir evento personalizado para actualizar badge del navbar
			const total = Array.isArray(carrito) ? carrito.reduce((suma, item) => suma + (Number(item.count || 0)), 0) : 0;
			document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total } }));
		} catch (e) {
		}
	}

	// Calcular precio total de items seleccionados
	function calcularTotal(carrito) {
		return carrito
			.filter(item => item && item.selected !== false)
			.reduce((suma, item) => suma + (Number(item.unitCost || 0) * Number(item.count || 0)), 0);
	}

	// Renderizar lista de productos en el carrito
	function renderizarCarrito() {
		const carrito = cargarCarrito();
		contenedorItems.innerHTML = '';

		// Mostrar mensaje si el carrito está vacío
		if (!carrito || carrito.length === 0) {
			mensajeVacio.style.display = 'block';
			tarjetaTotal.style.display = 'none';
			return;
		}

		mensajeVacio.style.display = 'none';
		tarjetaTotal.style.display = 'block';

		carrito.forEach(item => {
			const fila = document.createElement('div');
			fila.className = 'card mb-3 cart-card cart-item';
			const precioFormateado = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(item.unitCost);

			if (typeof item.selected === 'undefined') item.selected = true;
			fila.innerHTML = `
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
								<p class="card-text fw-bold text-success">${precioFormateado}</p>
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

			contenedorItems.appendChild(fila);
		});

		const elementoDesglose = document.getElementById('cart-breakdown');
		if (elementoDesglose) {
			elementoDesglose.innerHTML = '';
			carrito.forEach(item => {
				const subtotal = Number(item.unitCost || 0) * Number(item.count || 0);
				const subtotalFormateado = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(subtotal);
				const precioUnitarioFormateado = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(item.unitCost);
				if (item.selected !== false) {
					const elementoLista = document.createElement('li');
					elementoLista.className = 'list-group-item d-flex justify-content-between align-items-center';
					elementoLista.textContent = `${item.name} — ${precioUnitarioFormateado} x ${item.count} = `;
					const spanMonto = document.createElement('span');
					spanMonto.className = 'fw-bold text-muted';
					spanMonto.textContent = subtotalFormateado;
					elementoLista.appendChild(spanMonto);
					elementoDesglose.appendChild(elementoLista);
				}
			});
		}

		actualizarMostradorTotal(carrito);
		adjuntarControles();
	}
	function actualizarMostradorTotal(carrito) {
		const subtotal = calcularTotal(carrito);
		const subtotalFormateado = new Intl.NumberFormat('es-AR').format(subtotal);
		const moneda = (carrito[0] && carrito[0].currency) ? (carrito[0].currency + ' ') : '';
		
		const elementoSubtotalTodos = document.getElementById('cart-subtotal-all');
		if (elementoSubtotalTodos) elementoSubtotalTodos.textContent = moneda + subtotalFormateado;

		function obtenerDescuentoNacimiento() {
			try {
				const datosPerfilGuardado = localStorage.getItem('perfilUsuario');
				if (!datosPerfilGuardado) return { porcentaje: 0, razon: null };
				const perfil = JSON.parse(datosPerfilGuardado);
				if (!perfil || !perfil.birthdate) return { porcentaje: 0, razon: null };
				const fechaNacimiento = new Date(perfil.birthdate);
				if (isNaN(fechaNacimiento.getTime())) return { porcentaje: 0, razon: null };
				const hoy = new Date();
				const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
				
				if (fechaNacimiento.getDate() === hoy.getDate() && fechaNacimiento.getMonth() === hoy.getMonth()) {
					return { porcentaje: 10, razon: `Descuento por cumpleaños (${nombresMeses[fechaNacimiento.getMonth()]} ${fechaNacimiento.getDate()})` };
				}
				
				const porcentajeMes = (fechaNacimiento.getMonth() + 1);
				return { porcentaje: porcentajeMes, razon: `Descuento por mes de nacimiento (${nombresMeses[fechaNacimiento.getMonth()]})` };
			} catch (e) {
				return { porcentaje: 0, razon: null };
			}
		}
		
		const descuentoNacimiento = obtenerDescuentoNacimiento();
		const porcentajeDescuento = descuentoNacimiento.porcentaje || 0;
		const razonDescuento = descuentoNacimiento.razon || null;

		const filaDescuento = document.getElementById('cart-discount-row');
		const elementoMontoDescuento = document.getElementById('cart-discount-amount');
		const elementoRazonDescuento = document.getElementById('cart-discount-reason');
		
		if (porcentajeDescuento > 0) {
			const montoDescuento = Math.round((subtotal * porcentajeDescuento) / 100);
			const descuentoFormateado = new Intl.NumberFormat('es-AR').format(montoDescuento);
			if (filaDescuento) filaDescuento.style.display = 'flex';
			if (elementoMontoDescuento) elementoMontoDescuento.textContent = `- ${moneda}${descuentoFormateado} (${porcentajeDescuento}%)`;
			if (elementoRazonDescuento) {
				elementoRazonDescuento.textContent = razonDescuento || '';
				elementoRazonDescuento.style.display = razonDescuento ? 'block' : 'none';
			}
			if (elementoSubtotalTodos) elementoSubtotalTodos.classList.add('subtotal-tachado');
			
			const totalDespuesDescuento = subtotal - montoDescuento;
			const totalFormateado = new Intl.NumberFormat('es-AR').format(totalDespuesDescuento);
			if (elementoTotal) elementoTotal.textContent = moneda + totalFormateado;
		} else {
			if (filaDescuento) filaDescuento.style.display = 'none';
			if (elementoRazonDescuento) { 
				elementoRazonDescuento.textContent = ''; 
				elementoRazonDescuento.style.display = 'none'; 
			}
			if (elementoSubtotalTodos) elementoSubtotalTodos.classList.remove('subtotal-tachado');
			if (elementoTotal) elementoTotal.textContent = moneda + subtotalFormateado;
		}

		const haySeleccionados = carrito.some(item => item && item.selected !== false);
		if (botonFinalizar) {
			botonFinalizar.disabled = !haySeleccionados;
			if (botonFinalizar.disabled) botonFinalizar.classList.add('disabled'); 
			else botonFinalizar.classList.remove('disabled');
		}
	}
	
	function adjuntarControles() {
		const inputsCantidad = document.querySelectorAll('.cart-qty');
		const botonesEliminar = document.querySelectorAll('.btn-delete');
		const cajasSeleccion = document.querySelectorAll('.cart-select');
		const cajaSeleccionarTodo = document.getElementById('select-all');

		inputsCantidad.forEach(input => {
			input.removeEventListener('change', cambioCantidad);
			input.addEventListener('change', cambioCantidad);
		});

		botonesEliminar.forEach(boton => {
			boton.removeEventListener('click', eliminarItem);
			boton.addEventListener('click', eliminarItem);
		});

		cajasSeleccion.forEach(caja => {
			caja.removeEventListener('change', cambioSeleccion);
			caja.addEventListener('change', cambioSeleccion);
		});

		if (cajaSeleccionarTodo) {
			cajaSeleccionarTodo.removeEventListener('change', seleccionarTodo);
			cajaSeleccionarTodo.addEventListener('change', seleccionarTodo);
			const carrito = cargarCarrito();
			cajaSeleccionarTodo.checked = carrito.length > 0 && carrito.every(item => item.selected !== false);
		}
	}

	function cambioCantidad(e) {
		const id = e.target.getAttribute('data-id');
		let valor = parseInt(e.target.value, 10);
		if (isNaN(valor) || valor < 1) valor = 1;
		e.target.value = valor;

		const carrito = cargarCarrito();
		const indice = carrito.findIndex(item => String(item.id) === String(id));
		if (indice > -1) {
			carrito[indice].count = valor;
			guardarCarrito(carrito);
			renderizarCarrito();
		}
	}

	function cambioSeleccion(e) {
		const id = e.target.getAttribute('data-id');
		const marcado = e.target.checked;
		const carrito = cargarCarrito();
		const indice = carrito.findIndex(item => String(item.id) === String(id));
		if (indice > -1) {
			carrito[indice].selected = marcado;
			guardarCarrito(carrito);
			renderizarCarrito();
		}
	}

	function seleccionarTodo(e) {
		const marcado = e.target.checked;
		const carrito = cargarCarrito();
		const carritoActualizado = carrito.map(item => (Object.assign({}, item, { selected: marcado })));
		guardarCarrito(carritoActualizado);
		renderizarCarrito();
	}

	function eliminarItem(e) {
		const id = e.currentTarget.getAttribute('data-id');
		let carrito = cargarCarrito();
		carrito = carrito.filter(item => String(item.id) !== String(id));
		guardarCarrito(carrito);
		renderizarCarrito();
	}

	botonFinalizar && botonFinalizar.addEventListener('click', function () {
		const carrito = cargarCarrito();
		if (!carrito || carrito.length === 0) return;

		const seleccionados = carrito.filter(item => item && item.selected !== false);
		if (!seleccionados || seleccionados.length === 0) {
			alert('Seleccione al menos un producto para comprar.');
			return;
		}

		try {
			const comprasPrevias = localStorage.getItem('purchases');
			const compras = comprasPrevias ? JSON.parse(comprasPrevias) : [];
			const marcaTiempo = new Date().toISOString();
			
			function obtenerDescuentoParaCompra() {
				try {
					const datosPerfilGuardado = localStorage.getItem('perfilUsuario');
					if (!datosPerfilGuardado) return { porcentaje: 0, razon: null };
					const perfil = JSON.parse(datosPerfilGuardado);
					if (!perfil || !perfil.birthdate) return { porcentaje: 0, razon: null };
					const fechaNacimiento = new Date(perfil.birthdate);
					if (isNaN(fechaNacimiento.getTime())) return { porcentaje: 0, razon: null };
					const hoy = new Date();
					const nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
					if (fechaNacimiento.getDate() === hoy.getDate() && fechaNacimiento.getMonth() === hoy.getMonth()) {
						return { porcentaje: 10, razon: `Descuento por cumpleaños (${nombresMeses[fechaNacimiento.getMonth()]} ${fechaNacimiento.getDate()})` };
					}
					const porcentajeMes = (fechaNacimiento.getMonth() + 1);
					return { porcentaje: porcentajeMes, razon: `Descuento por mes de nacimiento (${nombresMeses[fechaNacimiento.getMonth()]})` };
				} catch (e) { return { porcentaje: 0, razon: null }; }
			}
			
			const metadatosDescuento = obtenerDescuentoParaCompra();
			const itemsGuardar = seleccionados.map(item => Object.assign({}, item, { 
				purchasedAt: marcaTiempo, 
				orderDiscountPercent: metadatosDescuento.porcentaje || 0, 
				orderDiscountReason: metadatosDescuento.razon || null 
			}));
			const comprasFusion = Array.isArray(compras) ? compras.concat(itemsGuardar) : itemsGuardar;
			localStorage.setItem('purchases', JSON.stringify(comprasFusion));

			try {
				const descuento = metadatosDescuento || { porcentaje: 0, razon: null };
				const subtotal = seleccionados.reduce((suma, item) => suma + (Number(item.unitCost || 0) * Number(item.count || 0)), 0);
				const montoDescuento = Math.round((subtotal * (descuento.porcentaje || 0)) / 100);
				const totalDespuesDescuento = subtotal - montoDescuento;
				
				try {
					localStorage.setItem('lastPurchaseSummary', JSON.stringify({ 
						subtotal, 
						montoDescuento, 
						totalDespuesDescuento, 
						descuento 
					}));
				} catch (err) { /* ignorar errores de storage */ }
			} catch (e) { /* ignorar */ }
		} catch (e) {
			alert('Ocurrió un error al procesar la compra. Intente nuevamente.');
			return;
		}

		const restantes = carrito.filter(item => !(item && item.selected !== false));
		guardarCarrito(restantes);

		try {
			const totalRestantes = Array.isArray(restantes) ? restantes.reduce((suma, item) => suma + (Number(item.count || 0)), 0) : 0;
			document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total: totalRestantes } }));
		} catch (e) { /* ignorar */ }

		renderizarCarrito();
		window.location.href = "index.html";
	});

	renderizarCarrito();
});


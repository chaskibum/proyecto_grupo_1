document.addEventListener('DOMContentLoaded', function () {
    const contenedor = document.getElementById('historial-container');
    const mensajeVacio = document.getElementById('no-purchases');

    // Cargar historial de compras del usuario activo
    function cargarCompras() {
        try {
            const usuario = localStorage.getItem('usuarioActivo');
            let datos = null;
            if (usuario) datos = localStorage.getItem(`purchases_${usuario}`);
            if (!datos) datos = localStorage.getItem('purchases');
            const parseado = datos ? JSON.parse(datos) : [];
            return Array.isArray(parseado) ? parseado : [];
        } catch (error) {
            return [];
        }
    }

    // Formatear fecha ISO a formato legible
    function formatearFecha(iso) {
        try {
            const fecha = new Date(iso);
            return fecha.toLocaleString();
        } catch (error) { 
            return iso; 
        }
    }

    // Renderizar historial de compras agrupado por fecha
    function renderizar() {
        const compras = cargarCompras();
        if (!contenedor) return;
        contenedor.innerHTML = '';

        if (!compras || compras.length === 0) {
            if (mensajeVacio) mensajeVacio.textContent = 'No has realizado compras aún.';
            return;
        }

        // Agrupar compras por fecha de compra
        const grupos = {};
        compras.forEach(item => {
            const clave = item.purchasedAt || 'unknown';
            if (!grupos[clave]) grupos[clave] = [];
            grupos[clave].push(item);
        });

        // Ordenar fechas de más reciente a más antigua
        const claves = Object.keys(grupos).sort((a, b) => new Date(b) - new Date(a));

        claves.forEach(clave => {
            const fechaMostrada = (clave === 'unknown') ? 'Fecha desconocida' : formatearFecha(clave);
            const items = grupos[clave];
            
            // Calcular totales para esta compra
            const subtotal = items.reduce((suma, item) => suma + (Number(item.unitCost || 0) * Number(item.count || 0)), 0);
            const totalDescuento = items.reduce((suma, item) => suma + ((Number(item.unitCost || 0) * Number(item.count || 0)) * (Number(item.orderDiscountPercent || 0) / 100)), 0);
            const totalFinal = subtotal - totalDescuento;
            const moneda = (items[0] && items[0].currency) ? (items[0].currency + ' ') : '';

            // Crear tarjeta de compra
            const tarjeta = document.createElement('div');
            tarjeta.className = 'card mb-3 purchase-card';
            const cuerpo = document.createElement('div');
            cuerpo.className = 'card-body';

            cuerpo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <strong>Compra</strong>
                <div class="text-muted small">${fechaMostrada}</div>
              </div>
              <div class="fw-bold">${moneda}${new Intl.NumberFormat('es-AR').format(totalFinal)}</div>
            </div>
            `;

            const lista = document.createElement('div');
            lista.className = 'list-group list-group-flush';

            // Renderizar cada producto de la compra
            items.forEach(item => {
                const fila = document.createElement('div');
                fila.className = 'list-group-item d-flex align-items-center';
                const nombre = item.name || 'Artículo';
                const cantidad = Number(item.count || 1);
                const unitario = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format(item.unitCost || 0);
                const subtotalItem = (item.currency ? item.currency + ' ' : '') + new Intl.NumberFormat('es-AR').format((Number(item.unitCost || 0) * cantidad));

                fila.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="" class="me-3 purchase-img">
                <div class="flex-grow-1">
                    <div class="fw-bold">${nombre}</div>
                    <div class="text-muted small">${unitario} x ${cantidad}</div>
                </div>
                <div class="fw-bold text-end ms-3">${subtotalItem}</div>
                `;

                lista.appendChild(fila);
            });

            // Mostrar descuentos aplicados si existen
            if (totalDescuento > 0) {
                const conjuntoPorcentajes = new Set(items.map(i => Number(i.orderDiscountPercent || 0)));
                const conjuntoRazones = new Set(items.map(i => i.orderDiscountReason || ''));
                const porcentajeUniforme = conjuntoPorcentajes.size === 1 ? Array.from(conjuntoPorcentajes)[0] : null;
                const razonUniforme = conjuntoRazones.size === 1 ? Array.from(conjuntoRazones)[0] : null;

                const filaDescuento = document.createElement('div');
                filaDescuento.className = 'd-flex justify-content-between align-items-center mt-2 small text-muted';
                const izquierda = document.createElement('div');
                izquierda.innerHTML = `<div>Descuento${razonUniforme ? '' : ' (varios)'}</div>${razonUniforme ? `<div class="text-muted small">${razonUniforme}</div>` : ''}`;
                const derecha = document.createElement('div');
                const descuentoFormateado = new Intl.NumberFormat('es-AR').format(Math.round(totalDescuento));
                derecha.innerHTML = `- ${moneda}${descuentoFormateado}${porcentajeUniforme ? ` (${porcentajeUniforme}%)` : ''}`;
                filaDescuento.appendChild(izquierda);
                filaDescuento.appendChild(derecha);
                cuerpo.appendChild(filaDescuento);
            }

            // Mostrar subtotal de la compra
            const pie = document.createElement('div');
            pie.className = 'd-flex justify-content-between align-items-center mt-3';
            pie.innerHTML = `<div class="text-muted small">Subtotal</div><div class="fw-bold">${moneda}${new Intl.NumberFormat('es-AR').format(subtotal)}</div>`;
            cuerpo.appendChild(pie);

            cuerpo.appendChild(lista);
            tarjeta.appendChild(cuerpo);
            contenedor.appendChild(tarjeta);
        });
    }

    renderizar();

    // Actualizar historial si cambian las compras en otra pestaña
    window.addEventListener('storage', function (evento) {
        if (!evento.key) return;
        if (evento.key === 'purchases' || evento.key === 'cart' || evento.key.startsWith('purchases_') || evento.key.startsWith('cart_')) renderizar();
    });
});

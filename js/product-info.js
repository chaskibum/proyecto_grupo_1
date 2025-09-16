document.addEventListener('DOMContentLoaded', async function () {
	//  sacamos el id del producto desde la URL
	const params = new URLSearchParams(window.location.search);
	const productId = params.get('id');
	if (!productId) {
		document.getElementById('product-info-container').innerHTML = '<div class="alert alert-warning">No se encontró el producto.</div>';
		return;
	}

	// sacamos la categoria
	const catID = localStorage.getItem('catID') || '101';
	const url = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;
	try {
		const res = await fetch(url);
		const data = await res.json();
		const products = Array.isArray(data.products) ? data.products : [];
		const product = products.find(p => p.id == productId);
		if (!product) {
			document.getElementById('product-info-container').innerHTML = '<div class="alert alert-warning">Producto no encontrado.</div>';
			return;
		}
		document.getElementById('product-info-container').innerHTML = `
			<div class="row">
				<div class="col-md-5">
					<img src="${product.image}" class="img-fluid mb-3" alt="${product.name}">
				</div>
				<div class="col-md-7">
					<h3>${product.name}</h3>
					<p>${product.description}</p>
					<p><b>${product.currency} ${product.cost}</b></p>
					<p><span class="text-warning">${'★'.repeat(product.soldCount > 80 ? 5 : product.soldCount > 50 ? 4 : product.soldCount > 30 ? 3 : product.soldCount > 15 ? 2 : 1)}</span> <span class="text-muted">${product.soldCount} vendidos</span></p>
					<div class="mt-3">
					  <button id="button-añadir-carro" class="btn btn-success"><i class="fa fa-shopping-cart"></i> Añadir al carro</button>
					</div>
				</div>
			</div>
		`;
	} catch (e) {
		document.getElementById('product-info-container').innerHTML = '<div class="alert alert-danger">Error al cargar el producto.</div>';
	}
});


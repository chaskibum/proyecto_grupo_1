if (!localStorage.getItem("sesionActiva")) {
    window.location.href = "login.html";
}
fetch("https://japceibal.github.io/emercado-api/cats_products/101.json")
    .then(response => response.json())
    .then(data => {
        const products = data.products;
        const container = document.getElementById("products-container");
        container.innerHTML = "";
        products.forEach(product => {
            const col = document.createElement("div");
            col.className = "col-md-3 mb-4";
            col.innerHTML = `
                <div class="card h-100 shadow-sm custom-card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title mb-2">${product.name}</h5>
                        <p class="card-text mb-1"><b>$${product.currency === 'USD' ? product.cost : product.cost}</b></p>
                        <div class="mb-2">
                            <span class="text-warning">${'★'.repeat(product.soldCount > 200 ? 5 : product.soldCount > 100 ? 4 : 3)}</span>
                            <span class="text-muted">${product.soldCount} vendidos</span>
                        </div>
                        <button class="btn btn-dark mt-auto"><i class="fa fa-plus"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });
    })
    .catch(error => {
        console.error('Error al obtener los datos:', error);
    });
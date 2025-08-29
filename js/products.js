document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem("sesionActiva")) {
        window.location.href = "login.html";
        return;
    }
    fetch("https://japceibal.github.io/emercado-api/cats_products/101.json")
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            const container = document.getElementById("products-container");
            container.innerHTML = "";
            products.forEach(product => {
                const col = document.createElement("div");
                col.className = "col-12 col-sm-6 col-md-4 col-lg-3";
                col.innerHTML = `
                    <div class="card h-100 shadow-sm custom-card" title="${product.description}">
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

            if(window.innerWidth < 1000) {
                const cards = container.querySelectorAll('.custom-card')
                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        let tooltip = document.createElement('span');
                        tooltip.className = 'tooltip-cel';
                        tooltip.innerText = card.getAttribute('title');
                        card.appendChild(tooltip);
                        setTimeout(() => tooltip.remove(), 4000);
                    });
                });

            }

        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
        });
});
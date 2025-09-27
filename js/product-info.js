document.addEventListener('DOMContentLoaded', async function () {
    // Arreglo manual de imágenes relacionadas por producto
    const imagenesRelacionadas = {
        50921: ["img/prod50921_1.jpg", "img/prod50921_2.jpg", "img/prod50921_3.jpg", "img/prod50921_4.jpg"],
        50922: ["img/prod50922_1.jpg", "img/prod50922_2.jpg", "img/prod50922_3.jpg", "img/prod50922_4.jpg"],
        50923: ["img/prod50923_1.jpg", "img/prod50923_2.jpg", "img/prod50923_3.jpg", "img/prod50923_4.jpg"],
        50924: ["img/prod50924_1.jpg", "img/prod50924_2.jpg", "img/prod50924_3.jpg", "img/prod50924_4.jpg"],
        50925: ["img/prod50925_1.jpg", "img/prod50925_2.jpg", "img/prod50925_3.jpg", "img/prod50925_4.jpg"]
    };

    // Sacamos el id del producto desde la URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) {
        document.getElementById('product-info-container').innerHTML = '<div class="alert alert-warning">No se encontró el producto.</div>';
        return;
    }

    // Sacamos la categoría
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

        // Mostrar una imagen principal y miniaturas para cambiar
        const imgs = imagenesRelacionadas[product.id] || [product.image];
        let imagenPrincipal = imgs[0];
        let miniaturasHtml = imgs.map((img, idx) =>
            `<img src="${img}" class="img-thumbnail img-miniatura" data-idx="${idx}" style="max-width: 60px; margin-right: 5px; cursor:pointer;" alt="${product.name}">`
        ).join('');

        let imagenesHtml = `
            <div id="imagen-principal-container">
                <img id="imagen-principal" src="${imagenPrincipal}" class="img-fluid mb-3" style="max-width: 100%;" alt="${product.name}">
            </div>
            <div id="miniaturas-container">${miniaturasHtml}</div>
        `;

        document.getElementById('product-info-container').innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    ${imagenesHtml}
                </div>
                <div class="col-md-7">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p><b>${product.currency} ${product.cost}</b></p>
                    <p id="estrellass" class="mb-1"></p>
                    <div class="mt-3">
                        <button id="button-añadir-carro" class="btn btn-success"><i class="fa fa-shopping-cart"></i> Añadir al carro</button>
                    </div>
                </div>
            </div>
        `;

        // Evento para cambiar imagen principal al hacer clic en miniatura
        document.querySelectorAll('.img-miniatura').forEach(mini => {
            mini.addEventListener('click', function () {
                const idx = this.getAttribute('data-idx');
                document.getElementById('imagen-principal').src = imgs[idx];
            });
        });

        const conteinerRelacionados = document.getElementById('prod-relacionados');
        conteinerRelacionados.innerHTML = '';
        const prodRelacionados = products.filter(p => p.id != productId).slice(0, 4);

        prodRelacionados.forEach(rel => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-3';
            col.innerHTML = `
                <div class="card h-100 card-prod-rel" style="cursor:pointer" data-id="${rel.id}">
                    <img src="${rel.image}" class="card-img-top" alt="${rel.name}">
                    <div class="card-body">
                        <h5 class="card-title">${rel.name}</h5>
                        <p class="card-text">${rel.currency} ${rel.cost}</p>
                    </div>
                </div>
            `;
            conteinerRelacionados.appendChild(col);
        });

        document.querySelectorAll('.card-prod-rel').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                window.location.search = `?id=${id}`;
            });
        });

     

		/* Comentarios y puntuacion (Visual)*/
        const estrellas = document.querySelectorAll('.puntuacion-estrellas i');
        const puntuacionNum = document.getElementById('puntuacion-num');
        const puntuacionText = document.getElementById('puntuacion-text');
        const labels = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
        let seleccion = 0;

        function actualizarEstrellas(valor) {
            estrellas.forEach(e => {
                if (e.getAttribute('data-value') <= valor) {
                    e.classList.add('bi-star-fill');
                    e.classList.remove('bi-star');
                } else {
                    e.classList.add('bi-star');
                    e.classList.remove('bi-star-fill');
                }
            });
            puntuacionNum.textContent = valor + ' / 5';
            puntuacionText.textContent = valor ? labels[valor - 1] : '';
        }

        estrellas.forEach(estrella => {
            estrella.addEventListener('mouseenter', () => {
                const valor = parseInt(estrella.getAttribute('data-value'));
                estrellas.forEach(e => {
                    if (parseInt(e.getAttribute('data-value')) <= valor) {
                        e.classList.add('bi-star-fill');
                        e.classList.remove('bi-star');
                    } else if (parseInt(e.getAttribute('data-value')) > seleccion) {
                        e.classList.add('bi-star');
                        e.classList.remove('bi-star-fill');
                    }
                });
            });

            estrella.addEventListener('mouseleave', () => actualizarEstrellas(seleccion));
            estrella.addEventListener('click', () => {
                seleccion = parseInt(estrella.getAttribute('data-value'));
                actualizarEstrellas(seleccion);
            });
        });

    /*----------------------------------------------------------*/

      
        const btnEnviar = document.getElementById('btn-enviar-comentario');
        const comentarioInput = document.getElementById('comentario-input');
        const comentariosLista = document.getElementById('comentarios-list');
        let comentarios = JSON.parse(localStorage.getItem(`comentarios_${productId}`)) || [];


        function mostrarComentarios() {
         let html = '';

        // cambio de orden de mostrar comentarios, de mas recientes a mas antiguos 

        for (let i = comentarios.length - 1; i >= 0; i--) {
         const c = comentarios[i];
            let estrellasHTML = '';
        for (let j = 0; j < c.estrellas; j++) {
            estrellasHTML += '<i class="bi bi-star-fill text-warning"></i> ';
            }
        html += `<div class="mb-2"><strong>${c.nombre}</strong> ${estrellasHTML}<br>${c.texto}</div>`;
    }
    comentariosLista.innerHTML = html;
}
		
        mostrarComentarios();

        btnEnviar.addEventListener('click', () => {
            const estrellasSeleccionadas = document.querySelectorAll('.puntuacion-estrellas i.bi-star-fill').length;
            const texto = comentarioInput.value.trim();

            if (!texto) {
                alert('Escribí un comentario antes de enviar.');
                return;
            }

            if (estrellasSeleccionadas === 0) {
                alert('Seleccionar una puntuación antes de enviar.');
                return;
            }

            const usuario = localStorage.getItem('usuarioActivo') || "Anónimo";

            comentarios.push({
                nombre: usuario,
                texto: texto,
                estrellas: estrellasSeleccionadas
            });

			 // Guarda los comentarios en el local
            localStorage.setItem(`comentarios_${productId}`, JSON.stringify(comentarios));

            mostrarComentarios(); 

            // Limpiar input y estrellas
            comentarioInput.value = '';
            seleccion = 0;
            actualizarEstrellas(seleccion);
        });

    } catch (e) {
        document.getElementById('product-info-container').innerHTML = '<div class="alert alert-danger">Error al cargar el producto.</div>';
    }
});
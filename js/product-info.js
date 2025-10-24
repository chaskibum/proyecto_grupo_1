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

        const contador = document.getElementById('contador-caracteres');
        const maxCaract = 100;

        comentarioInput.addEventListener('input', () => {
            let texto = comentarioInput.value;
            if (texto.length > maxCaract) {
                comentarioInput.value = texto.substring(0, maxCaract);
            }
            contador.textContent = `${comentarioInput.value.length}/${maxCaract}`;
        });

        const comentariosLista = document.getElementById('comentarios-list');


     

        //la API usada en el curso guarda comentarios en archivos separados bajo
        //    PRODUCT_INFO_COMMENTS_URL + <productId> + EXT_TYPE.
        try {
            if (typeof PRODUCT_INFO_COMMENTS_URL !== 'undefined' && typeof EXT_TYPE !== 'undefined') {
                const resComments = await getJSONData(PRODUCT_INFO_COMMENTS_URL + productId + EXT_TYPE);
                if (resComments.status === 'ok' && resComments.data) {
                    let src = [];
                    if (Array.isArray(resComments.data)) src = resComments.data;
                    else if (Array.isArray(resComments.data.comments)) src = resComments.data.comments;
                    if (src.length) {
                        comentariosDesdeJson = comentariosDesdeJson.concat(src.map(mapExternalComment));
                    }
                }
            }
        } catch (err) {
            console.warn('No se pudieron cargar comentarios externos:', err);
        }

        // Comentarios guardados localmente por este usuario/sesión (tienen preferencia o se añaden)
        const comentariosLocales = JSON.parse(localStorage.getItem(`comentarios_${productId}`)) || [];

  


        function tiempoComentario(fechaISO) {
            const fecha = new Date(fechaISO);
            const ahora = new Date();
            const diffSeg = Math.floor((ahora - fecha) / 1000);
            if (diffSeg < 60) return `${diffSeg} seg`;
            const diffMin = Math.floor(diffSeg / 60);
            if (diffMin < 60) return `${diffMin} min`;
            const diffHrs = Math.floor(diffMin / 60);
            if (diffHrs < 24) return `${diffHrs} hs`;
            const diffDias = Math.floor(diffHrs / 24);
            if (diffDias < 7) return `${diffDias} días`;
            const diffSem = Math.floor(diffDias / 7);
            if (diffSem < 4) return `${diffSem} sem`;
            const diffMes = Math.floor(diffDias / 30);
            if (diffMes < 12) return `${diffMes} meses`;
            return `${Math.floor(diffDias/365)} años`;
        }


        function mostrarComentarios() {

         let html = '';


        for (let i = comentarios.length - 1; i >= 0; i--) {
         const c = comentarios[i];
            let estrellasHTML = '';
        for (let j = 0; j < c.estrellas; j++) {
            estrellasHTML += '<i class="bi bi-star-fill text-warning"></i> ';
            }

            const usuarioAct = c.nombre === localStorage.getItem('usuarioActivo');
            const usuario = localStorage.getItem('usuarioActivo');
            const votoUsuario = c.votos?.[usuario] || null;

            c.likes = c.likes || 0;
            c.dislikes = c.dislikes || 0;

        html += `

        <div class="position-relative d-flex align-items-start mb-3 p-2 border rounded comentario-item" data-idx="${i}">

        ${ usuarioAct ? `<i class="bi bi-trash-fill text-dark position-absolute top-0 end-0 m-2 btn-eliminar" data-idx="${i}" role="button" title="Eliminar" style="cursor:pointer; font-size:1.1rem;"></i>` : '' }


        <div class="me-2" style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
        ${
            (localStorage.getItem('fotoPerfil_' + (c.nombre || '')) && c.nombre)
            ? `<img src="${localStorage.getItem('fotoPerfil_' + c.nombre)}" 
            style="width: 100%; height: 100%; object-fit: cover;">`
            : `<i class="bi bi-person-circle fs-3 text-secondary"></i>`
        }
        </div>

        <div class="mb-2">
        <strong>${c.nombre}</strong> ${estrellasHTML}
        <small class="text-muted">(${tiempoComentario(c.fecha)})</small><br>
        ${c.texto}

        <div class="mt-2 d-flex align-items-center gap-2">
     
        <i class="bi ${votoUsuario === 'like' ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'} btn-like" data-idx="${i}" style="cursor:pointer;"></i>
        <span id="like-num-${i}">${c.likes}</span>

        <i class="bi ${votoUsuario === 'dislike' ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'} ms-2 btn-dislike" data-idx="${i}" style="cursor:pointer;"></i>
        <span id="dislike-num-${i}">${c.dislikes}</span>

        </div>
        </div>


        </div>`;
    }
    comentariosLista.innerHTML = html;


    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
             if (confirm('¿Estás seguro de querer eliminar este comentario?')) {
                comentarios.splice(idx, 1);
                localStorage.setItem(`comentarios_${productId}`, JSON.stringify(comentarios));
                mostrarComentarios();
             }
            });
        });

    document.querySelectorAll('.btn-like').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            const usuario = localStorage.getItem('usuarioActivo');
            if (!comentarios[idx].votos) comentarios[idx].votos = {};
            if (comentarios[idx].votos[usuario] === 'dislike') {
                comentarios[idx].dislikes--;
            }
            if (comentarios[idx].votos[usuario] === 'like') {
                comentarios[idx].likes--;
                comentarios[idx].votos[usuario] = null;
            } else {
                comentarios[idx].likes++;
                comentarios[idx].votos[usuario] = 'like';
            }
            localStorage.setItem(`comentarios_${productId}`, JSON.stringify(comentarios));
            mostrarComentarios();
        });
    });

    document.querySelectorAll('.btn-dislike').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            const usuario = localStorage.getItem('usuarioActivo');
            if (!comentarios[idx].votos) comentarios[idx].votos = {};
            if (comentarios[idx].votos[usuario] === 'like') {
                comentarios[idx].likes--;
            }
            if (comentarios[idx].votos[usuario] === 'dislike') {
                comentarios[idx].dislikes--;
                comentarios[idx].votos[usuario] = null;
            } else {
                comentarios[idx].dislikes++;
                comentarios[idx].votos[usuario] = 'dislike';
            }
            localStorage.setItem(`comentarios_${productId}`, JSON.stringify(comentarios));
            mostrarComentarios();
        });
    });

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
                estrellas: estrellasSeleccionadas,
                fecha: new Date().toISOString(),
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
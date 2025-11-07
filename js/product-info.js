document.addEventListener('DOMContentLoaded', async function () {
    // Mapeo de imágenes adicionales para productos específicos
    const imagenesRelacionadas = {
        50921: ["img/prod50921_1.jpg", "img/prod50921_2.jpg", "img/prod50921_3.jpg", "img/prod50921_4.jpg"],
        50922: ["img/prod50922_1.jpg", "img/prod50922_2.jpg", "img/prod50922_3.jpg", "img/prod50922_4.jpg"],
        50923: ["img/prod50923_1.jpg", "img/prod50923_2.jpg", "img/prod50923_3.jpg", "img/prod50923_4.jpg"],
        50924: ["img/prod50924_1.jpg", "img/prod50924_2.jpg", "img/prod50924_3.jpg", "img/prod50924_4.jpg"],
        50925: ["img/prod50925_1.jpg", "img/prod50925_2.jpg", "img/prod50925_3.jpg", "img/prod50925_4.jpg"]
    };

    // Obtener ID del producto desde la URL
    const parametros = new URLSearchParams(window.location.search);
    const idProducto = parametros.get('id');
    if (!idProducto) {
        document.getElementById('product-info-container').innerHTML = '<div class="alert alert-warning">No se encontró el producto.</div>';
        return;
    }

    // Cargar datos del producto desde la API
    const catID = localStorage.getItem('catID') || '101';
    const url = `https://japceibal.github.io/emercado-api/cats_products/${catID}.json`;

    try {
        let respuestaDatos = await getJSONData(url);
        let datos = (respuestaDatos && respuestaDatos.status === 'ok') ? respuestaDatos.data : null;
        let productos = Array.isArray(datos?.products) ? datos.products : [];
        let producto = productos.find(p => p.id == idProducto);

        // Si no se encuentra en la categoría, intentar cargar producto individual
        if (!producto) {
            try {
                if (typeof PRODUCT_INFO_URL !== 'undefined' && typeof EXT_TYPE !== 'undefined') {
                    const urlIndividual = PRODUCT_INFO_URL + idProducto + EXT_TYPE;
                    const respuestaIndividual = await getJSONData(urlIndividual);
                    if (respuestaIndividual.status === 'ok' && respuestaIndividual.data) {
                        const individual = respuestaIndividual.data;
                        producto = individual.product || individual;
                    }
                }
            } catch (e) {
            }
        }

        if (!producto) {
            document.getElementById('product-info-container').innerHTML = '<div class="alert alert-warning">Producto no encontrado.</div>';
            return;
        }

        // Preparar galería de imágenes del producto
        const imagenes = imagenesRelacionadas[producto.id] || [producto.image];
        let imagenPrincipal = imagenes[0];
        let miniaturasHtml = imagenes.map((img, indice) =>
            `<img src="${img}" class="img-thumbnail img-miniatura" data-idx="${indice}" style="max-width: 60px; margin-right: 5px; cursor:pointer;" alt="${producto.name}">`
        ).join('');

        // Renderizar HTML con imagen principal y miniaturas
        let imagenesHtml = `
            <div id="imagen-principal-container">
                <img id="imagen-principal" src="${imagenPrincipal}" class="img-fluid mb-3" style="max-width: 100%;" alt="${producto.name}">
            </div>
            <div id="miniaturas-container">${miniaturasHtml}</div>
        `;

        // Insertar información del producto en el contenedor
        document.getElementById('product-info-container').innerHTML = `
            <div class="row">
                <div class="col-md-5">
                    ${imagenesHtml}
                </div>
                <div class="col-md-7">
                    <h3>${producto.name}</h3>
                    <p>${producto.description}</p>
                    <p><b>${producto.currency} ${producto.cost}</b></p>
                    <p id="estrellass" class="mb-1"></p>
                    <div class="mt-3">
                        <button id="button-añadir-carro" class="btn btn-success"><i class="fa fa-shopping-cart"></i> Añadir al carro</button>
                    </div>
                </div>
            </div>
        `;

        // Añadir eventos click a las miniaturas para cambiar imagen principal
        document.querySelectorAll('.img-miniatura').forEach(miniatura => {
            miniatura.addEventListener('click', function () {
                const indice = this.getAttribute('data-idx');
                document.getElementById('imagen-principal').src = imagenes[indice];
            });
        });

        // Añadir producto al carrito al hacer click en el botón
        const botonAñadir = document.getElementById('button-añadir-carro');
        if (botonAñadir) {
            botonAñadir.addEventListener('click', () => {
                try {
                    const CLAVE_ALMACENAMIENTO = 'cart';
                    const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);
                    const carrito = Array.isArray(JSON.parse(datos)) ? JSON.parse(datos) : [];

                    // Si el producto ya existe, incrementar cantidad
                    const existente = carrito.find(item => String(item.id) === String(producto.id));
                    if (existente) {
                        existente.count = (existente.count || 1) + 1;
                    } else {
                        // Si no existe, añadir nuevo item al carrito
                        const imagenItem = (producto.images && producto.images.length) ? producto.images[0] : producto.image;
                        carrito.push({
                            id: producto.id,
                            name: producto.name,
                            count: 1,
                            unitCost: producto.cost,
                            currency: producto.currency,
                            image: imagenItem
                        });
                    }

                    // Guardar carrito actualizado y redirigir
                    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(carrito));
                    try {
                        const total = Array.isArray(cart) ? cart.reduce((s, it) => s + (Number(it.count || 0)), 0) : 0;
                        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { total } }));
                    } catch (e) {
                    }
                    window.location.href = 'cart.html';
                } catch (e) {
                    alert('No se pudo añadir el producto al carrito.');
                }
            });
        }

        // Renderizar productos relacionados de la misma categoría
        const contenedorRelacionados = document.getElementById('prod-relacionados');
        contenedorRelacionados.innerHTML = '';
        const productosRelacionados = productos.filter(p => p.id != idProducto).slice(0, 4);

        productosRelacionados.forEach(relacionado => {
            const columna = document.createElement('div');
            columna.className = 'col-md-3 mb-3';
            columna.innerHTML = `
                <div class="card h-100 card-prod-rel" style="cursor:pointer" data-id="${relacionado.id}">
                    <img src="${relacionado.image}" class="card-img-top" alt="${relacionado.name}">
                    <div class="card-body">
                        <h5 class="card-title">${relacionado.name}</h5>
                        <p class="card-text">${relacionado.currency} ${relacionado.cost}</p>
                    </div>
                </div>
            `;
            contenedorRelacionados.appendChild(columna);
        });

        // Redirigir al hacer click en producto relacionado
        document.querySelectorAll('.card-prod-rel').forEach(tarjeta => {
            tarjeta.addEventListener('click', () => {
                const id = tarjeta.getAttribute('data-id');
                window.location.search = `?id=${id}`;
            });
        });

        // Sistema de calificación con estrellas
        const estrellas = document.querySelectorAll('.puntuacion-estrellas i');
        const numeroPuntuacion = document.getElementById('puntuacion-num');
        const textoPuntuacion = document.getElementById('puntuacion-text');
        const etiquetas = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];
        let seleccion = 0;

        // Actualizar visualización de estrellas según valor
        function actualizarEstrellas(valor) {
            estrellas.forEach(estrella => {
                if (estrella.getAttribute('data-value') <= valor) {
                    estrella.classList.add('bi-star-fill');
                    estrella.classList.remove('bi-star');
                } else {
                    estrella.classList.add('bi-star');
                    estrella.classList.remove('bi-star-fill');
                }
            });
            numeroPuntuacion.textContent = valor + ' / 5';
            textoPuntuacion.textContent = valor ? etiquetas[valor - 1] : '';
        }

        // Eventos hover y click en estrellas
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

        const botonEnviar = document.getElementById('btn-enviar-comentario');
        const inputComentario = document.getElementById('comentario-input');

        // Limitar caracteres en el campo de comentario
        const contador = document.getElementById('contador-caracteres');
        const maxCaracteres = 100;

        inputComentario.addEventListener('input', () => {
            let texto = inputComentario.value;
            if (texto.length > maxCaracteres) {
                inputComentario.value = texto.substring(0, maxCaracteres);
            }
            contador.textContent = `${inputComentario.value.length}/${maxCaracteres}`;
        });

        const listaComentarios = document.getElementById('comentarios-list');

        // Mapear comentarios externos al formato interno
        function mapearComentarioExterno(comentario) {
            return {
                nombre: comentario.user || comentario.usuario || comentario.nombre || 'Anónimo',
                texto: comentario.description || comentario.descripcion || comentario.texto || '',
                estrellas: comentario.score || comentario.puntaje || comentario.estrellas || 0,
                fecha: comentario.dateTime || comentario.fecha || new Date().toISOString(),
                likes: comentario.likes || 0,
                dislikes: comentario.dislikes || 0,
                votos: comentario.votos || {}
            };
        }

        // Cargar comentarios del producto desde JSON
        let comentariosDesdeJson = Array.isArray(producto.comments) ? producto.comments.map(mapearComentarioExterno) : [];

        try {
            if (typeof PRODUCT_INFO_COMMENTS_URL !== 'undefined' && typeof EXT_TYPE !== 'undefined') {
                const respuestaComentarios = await getJSONData(PRODUCT_INFO_COMMENTS_URL + idProducto + EXT_TYPE);
                if (respuestaComentarios.status === 'ok' && respuestaComentarios.data) {
                    let fuente = [];
                    if (Array.isArray(respuestaComentarios.data)) fuente = respuestaComentarios.data;
                    else if (Array.isArray(respuestaComentarios.data.comments)) fuente = respuestaComentarios.data.comments;
                    if (fuente.length) {
                        comentariosDesdeJson = comentariosDesdeJson.concat(fuente.map(mapearComentarioExterno));
                    }
                }
            }
        } catch (err) {
        }

        // Combinar comentarios JSON con comentarios guardados localmente
        const comentariosLocales = JSON.parse(localStorage.getItem(`comentarios_${idProducto}`)) || [];

        const vistos = new Set();
        const combinados = [];
        comentariosDesdeJson.concat(comentariosLocales).forEach(comentario => {
            const clave = `${comentario.nombre}|${comentario.texto}|${comentario.fecha}`;
            if (!vistos.has(clave)) {
                vistos.add(clave);
                comentario.likes = comentario.likes || 0;
                comentario.dislikes = comentario.dislikes || 0;
                comentario.votos = comentario.votos || {};
                combinados.push(comentario);
            }
        });

        let comentarios = combinados;

        // Calcular tiempo transcurrido desde el comentario
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

        // Renderizar lista de comentarios en orden inverso (más recientes primero)
        function mostrarComentarios() {
            let html = '';

            for (let i = comentarios.length - 1; i >= 0; i--) {
                const comentario = comentarios[i];
                let estrellasHTML = '';
                for (let j = 0; j < comentario.estrellas; j++) {
                    estrellasHTML += '<i class="bi bi-star-fill text-warning"></i> ';
                }

                const usuarioAct = comentario.nombre === localStorage.getItem('usuarioActivo');
                const usuario = localStorage.getItem('usuarioActivo');
                const votoUsuario = comentario.votos?.[usuario] || null;

                comentario.likes = comentario.likes || 0;
                comentario.dislikes = comentario.dislikes || 0;

                html += `
                <div class="position-relative d-flex align-items-start mb-3 p-2 border rounded comentario-item" data-idx="${i}">
                ${ usuarioAct ? `<i class="bi bi-trash-fill text-dark position-absolute top-0 end-0 m-2 btn-eliminar" data-idx="${i}" role="button" title="Eliminar" style="cursor:pointer; font-size:1.1rem;"></i>` : '' }

                <div class="me-2" style="width: 45px; height: 45px; border-radius: 50%; overflow: hidden; flex-shrink: 0;">
                ${
                    (localStorage.getItem('fotoPerfil_' + (comentario.nombre || '')) && comentario.nombre)
                    ? `<img src="${localStorage.getItem('fotoPerfil_' + comentario.nombre)}" 
                    style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<i class="bi bi-person-circle fs-3 text-secondary"></i>`
                }
                </div>

                <div class="mb-2">
                <strong>${comentario.nombre}</strong> ${estrellasHTML}
                <small class="text-muted">(${tiempoComentario(comentario.fecha)})</small><br>
                ${comentario.texto}

                <div class="mt-2 d-flex align-items-center gap-2">
                <i class="bi ${votoUsuario === 'like' ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'} btn-like" data-idx="${i}" style="cursor:pointer;"></i>
                <span id="like-num-${i}">${comentario.likes}</span>

                <i class="bi ${votoUsuario === 'dislike' ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'} ms-2 btn-dislike" data-idx="${i}" style="cursor:pointer;"></i>
                <span id="dislike-num-${i}">${comentario.dislikes}</span>
                </div>
                </div>
                </div>`;
            }
            listaComentarios.innerHTML = html;

            // Permitir eliminar comentario propio
            document.querySelectorAll('.btn-eliminar').forEach(boton => {
                boton.addEventListener('click', evento => {
                    const indice = parseInt(evento.currentTarget.getAttribute('data-idx'));
                    if (confirm('¿Estás seguro de querer eliminar este comentario?')) {
                        comentarios.splice(indice, 1);
                        localStorage.setItem(`comentarios_${idProducto}`, JSON.stringify(comentarios));
                        mostrarComentarios();
                    }
                });
            });

            // Manejar likes en comentarios
            document.querySelectorAll('.btn-like').forEach(boton => {
                boton.addEventListener('click', evento => {
                    const indice = parseInt(evento.currentTarget.getAttribute('data-idx'));
                    const usuario = localStorage.getItem('usuarioActivo');
                    if (!comentarios[indice].votos) comentarios[indice].votos = {};
                    if (comentarios[indice].votos[usuario] === 'dislike') {
                        comentarios[indice].dislikes--;
                    }
                    if (comentarios[indice].votos[usuario] === 'like') {
                        comentarios[indice].likes--;
                        comentarios[indice].votos[usuario] = null;
                    } else {
                        comentarios[indice].likes++;
                        comentarios[indice].votos[usuario] = 'like';
                    }
                    localStorage.setItem(`comentarios_${idProducto}`, JSON.stringify(comentarios));
                    mostrarComentarios();
                });
            });

            // Manejar dislikes en comentarios
            document.querySelectorAll('.btn-dislike').forEach(boton => {
                boton.addEventListener('click', evento => {
                    const indice = parseInt(evento.currentTarget.getAttribute('data-idx'));
                    const usuario = localStorage.getItem('usuarioActivo');
                    if (!comentarios[indice].votos) comentarios[indice].votos = {};
                    if (comentarios[indice].votos[usuario] === 'like') {
                        comentarios[indice].likes--;
                    }
                    if (comentarios[indice].votos[usuario] === 'dislike') {
                        comentarios[indice].dislikes--;
                        comentarios[indice].votos[usuario] = null;
                    } else {
                        comentarios[indice].dislikes++;
                        comentarios[indice].votos[usuario] = 'dislike';
                    }
                    localStorage.setItem(`comentarios_${idProducto}`, JSON.stringify(comentarios));
                    mostrarComentarios();
                });
            });
        }
		
        mostrarComentarios();

        // Enviar nuevo comentario al producto
        botonEnviar.addEventListener('click', () => {
            const estrellasSeleccionadas = document.querySelectorAll('.puntuacion-estrellas i.bi-star-fill').length;
            const texto = inputComentario.value.trim();

            if (!texto) {
                alert('Escribí un comentario antes de enviar.');
                return;
            }

            if (estrellasSeleccionadas === 0) {
                alert('Seleccionar una puntuación antes de enviar.');
                return;
            }

            const usuario = localStorage.getItem('usuarioActivo') || "Anónimo";

            // Añadir nuevo comentario a la lista
            comentarios.push({
                nombre: usuario,
                texto: texto,
                estrellas: estrellasSeleccionadas,
                fecha: new Date().toISOString(),
            });

            localStorage.setItem(`comentarios_${idProducto}`, JSON.stringify(comentarios));

            mostrarComentarios(); 

            // Limpiar formulario de comentario
            inputComentario.value = '';
            seleccion = 0;
            actualizarEstrellas(seleccion);
        });

    } catch (error) {
        // Mostrar mensaje de error si falla la carga del producto
        const contenedor = document.getElementById('product-info-container');
        if (contenedor) {
            contenedor.innerHTML = `<div class="alert alert-danger">Error al cargar el producto. <small class="d-block text-muted">${error && error.message ? error.message : ''}</small></div>`;
        }
    }
});
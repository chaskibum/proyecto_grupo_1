let costoProducto = 0;
let cantidadProducto = 0;
let porcentajeComision = 0.13;
let SIMBOLO_MONEDA = "$";
let MONEDA_DOLAR = "Dólares (USD)";
let MONEDA_PESO = "Pesos Uruguayos (UYU)";
let SIMBOLO_DOLAR = "USD ";
let SIMBOLO_PESO = "UYU ";
let SIMBOLO_PORCENTAJE = '%';
let MENSAJE = "FUNCIONALIDAD NO IMPLEMENTADA";

// Actualizar visualización de costos según comisión y precio
function actualizarCostosTotales() {
    let htmlCostoProducto = document.getElementById("productCostText");
    let htmlComision = document.getElementById("comissionText");
    let htmlCostoTotal = document.getElementById("totalCostText");

    let costoUnitarioMostrar = SIMBOLO_MONEDA + costoProducto;
    let comisionMostrar = Math.round((porcentajeComision * 100)) + SIMBOLO_PORCENTAJE;
    let costoTotalMostrar = SIMBOLO_MONEDA + ((Math.round(costoProducto * porcentajeComision * 100) / 100) + parseInt(costoProducto));

    htmlCostoProducto.innerHTML = costoUnitarioMostrar;
    htmlComision.innerHTML = comisionMostrar;
    htmlCostoTotal.innerHTML = costoTotalMostrar;
}

document.addEventListener("DOMContentLoaded", function (evento) {
    // Actualizar cantidad de productos
    document.getElementById("productCountInput").addEventListener("change", function () {
        cantidadProducto = this.value;
        actualizarCostosTotales();
    });

    // Actualizar costo del producto
    document.getElementById("productCostInput").addEventListener("change", function () {
        costoProducto = this.value;
        actualizarCostosTotales();
    });

    // Cambiar comisión según tipo de publicación (Gold)
    document.getElementById("goldradio").addEventListener("change", function () {
        porcentajeComision = 0.13;
        actualizarCostosTotales();
    });

    // Cambiar comisión según tipo de publicación (Premium)
    document.getElementById("premiumradio").addEventListener("change", function () {
        porcentajeComision = 0.07;
        actualizarCostosTotales();
    });

    // Cambiar comisión según tipo de publicación (Standard)
    document.getElementById("standardradio").addEventListener("change", function () {
        porcentajeComision = 0.03;
        actualizarCostosTotales();
    });

    // Cambiar símbolo de moneda
    document.getElementById("productCurrency").addEventListener("change", function () {
        if (this.value == MONEDA_DOLAR) {
            SIMBOLO_MONEDA = SIMBOLO_DOLAR;
        }
        else if (this.value == MONEDA_PESO) {
            SIMBOLO_MONEDA = SIMBOLO_PESO;
        }

        actualizarCostosTotales();
    });

    // Configurar Dropzone para subida de imágenes
    let opcionesDz = {
        url: "/",
        autoQueue: false
    };
    let miDropzone = new Dropzone("div#file-upload", opcionesDz);

    let formularioVenta = document.getElementById("sell-info");

    // Validar formulario antes de enviar
    formularioVenta.addEventListener("submit", function (evento) {
        evento.preventDefault();

        let inputNombreProducto = document.getElementById("productName");
        let categoriaProducto = document.getElementById("productCategory");
        let costoProducto = document.getElementById("productCostInput");
        let faltaInformacion = false;

        inputNombreProducto.classList.remove('is-invalid');
        categoriaProducto.classList.remove('is-invalid');
        costoProducto.classList.remove('is-invalid');

        // Validar nombre del producto
        if (inputNombreProducto.value === "") {
            inputNombreProducto.classList.add('is-invalid');
            faltaInformacion = true;
        }

        // Validar categoría del producto
        if (categoriaProducto.value === "") {
            categoriaProducto.classList.add('is-invalid');
            faltaInformacion = true;
        }

        // Validar costo del producto
        if (costoProducto.value <= 0) {
            costoProducto.classList.add('is-invalid');
            faltaInformacion = true;
        }

        // Intentar publicar producto si todos los campos son válidos
        if (!faltaInformacion) {
            getJSONData(PUBLISH_PRODUCT_URL).then(function (objetoResultado) {
                let htmlMensajeMostrar = document.getElementById("resultSpan");
                let mensajeMostrar = "";

                if (objetoResultado.status === 'ok') {
                    mensajeMostrar = MENSAJE;
                    document.getElementById("alertResult").classList.add('alert-primary');
                }
                else if (objetoResultado.status === 'error') {
                    mensajeMostrar = MENSAJE;
                    document.getElementById("alertResult").classList.add('alert-primary');
                }

                htmlMensajeMostrar.innerHTML = mensajeMostrar;
                document.getElementById("alertResult").classList.add("show");
            });
        }
    });
});
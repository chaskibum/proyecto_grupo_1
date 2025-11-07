(function () {
    const cuerpo = document.body;

    // Establecer icono del botón según estado del tema
    function establecerIcono(elementoIcono, oscuro) {
        if (!elementoIcono) return;
        elementoIcono.className = oscuro ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }

    // Aplicar tema guardado en localStorage
    function aplicarTemaDesdeAlmacenamiento() {
        const esOscuro = localStorage.getItem('theme') === 'dark';
        if (esOscuro) cuerpo.classList.add('dark-mode'); 
        else cuerpo.classList.remove('dark-mode');
        const boton = document.getElementById('oscuro');
        const icono = boton ? boton.querySelector('i') : null;
        establecerIcono(icono, esOscuro);
    }

    // Adjuntar evento click al botón de cambio de tema
    function adjuntarEscuchaBoton() {
        const boton = document.getElementById('oscuro');
        if (!boton) return;
    
        if (boton.__escuchaTemaCargada) return;
        boton.__escuchaTemaCargada = true;

        boton.addEventListener('click', function (evento) {
            evento.preventDefault();
            cuerpo.classList.toggle('dark-mode');
            const ahoraOscuro = cuerpo.classList.contains('dark-mode');
            const icono = boton.querySelector('i');
            establecerIcono(icono, ahoraOscuro);
            localStorage.setItem('theme', ahoraOscuro ? 'dark' : 'light');
        });
    }

    // Inicializar tema al cargar el DOM
    document.addEventListener('DOMContentLoaded', function () {
        aplicarTemaDesdeAlmacenamiento();
        adjuntarEscuchaBoton();
    });

    // Inicializar tema cuando el navbar está listo
    document.addEventListener('navbar:ready', function () {
        aplicarTemaDesdeAlmacenamiento();
        adjuntarEscuchaBoton();
    });

})();

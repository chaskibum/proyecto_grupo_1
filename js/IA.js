const btnAbrirChat = document.getElementById('abrirChat');
const btnCerrarChat = document.getElementById('cerrarChat');
const chatContainer = document.getElementById('chatContainer');
const btnEnviar = document.getElementById('enviarMensaje');
const inputMensaje = document.getElementById('mensajeInput');
const chatMensajes = document.getElementById('chatMensajes');

const respuestas = {
  'producto dañado': 'Lamentamos que hayas recibido un producto dañado. Contacta a soporte para solucionarlo.',
  'envíos todo el país': 'Hacemos envíos a todo Uruguay, sin importar la ciudad.',
  'métodos de pago': 'Aceptamos tarjetas, transferencias y pagos en puntos habilitados.',
  'devolver producto': 'Puedes devolver un producto dentro de 14 días si está en perfectas condiciones.',
  'horario de atención': 'Nuestro horario es de lunes a viernes de 9 a 18 hs y sábados de 10 a 14 hs.',
  'seguimiento de pedido': 'Ingresa tu número de orden en "Mis compras" para seguir tu pedido.',
  'tiempo de entrega': 'Los pedidos tardan entre 3 y 7 días hábiles, dependiendo de tu ubicación.',
  'promociones vigentes': 'Tenemos ofertas y descuentos semanales, revisa la sección "Ofertas".',
  'contacto soporte': 'Escríbenos a soporte@emercado.uy o usa este chat.',
  'garantía': 'Todos los productos tienen garantía mínima de 6 meses.',
  'cambiar dirección': 'Puedes cambiar la dirección antes de que el pedido sea despachado.',
  'producto agotado': 'Deja tu correo y te avisaremos cuando vuelva a estar disponible.',
  'tarjeta no funciona': 'Verifica que tu tarjeta esté habilitada; si falla, contacta tu banco.',
  'costo de envío': 'Se calcula automáticamente según la dirección y tamaño del pedido.',
  'ofertas especiales': 'Tenemos descuentos por temporada y códigos de descuento exclusivos.',
  'cancelar pedido': 'Puedes cancelar tu pedido antes del despacho contactando soporte.',
  'devolución por cambio': 'Se puede cambiar el producto dentro del periodo de devolución.',
  'soporte técnico': 'Nuestro equipo de soporte técnico puede ayudarte con configuraciones y dudas.',
  'productos recomendados': 'Revisa "Recomendados para ti" según tus búsquedas.',
  'factura': 'Puedes descargar la factura en "Mis compras" o solicitarla por correo.',
  'envío urgente': 'Selecciona “Entrega rápida” para recibir tu pedido antes.',
  'recoger en tienda': 'Puedes elegir la opción "Retiro en tienda" si está disponible en tu zona.',
  'horas para retirar': 'Los retiros están disponibles dentro del horario de atención del local.',
  'mercado pago': 'Sí, aceptamos Mercado Pago.',
  'promociones bancarias': 'Algunos bancos ofrecen cuotas o descuentos especiales. Revisa la sección pagos.',
  'cuotas': 'Aceptamos pagos en cuotas según las tarjetas disponibles.',
  'sin stock': 'Ese producto está sin stock actualmente, pero pronto tendremos más.',
  'cambiar producto': 'Puedes solicitar un cambio dentro del período de garantía o devolución.',
  'tarda mucho': 'Los envíos pueden retrasarse en fechas especiales o días de alto volumen.',
  'dónde está mi pedido': 'Para saber dónde está tu paquete, revisa la sección "Mis compras".',
  'no funciona': 'Lamentamos el inconveniente, por favor envíanos más detalles del problema.',
  'manual': 'Puedes encontrar manuales y guías en la descripción del producto.',
  'certificación': 'Nuestros productos cuentan con certificaciones según la normativa uruguaya.',
  'fuera del país': 'Actualmente no realizamos envíos fuera de Uruguay.',
  'qué incluye': 'En la descripción del producto está el detalle de lo que incluye la compra.',
  'precio': 'Los precios están detallados en cada producto. Cualquier variación se aplica al finalizar la compra.',
  'error pago': 'Intenta otra forma de pago o vuelve a intentarlo más tarde.',
  'cupón': 'Si tienes un cupón, ingrésalo al finalizar tu compra.',
  'soporte whatsapp': 'Próximamente habilitaremos atención por WhatsApp.',
  'confirmación pedido': 'Recibirás un email con la confirmación una vez completes la compra.',
  'packaging': 'Empaquetamos cuidadosamente los productos para evitar daños.',
  'llamar': 'En este momento solo atendemos por chat y correo electrónico.'
};

btnAbrirChat.addEventListener('click', () => chatContainer.classList.toggle('cerrado'));
btnCerrarChat.addEventListener('click', () => chatContainer.classList.add('cerrado'));

function obtenerRespuesta(texto) {
  const clave = Object.keys(respuestas).find(k => texto.toLowerCase().includes(k));
  return clave ? respuestas[clave] : 'Lo siento, no puedo responder a esa pregunta.';
}

btnEnviar.addEventListener('click', () => {
  const texto = inputMensaje.value.trim();
  if(!texto) return;

  const msgUsuario = document.createElement('div');
  msgUsuario.className = 'mensaje usuario';
  msgUsuario.textContent = texto;
  chatMensajes.appendChild(msgUsuario);

  const msgIA = document.createElement('div');
  msgIA.className = 'mensaje ia';
  msgIA.textContent = 'Escribiendo...';
  chatMensajes.appendChild(msgIA);
  chatMensajes.scrollTop = chatMensajes.scrollHeight;

  setTimeout(() => {
    msgIA.textContent = obtenerRespuesta(texto);
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
  }, 800);

  inputMensaje.value = '';
});

(function autoOpenChatIfNeeded() {
  if (!chatContainer) return;
  let shouldOpen = false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openChat') === '1') {
      shouldOpen = true;
      params.delete('openChat');
      const query = params.toString();
      const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    }
  } catch (e) { /* ignore */ }

  if (!shouldOpen) {
    try {
      if (sessionStorage.getItem('openChatRedirect') === '1') {
        shouldOpen = true;
        sessionStorage.removeItem('openChatRedirect');
      }
    } catch (e) { /* ignore */ }
  }

  if (shouldOpen) {
    setTimeout(() => {
      chatContainer.classList.remove('cerrado');
      chatContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (inputMensaje) inputMensaje.focus();
    }, 100);
  }
})();

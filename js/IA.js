const btnAbrirChat = document.getElementById('abrirChat');
const btnCerrarChat = document.getElementById('cerrarChat');
const chatContainer = document.getElementById('chatContainer');
const btnEnviar = document.getElementById('enviarMensaje');
const inputMensaje = document.getElementById('mensajeInput');
const chatMensajes = document.getElementById('chatMensajes');

const respuestas = [
  {
    keywords: ['producto dañado', 'recibí un producto roto', 'llego roto', 'dañado'],
    respuesta: 'Lamentamos que hayas recibido un producto dañado. Contacta a soporte para solucionarlo.'
  },
  {
    keywords: ['envíos todo el país', 'envían a todo uruguay', 'llegan a cualquier ciudad'],
    respuesta: 'Hacemos envíos a todo Uruguay, sin importar la ciudad.'
  },
  {
    keywords: ['métodos de pago', 'formas de pago', 'como pago'],
    respuesta: 'Aceptamos tarjetas, transferencias y pagos en puntos habilitados.'
  },
  {
    keywords: ['devolver producto', 'quiero devolver', 'cambio', 'retornar producto'],
    respuesta: 'Puedes devolver un producto dentro de 14 días si está en perfectas condiciones.'
  },
  {
    keywords: ['horario de atención', 'cuando abren', 'horarios'],
    respuesta: 'Nuestro horario es de lunes a viernes de 9 a 18 hs y sábados de 10 a 14 hs.'
  },
  {
    keywords: ['seguimiento de pedido', 'donde esta mi pedido', 'rastrear pedido', 'tracking'],
    respuesta: 'Ingresa tu número de orden en "Mis compras" para seguir tu pedido.'
  },
  {
    keywords: ['tiempo de entrega', 'cuando llega', 'envío demora', 'llega'],
    respuesta: 'Los pedidos tardan entre 3 y 7 días hábiles, dependiendo de tu ubicación.'
  },
  {
    keywords: ['promociones', 'ofertas', 'descuentos'],
    respuesta: 'Tenemos ofertas y descuentos semanales, revisa la sección "Ofertas".'
  },
  {
    keywords: ['contacto soporte', 'ayuda', 'soporte'],
    respuesta: 'Escríbenos a soporte@emercado.uy o usa este chat.'
  },
  {
    keywords: ['garantía', 'garantia', 'cobertura'],
    respuesta: 'Todos los productos tienen garantía mínima de 6 meses.'
  },
  {
    keywords: ['cambiar dirección', 'modificar dirección', 'agregar dirección'],
    respuesta: 'Puedes agregar o cambiar la dirección en tu perfil antes de que el pedido sea despachado.'
  },
  {
    keywords: ['agregar tarjeta', 'guardar tarjeta', 'datos de tarjeta', 'perfil tarjeta'],
    respuesta: 'Puedes agregar tu tarjeta en tu perfil para que el pago sea más rápido en futuras compras.'
  },
  {
    keywords: ['pedido perdido', 'no llega mi pedido', 'no lo recibí'],
    respuesta: 'Si tu pedido no llega, contacta soporte con tu número de orden para rastrearlo.'
  },
  {
    keywords: ['cancelar pedido', 'anular pedido', 'quitar pedido'],
    respuesta: 'Puedes cancelar tu pedido antes del despacho contactando soporte.'
  },
  {
    keywords: ['pedido modificado', 'modificar pedido', 'cambiar pedido'],
    respuesta: 'Puedes modificar tu pedido solo antes de que sea despachado, contactando soporte.'
  },
  {
    keywords: ['envío urgente', 'entrega rápida', 'prioridad envío'],
    respuesta: 'Selecciona “Entrega rápida” para recibir tu pedido antes.'
  },
  {
    keywords: ['recoger en tienda', 'retiro tienda', 'retirar local'],
    respuesta: 'Puedes elegir la opción "Retiro en tienda" si está disponible en tu zona.'
  },
  {
    keywords: ['mercado pago', 'pago online', 'pago mercado'],
    respuesta: 'Sí, aceptamos Mercado Pago.'
  },
  {
    keywords: ['cuotas', 'pagar en cuotas', 'tarjeta cuotas'],
    respuesta: 'Aceptamos pagos en cuotas según las tarjetas disponibles.'
  },
  {
    keywords: ['problema con pago', 'tarjeta no funciona', 'error pago', 'tarjeta rechazada'],
    respuesta: 'Verifica que tu tarjeta esté habilitada y tenga saldo disponible; si falla, contacta a tu banco.'
  },
  {
    keywords: ['descuento cumpleaños', 'promoción cumpleaños', 'oferta cumpleaños'],
    respuesta: 'Si es tu cumpleaños, revisa si tienes un cupón de descuento especial disponible.'
  },
  {
    keywords: ['reembolso', 'devolución dinero', 'pago devuelto'],
    respuesta: 'Los reembolsos se procesan dentro de 5 a 7 días hábiles luego de la confirmación de devolución.'
  },
  {
    keywords: ['puntos de pago', 'pagar en abitab', 'pagar en redpagos'],
    respuesta: 'Aceptamos pagos en Abitab, Redpagos y otros puntos habilitados en Uruguay.'
  },
  {
    keywords: ['faq', 'preguntas frecuentes', 'ayuda rápida'],
    respuesta: 'Revisa nuestra sección de preguntas frecuentes para soluciones rápidas.'
  },
  {
    keywords: ['factura', 'facturación electrónica', 'comprobante'],
    respuesta: 'Puedes descargar la factura en "Mis compras" o solicitarla por correo. Todas las facturas se generan automáticamente.'
  },
  {
    keywords: ['problema entrega', 'no llega el pedido', 'envío retrasado'],
    respuesta: 'Si hay problemas con la entrega, contacta soporte indicando tu número de pedido.'
  },
  {
    keywords: ['dirección en perfil', 'guardar dirección', 'perfil'],
    respuesta: 'Puedes guardar tu dirección en el perfil para que los pedidos futuros sean más fáciles de completar.'
  },
  {
    keywords: ['tarjeta en perfil', 'guardar tarjeta', 'datos de pago'],
    respuesta: 'Agregando tu tarjeta en el perfil, el checkout será más rápido y seguro.'
  },
  {
    keywords: ['manual', 'instrucciones', 'guía producto'],
    respuesta: 'Puedes encontrar manuales y guías en la descripción del producto.'
  },
  {
    keywords: ['certificación', 'homologación', 'normativa'],
    respuesta: 'Nuestros productos cuentan con certificaciones según la normativa uruguaya.'
  },
  {
    keywords: ['modificar cantidad', 'cambiar cantidad', 'sumar producto', 'restar producto'],
    respuesta: 'Puedes cambiar la cantidad de productos directamente en el carrito antes de finalizar la compra.'
  },
  {
    keywords: ['guardar favoritos', 'wishlist', 'lista de deseos', 'deseos'],
    respuesta: 'Puedes agregar productos a tu lista de favoritos para comprarlos más tarde.'
  },
  {
    keywords: ['suscripción', 'newsletter', 'boletín', 'recibir novedades'],
    respuesta: 'Suscribiéndote al newsletter recibirás promociones y novedades directamente por correo.'
  },
  {
    keywords: ['soporte chat', 'chat en vivo', 'ayuda en línea'],
    respuesta: 'Nuestro chat en línea está disponible para consultas rápidas durante horario de atención.'
  },
  {
    keywords: ['producto incompatible', 'no funciona con', 'problema compatibilidad'],
    respuesta: 'Verifica las especificaciones del producto antes de comprar; si hay problemas, contacta soporte.'
  },
  {
    keywords: ['devolución parcial', 'cambiar solo un producto', 'reembolso parcial'],
    respuesta: 'Puedes devolver o cambiar solo algunos productos de tu pedido, contactando soporte.'
  },
  {
    keywords: ['confirmación pago', 'pago exitoso', 'recibo de pago'],
    respuesta: 'Recibirás un email confirmando el pago una vez que se procese correctamente.'
  },
  {
    keywords: ['pedido urgente', 'express', 'rápido', 'prioridad'],
    respuesta: 'Selecciona la opción de envío express en el checkout para recibir tu pedido más rápido.'
  },
  {
    keywords: ['código promocional', 'cupón descuento', 'aplicar cupón'],
    respuesta: 'Ingresa tu código promocional en el checkout para aplicar el descuento correspondiente.'
  },
  {
    keywords: ['seguimiento devolución', 'rastrear devolución', 'estado devolución'],
    respuesta: 'Puedes seguir el estado de tu devolución en la sección "Mis compras" o contactando soporte.'
  },
  {
    keywords: ['problema con factura', 'factura incorrecta', 'comprobante incorrecto'],
    respuesta: 'Si tu factura es incorrecta, contacta soporte para que se genere una nueva.'
  },
  {
    keywords: ['dirección incorrecta', 'cambiar domicilio', 'actualizar dirección'],
    respuesta: 'Si tu dirección es incorrecta, actualízala en tu perfil antes de que el pedido sea despachado.'
  },
  {
    keywords: ['envío gratis', 'promoción envío', 'descuento envío'],
    respuesta: 'Algunas compras superando cierto monto pueden acceder a envío gratuito, revisa promociones vigentes.'
  },
  {
    keywords: ['paquete abierto', 'producto abierto', 'recibí abierto'],
    respuesta: 'Si tu paquete llegó abierto o incompleto, contacta soporte inmediatamente para solucionarlo.'
  },
  {
    keywords: ['soporte app', 'problemas aplicación', 'error app'],
    respuesta: 'Si tienes problemas con la aplicación, revisa actualizaciones o contacta soporte técnico.'
  }
];


btnAbrirChat.addEventListener('click', () => chatContainer.classList.toggle('cerrado'));
btnCerrarChat.addEventListener('click', () => chatContainer.classList.add('cerrado'));

function obtenerRespuesta(texto) {
  texto = texto.toLowerCase();

  for (let i = 0; i < respuestas.length; i++) {
    const item = respuestas[i];
    if (item.keywords.some(k => texto.includes(k.toLowerCase()))) {
      return item.respuesta;
    }
  }

  return 'Lo siento, no puedo responder a esa pregunta.';
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
document.addEventListener('DOMContentLoaded', () => {
  const ID_MAP = {
    'Autos': '101',
    'Juguetes': '102',
    'Muebles': '103',
    'Herramientas': '105',
    'Computadoras': '106',
    'Vestimenta': '107',
    'Electrodomésticos': '108',
    'Deporte': '109',
    'Celulares': '110'
  };

  document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(a => {
    a.addEventListener('click', () => {
      const name = (a.dataset.catName || a.textContent).trim();
      const id = a.dataset.catId || ID_MAP[name];
      if (id) {
        localStorage.setItem('catID', id);
        localStorage.setItem('catName', name);
      }
    });
  });
});

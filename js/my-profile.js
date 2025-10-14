// my-profile.js - mantener funcionalidad de editar/guardar perfil desde prueba-merge
document.addEventListener('DOMContentLoaded', function() {
  const PROFILE_KEY = 'perfilUsuario';
  const usuarioActivo = localStorage.getItem('usuarioActivo');
  const userTitle = document.getElementById('usuarioActivo');

  if (userTitle && usuarioActivo) {
    userTitle.textContent = usuarioActivo;
  }

  // Manejo de foto de perfil
  const fotoPerfil = document.getElementById('fotoPerfil');
  const inputFoto = document.getElementById('inputFoto');
  const agregar = document.getElementById('agregarFoto');

  const fotoGuardada = localStorage.getItem('fotoPerfil');
  if (fotoGuardada && fotoPerfil) {
    fotoPerfil.className = '';
    fotoPerfil.innerHTML = `<img src="${fotoGuardada}" alt="Foto de perfil" style="width:100px; height:100px; border-radius:50%;">`;
  }

  if (fotoPerfil && inputFoto && agregar) {
    fotoPerfil.addEventListener('click', () => inputFoto.click());
    agregar.addEventListener('click', () => inputFoto.click());

    inputFoto.addEventListener('change', () => {
      const archivo = inputFoto.files[0];
      if (archivo) {
        const lector = new FileReader();
        lector.onload = function(e) {
          const imagenBase64 = e.target.result;
          fotoPerfil.className = '';
          fotoPerfil.innerHTML = `<img src="${imagenBase64}" alt="Foto de perfil" style="width:100px; height:100px; border-radius:50%;">`;
          localStorage.setItem('fotoPerfil', imagenBase64);
        };
        lector.readAsDataURL(archivo);
      }
    });
  }

  // Cargar datos guardados del perfil
  const savedProfile = localStorage.getItem(PROFILE_KEY);
  let profileData = savedProfile ? JSON.parse(savedProfile) : { nombre: '', apellido: '', email: '', telefono: '' };

  function updateProfileDisplay(data) {
    const fields = ['nombre', 'apellido', 'email', 'telefono'];
    fields.forEach(field => {
      const displayElement = document.getElementById(`${field}-display`);
      if (displayElement) displayElement.textContent = data[field] || '-';
    });
  }

  updateProfileDisplay(profileData);

  const actualizarBtn = document.getElementById('actualizarPerfil');
  const profileForm = document.getElementById('profile-form');
  if (actualizarBtn && profileForm) {
    actualizarBtn.addEventListener('click', () => {
      const isVisible = profileForm.style.display !== 'none';
      profileForm.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        ['nombre','apellido','email','telefono'].forEach(field => {
          const input = document.getElementById(field);
          if (input && profileData[field]) input.value = profileData[field];
        });
      }
    });
  }

  const guardarBtn = document.getElementById('guardarPerfil');
  if (guardarBtn) {
    guardarBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('nombre');
      const apellido = document.getElementById('apellido');
      const email = document.getElementById('email');
      if (!nombre?.value || !apellido?.value || !email?.value) {
        alert('Por favor complete los campos obligatorios (Nombre, Apellido y Email)');
        return;
      }

      profileData = {
        nombre: nombre.value,
        apellido: apellido.value,
        email: email.value,
        telefono: document.getElementById('telefono')?.value || ''
      };

      try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profileData));
        updateProfileDisplay(profileData);
        if (profileForm) profileForm.style.display = 'none';
        alert('Perfil guardado exitosamente');
      } catch (err) {
        console.error('Error al guardar el perfil:', err);
        alert('Error al guardar el perfil');
      }
    });
  }
});

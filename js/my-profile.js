const button = document.getElementById("oscuro");
const body = document.body;
const icon = button.querySelector("i");


if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    icon.className = "bi bi-sun-fill";
} else {
    icon.className = "bi bi-moon-fill";
}


button.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        icon.className = "bi bi-sun-fill";
        localStorage.setItem("theme", "dark");
    } else {
        icon.className = "bi bi-moon-fill";
        localStorage.setItem("theme", "light");
    }
});

//button.addEventListener("click", () => {
    //body.classList.toggle("dark-mode");

    //if (body.classList.contains("dark-mode")) {
      //  icon.className = "bi bi-sun-fill";
      //  localStorage.setItem("theme", "dark");
   // } else {
      //  icon.className = "bi bi-moon-fill";
       // localStorage.setItem("theme", "light");
   // }
//});

document.addEventListener("DOMContentLoaded", () => {
    const fotoPerfil = document.getElementById("fotoPerfil");
    const inputFoto = document.getElementById("inputFoto");
    const agregar = document.getElementById("agregarFoto");


    const fotoGuardada = localStorage.getItem("fotoPerfil");
    if (fotoGuardada) {
        fotoPerfil.className = "";
        fotoPerfil.innerHTML = `<img src="${fotoGuardada}" alt="Foto de perfil" style="width:100px; height:100px; border-radius:50%;">`;
    }

    fotoPerfil.addEventListener("click", () => inputFoto.click());
    agregar.addEventListener("click", () => inputFoto.click());
    
    inputFoto.addEventListener("change", () => {
        const archivo = inputFoto.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = function(e) {
                const imagenBase64 = e.target.result;
                fotoPerfil.className = "";
                fotoPerfil.innerHTML = `<img src="${imagenBase64}" alt="Foto de perfil" style="width:100px; height:100px; border-radius:50%;">`;
                localStorage.setItem("fotoPerfil", imagenBase64);
            };
            lector.readAsDataURL(archivo);

        }
    });
});



    
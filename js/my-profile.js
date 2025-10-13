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

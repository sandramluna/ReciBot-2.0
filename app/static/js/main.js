const botonMenu = document.querySelector(".boton-menu");
const menuPrincipal = document.querySelector(".menu-principal");

if (botonMenu && menuPrincipal) {
    botonMenu.addEventListener("click", () => {
        const menuAbierto = menuPrincipal.classList.toggle("menu-visible");

        botonMenu.setAttribute("aria-expanded", String(menuAbierto));
    });

    menuPrincipal.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", () => {
            menuPrincipal.classList.remove("menu-visible");
            botonMenu.setAttribute("aria-expanded", "false");
        });
    });
}
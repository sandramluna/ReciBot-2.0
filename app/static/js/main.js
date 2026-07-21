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
const inputImagen = document.querySelector("#imagen-residuo");
const zonaCarga = document.querySelector("#zona-carga");
const vistaPreviaContenedor = document.querySelector(
    "#vista-previa-contenedor"
);
const vistaPrevia = document.querySelector("#vista-previa");
const nombreArchivo = document.querySelector("#nombre-archivo");
const tamanoArchivo = document.querySelector("#tamano-archivo");
const botonEliminar = document.querySelector("#boton-eliminar");
const botonEnviar = document.querySelector("#boton-cargar");
const formularioCarga = document.querySelector("#formulario-carga");
const textoBotonCargar = document.querySelector(
    "#texto-boton-cargar"
);
const spinnerCarga = document.querySelector("#spinner-carga");
const mensajeAnalizando = document.querySelector(
    "#mensaje-analizando"
);

let formularioEnviado = false;
if (inputImagen) {
    inputImagen.addEventListener("change", () => {
        procesarArchivo(inputImagen.files[0]);
    });
}
if (formularioCarga) {
    formularioCarga.addEventListener("submit", (evento) => {
        if (!inputImagen || inputImagen.files.length === 0) {
            evento.preventDefault();
            mostrarError(
                "Debes seleccionar una imagen antes de analizarla."
            );
            return;
        }

        if (formularioEnviado) {
            evento.preventDefault();
            return;
        }

        formularioEnviado = true;

        if (botonEnviar) {
            botonEnviar.disabled = true;
        }

        if (textoBotonCargar) {
            textoBotonCargar.textContent = "Analizando...";
        }

        if (spinnerCarga) {
            spinnerCarga.classList.add("activo");
            spinnerCarga.setAttribute("aria-hidden", "false");
        }

        if (mensajeAnalizando) {
    mensajeAnalizando.hidden = false;
    mensajeAnalizando.classList.add("activo");
}
    });
}
const extensionesPermitidas = ["image/jpeg", "image/png"];
const tamanoMaximo = 5 * 1024 * 1024;


function mostrarError(mensaje) {
    window.alert(mensaje);
}


function limpiarSeleccion() {
    if (!inputImagen) {
        return;
    }

    inputImagen.value = "";

    if (vistaPrevia) {
        vistaPrevia.src = "";
    }

    if (nombreArchivo) {
        nombreArchivo.textContent = "";
    }

    if (tamanoArchivo) {
        tamanoArchivo.textContent = "";
    }

    if (vistaPreviaContenedor) {
        vistaPreviaContenedor.hidden = true;
    }

    if (botonEnviar) {
        botonEnviar.disabled = true;
    }

    if (zonaCarga) {
        zonaCarga.classList.remove("archivo-arrastrado");
    }
    formularioEnviado = false;

if (textoBotonCargar) {
    textoBotonCargar.textContent = "Cargar imagen";
}

if (spinnerCarga) {
    spinnerCarga.classList.remove("activo");
    spinnerCarga.setAttribute("aria-hidden", "true");
}

if (mensajeAnalizando) {
    mensajeAnalizando.classList.remove("activo");
    mensajeAnalizando.hidden = true;
}
}


function procesarArchivo(archivo) {
    if (!archivo) {
        limpiarSeleccion();
        return;
    }

    if (!extensionesPermitidas.includes(archivo.type)) {
        mostrarError(
            "Formato no permitido. Selecciona una imagen JPG, JPEG o PNG."
        );
        limpiarSeleccion();
        return;
    }

    if (archivo.size > tamanoMaximo) {
        mostrarError(
            "La imagen supera el tamaño máximo permitido de 5 MB."
        );
        limpiarSeleccion();
        return;
    }

    const lector = new FileReader();

    lector.addEventListener("load", (evento) => {
        vistaPrevia.src = evento.target.result;
        nombreArchivo.textContent = archivo.name;
        tamanoArchivo.textContent = formatearTamano(archivo.size);
        vistaPreviaContenedor.hidden = false;
        botonEnviar.disabled = false;
    });

    lector.readAsDataURL(archivo);
}


function formatearTamano(bytes) {
    const megabytes = bytes / (1024 * 1024);

    if (megabytes >= 1) {
        return `${megabytes.toFixed(2)} MB`;
    }

    const kilobytes = bytes / 1024;
    return `${kilobytes.toFixed(1)} KB`;
}


if (inputImagen) {
    inputImagen.addEventListener("change", () => {
        procesarArchivo(inputImagen.files[0]);
    });
}


if (botonEliminar) {
    botonEliminar.addEventListener("click", limpiarSeleccion);
}


if (zonaCarga && inputImagen) {
    zonaCarga.addEventListener("dragover", (evento) => {
        evento.preventDefault();
        zonaCarga.classList.add("archivo-arrastrado");
    });

    zonaCarga.addEventListener("dragleave", () => {
        zonaCarga.classList.remove("archivo-arrastrado");
    });

    zonaCarga.addEventListener("drop", (evento) => {
        evento.preventDefault();
        zonaCarga.classList.remove("archivo-arrastrado");

        const archivo = evento.dataTransfer.files[0];

        if (!archivo) {
            return;
        }

        const transferencia = new DataTransfer();
        transferencia.items.add(archivo);
        inputImagen.files = transferencia.files;

        procesarArchivo(archivo);
    });
}
const botonAnalizarOtra = document.getElementById(
    "boton-analizar-otra"
);

if (botonAnalizarOtra) {
    botonAnalizarOtra.addEventListener("click", () => {
        const resultado = document.getElementById(
            "resultado-clasificacion"
        );

        const clasificador = document.getElementById(
            "clasificador"
        );

        const inputArchivo = document.querySelector(
            'input[name="imagen_residuo"]'
        );

        const formulario = inputArchivo?.closest("form");

        const imagenCargadaServidor = document.getElementById(
            "imagen-cargada-servidor"
        );

        const mensajesFlash = document.getElementById(
            "mensajes-flash"
        );

        const vistaPrevia = document.querySelector(
            "#vista-previa, .vista-previa, .preview-imagen"
        );

        const imagenPrevia = document.querySelector(
            "#imagen-preview, .imagen-preview, .preview-imagen img"
        );

        const nombreArchivo = document.querySelector(
            "#nombre-archivo, .nombre-archivo"
        );

        if (resultado) {
            resultado.remove();
        }

        if (imagenCargadaServidor) {
            imagenCargadaServidor.remove();
        }

        if (mensajesFlash) {
            mensajesFlash.remove();
        }

        if (formulario) {
            formulario.reset();
        }

        if (inputArchivo) {
            inputArchivo.value = "";
        }
        formularioEnviado = false;

if (botonEnviar) {
    botonEnviar.disabled = true;
}

if (textoBotonCargar) {
    textoBotonCargar.textContent = "Cargar imagen";
}

if (spinnerCarga) {
    spinnerCarga.classList.remove("activo");
    spinnerCarga.setAttribute("aria-hidden", "true");
}

if (mensajeAnalizando) {
    mensajeAnalizando.classList.remove("activo");
    mensajeAnalizando.hidden = true;
}

        if (imagenPrevia) {
            imagenPrevia.removeAttribute("src");
            imagenPrevia.style.display = "none";
        }

        if (vistaPrevia) {
            vistaPrevia.classList.remove(
                "activa",
                "visible",
                "con-imagen"
            );

            vistaPrevia.style.display = "none";
        }

        if (nombreArchivo) {
            nombreArchivo.textContent = "";
        }

        document
            .querySelectorAll(
                ".mensaje-archivo, .upload-success"
            )
            .forEach((elemento) => {
                elemento.remove();
            });

        if (clasificador) {
            clasificador.scrollIntoView({
                behavior: "auto",
                block: "start",
            });
        }

        window.setTimeout(() => {
            inputArchivo?.focus();
        }, 600);
    });
}
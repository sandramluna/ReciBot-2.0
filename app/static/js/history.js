document.addEventListener("DOMContentLoaded", () => {
    registrarResultadoActual();
    mostrarHistorial();
    mostrarEstadisticas();   

});


function registrarResultadoActual() {

    const resultado = document.getElementById(
        "resultado-clasificacion"
    );

    if (!resultado) {
        return;
    }

    console.log("=== RESULTADO DETECTADO ===");

    console.log(
        "Categoría:",
        resultado.dataset.categoria
    );

    console.log(
        "Confianza:",
        resultado.dataset.confianza
    );

    console.log(
        "Contenedor:",
        resultado.dataset.contenedor
    );

    console.log(
        "Recomendación:",
        resultado.dataset.recomendacion
    );

    console.log(
        "Origen:",
        sessionStorage.getItem(
            "recibotOrigenPendiente"
        )
    );
    
const categoria = resultado.dataset.categoria;
const confianza = resultado.dataset.confianza;
const contenedor = resultado.dataset.contenedor;
const recomendacion =
    resultado.dataset.recomendacion;

const origen =
    sessionStorage.getItem(
        "recibotOrigenPendiente"
    ) || "Archivo";

const identificador = [
    categoria,
    confianza,
    contenedor,
    recomendacion
].join("|");

const fueGuardada = agregarClasificacion({
    id: identificador,
    categoria,
    confianza,
    contenedor,
    recomendacion,
    origen,
    fecha: new Date().toLocaleString("es-CO")
});

if (fueGuardada) {
    mostrarHistorial();
}

sessionStorage.removeItem(
    "recibotOrigenPendiente"
);
}


function obtenerHistorial() {

    return JSON.parse(
        localStorage.getItem("recibotHistorial")
    ) || [];

}



function guardarHistorial(historial) {

    localStorage.setItem(
        "recibotHistorial",
        JSON.stringify(historial)
    );

}



function agregarClasificacion(clasificacion) {
    const historial = obtenerHistorial();

    const yaExiste = historial.some((item) => {
        return item.id === clasificacion.id;
    });

    if (yaExiste) {
        console.log(
            "La clasificación ya estaba guardada"
        );

        return false;
    }

    historial.unshift(clasificacion);

    const historialLimitado = historial.slice(0, 50);

    guardarHistorial(historialLimitado);

    console.log("Clasificación guardada");
    console.table(historialLimitado);

    return true;
}

function mostrarHistorial() {
    const contenedor = document.getElementById(
        "contenedor-historial"
    );

    if (!contenedor) {
        return;
    }

    const historial = obtenerHistorial();

    contenedor.innerHTML = "";

    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div
                id="estado-vacio-historial"
                class="estado-vacio"
            >
                <span class="estado-vacio-icono">
                    📋
                </span>

                <h3>
                    Aún no hay clasificaciones guardadas
                </h3>

                <p>
                    Cuando analices residuos, aparecerán aquí
                    con su categoría, confianza y contenedor.
                </p>
            </div>
        `;

        return;
    }

    historial.forEach((item) => {
        const tarjeta = document.createElement("article");
const coloresContenedor = {
    Verde: "verde",
    Blanco: "blanco",
    Negro: "negro"
};

const colorContenedor =
    coloresContenedor[item.contenedor] || "neutro";

        const iconos = {
    Cartón: "📦",
    Plástico: "🥤",
    Vidrio: "🍾",
    Metal: "🥫",
    Orgánico: "🍌"

    
};

const icono =
    iconos[item.categoria] || "♻️";
const valorConfianza =
    Number.parseFloat(item.confianza) || 0;

let nivelConfianza = "Baja";
let claseConfianza = "confianza-baja";

if (valorConfianza >= 80) {
    nivelConfianza = "Alta";
    claseConfianza = "confianza-alta";
} else if (valorConfianza >= 60) {
    nivelConfianza = "Media";
    claseConfianza = "confianza-media";
}
        tarjeta.className = "tarjeta-historial";

        tarjeta.innerHTML = `
            <div class="historial-icono">
                ♻️
            </div>

            <div class="info-historial">
                <div class="historial-encabezado">
    <h4>${icono} ${item.categoria}</h4>

    <span class="badge-confianza ${claseConfianza}">
        Confianza ${nivelConfianza}
    </span>
</div>

                <div class="historial-confianza">

    <div class="historial-confianza-texto">
        <span>Confianza</span>
        <strong>${item.confianza}%</strong>
    </div>

    <div class="barra-confianza">

        <div
            class="barra-confianza-progreso"
            style="width:${item.confianza}%">
        </div>

    </div>

</div>

                <p class="historial-contenedor">
    <span
        class="punto-contenedor punto-${colorContenedor}"
        aria-hidden="true"
    ></span>

    <strong>Contenedor:</strong>
    ${item.contenedor}
</p>

                <p>
                    <strong>Origen:</strong>
                    ${item.origen || "Archivo"}
                </p>

                <p class="historial-fecha">
                    ${item.fecha}
                </p>
            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}
    
function obtenerEstadisticas() {

    const historial = obtenerHistorial();

    const estadisticas = {

        total: historial.length,

        promedioConfianza: 0,

        categorias: {

            "Orgánico": 0,

            "Cartón": 0,

            "Plástico": 0,

            "Metal": 0,

            "Vidrio": 0

        }

    };

    let suma = 0;

    historial.forEach(item => {

        if (estadisticas.categorias[item.categoria] !== undefined) {

            estadisticas.categorias[item.categoria]++;

        }

        suma += Number(item.confianza);

    });

    if (historial.length > 0) {

        estadisticas.promedioConfianza =
            (suma / historial.length).toFixed(2);

    }

    return estadisticas;

}


window.HistoryRecibot = {
    agregarClasificacion,
    obtenerHistorial,
    obtenerEstadisticas,
    mostrarEstadisticas
    
};
function mostrarEstadisticas() {
    const panel = document.querySelector(
        '[data-panel="estadisticas"]'
    );

    if (!panel) {
        return;
    }

    const estadisticas = obtenerEstadisticas();

    const categoriaPrincipal = Object.entries(
        estadisticas.categorias
    ).sort((a, b) => b[1] - a[1])[0];

    const nombrePrincipal =
        categoriaPrincipal?.[1] > 0
            ? categoriaPrincipal[0]
            : "Sin datos";

    panel.innerHTML = `
        <div class="panel-estadisticas">
            <div class="resumen-estadisticas">
                <article class="tarjeta-estadistica">
                    <span>📋</span>
                    <p>Total de clasificaciones</p>
                    <strong>${estadisticas.total}</strong>
                </article>

                <article class="tarjeta-estadistica">
                    <span>🎯</span>
                    <p>Promedio de confianza</p>
                    <strong>
                        ${estadisticas.promedioConfianza}%
                    </strong>
                </article>

                <article class="tarjeta-estadistica">
                    <span>🏆</span>
                    <p>Categoría más frecuente</p>
                    <strong>${nombrePrincipal}</strong>
                </article>
            </div>
        </div>
    `;
}
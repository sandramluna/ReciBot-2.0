let cantidadVisibleHistorial = 10;
let filtroBusqueda = "";
let criterioOrden = "recientes";
let filtroCategoria = "todas";
let temporizadorBusqueda = null;
let graficoCategorias = null;

document.addEventListener("DOMContentLoaded", () => {
    registrarResultadoActual();
    mostrarHistorial();
    //mostrarDashboardProfesional();
    mostrarEstadisticas(); 
    
    //mostrarResumenEnEcoBot();  

});
function registrarResultadoActual() {

    const resultado = document.getElementById(
        "resultado-clasificacion"
    );

    if (!resultado) {
        return;
    }

     
const categoria = resultado.dataset.categoria;
sessionStorage.setItem(
    "ultimaCategoria",
    categoria
);
if (typeof mostrarInformacionAmbiental === "function") {
    mostrarInformacionAmbiental(categoria);
}
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
        

        return false;
    }

    historial.unshift(clasificacion);

    const historialLimitado = historial.slice(0, 50);

    guardarHistorial(historialLimitado);

     return true;
}
function convertirFechaHistorial(fechaTexto) {
    if (!fechaTexto) {
        return 0;
    }

    // Si ya existe una fecha válida en formato ISO o timestamp
    const fechaDirecta = Date.parse(fechaTexto);

    if (!Number.isNaN(fechaDirecta)) {
        return fechaDirecta;
    }

    /*
     * Formatos esperados:
     * 31/7/2026, 4:47:57 p. m.
     * 31/07/2026, 16:47:57
     */

    const coincidencia = fechaTexto.match(
        /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?)?/i
    );

    if (!coincidencia) {
        return 0;
    }

    const dia = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]) - 1;
    const anio = Number(coincidencia[3]);

    let hora = Number(coincidencia[4]);
    const minutos = Number(coincidencia[5]);
    const segundos = Number(coincidencia[6] || 0);

    const periodo = (
        coincidencia[7] || ""
    )
        .toLowerCase()
        .replace(/\s/g, "")
        .replace(/\./g, "");

    if (periodo === "pm" && hora < 12) {
        hora += 12;
    }

    if (periodo === "am" && hora === 12) {
        hora = 0;
    }

    return new Date(
        anio,
        mes,
        dia,
        hora,
        minutos,
        segundos
    ).getTime();
}
function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}
function mostrarHistorial() {
    const contenedor = document.getElementById(
        "contenedor-historial"
    );

    if (!contenedor) {
        return;
    }

   let historial = obtenerHistorial();

if (filtroBusqueda !== "") {
    const busquedaNormalizada =
        normalizarTexto(filtroBusqueda);

    historial = historial.filter((item) => {
        const categoriaNormalizada =
            normalizarTexto(item.categoria);

        return categoriaNormalizada.includes(
            busquedaNormalizada
        );
    });
}
if (filtroCategoria !== "todas") {
    historial = historial.filter((item) =>
        item.categoria === filtroCategoria
    );
}
historial = [...historial].sort((a, b) => {
   const fechaA = convertirFechaHistorial(
    a.fecha
);

const fechaB = convertirFechaHistorial(
    b.fecha
);

    const confianzaA = Number(a.confianza) || 0;
    const confianzaB = Number(b.confianza) || 0;

    switch (criterioOrden) {
        case "antiguos":
            return fechaA - fechaB;

        case "mayor-confianza":
            return confianzaB - confianzaA;

        case "menor-confianza":
            return confianzaA - confianzaB;

        case "recientes":
        default:
            return fechaB - fechaA;
    }
});

    const accionesHistorial = document.getElementById(
    "acciones-historial"
);

const botonVerMas = document.getElementById(
    "btn-ver-mas"
);

const campoBusqueda =
    document.getElementById("buscar-historial");

if (campoBusqueda) {
    campoBusqueda.addEventListener("input", (evento) => {
        const textoBusqueda = evento.target.value.trim();

        clearTimeout(temporizadorBusqueda);

        temporizadorBusqueda = setTimeout(() => {
            filtroBusqueda = textoBusqueda;
            cantidadVisibleHistorial = 10;
            mostrarHistorial();
        }, 250);
    });
}
const totalHistorial = document.getElementById(
    "total-historial"
);

const hayFiltrosActivos =
    filtroBusqueda !== "" ||
    filtroCategoria !== "todas";

if (totalHistorial) {
    if (hayFiltrosActivos) {
        totalHistorial.textContent =
            historial.length === 1
                ? "1 resultado"
                : `${historial.length} resultados`;
    } else {
        totalHistorial.textContent =
            historial.length === 1
                ? "1 registro"
                : `${historial.length} registros`;
    }
}
    contenedor.innerHTML = "";

    if (historial.length === 0) {
    const tituloVacio = hayFiltrosActivos
        ? "No encontramos coincidencias"
        : "Aún no hay clasificaciones guardadas";

    const textoVacio = hayFiltrosActivos
        ? "Prueba con otra palabra o cambia los filtros seleccionados."
        : "Analiza tu primer residuo para comenzar a construir el historial de ReciBot.";

    contenedor.innerHTML = `
        <div
            id="estado-vacio-historial"
            class="estado-vacio"
        >
            <span class="estado-vacio-icono">
                ${hayFiltrosActivos ? "🔍" : "📋"}
            </span>

            <h3>
                ${tituloVacio}
            </h3>

            <p>
                ${textoVacio}
            </p>
        </div>
    `;

    const accionesHistorial = document.getElementById(
        "acciones-historial"
    );

    if (accionesHistorial) {
        accionesHistorial.hidden = true;
    }

    return;
}
    if (accionesHistorial && botonVerMas) {
    accionesHistorial.hidden = historial.length <= 10;

    botonVerMas.textContent =
        cantidadVisibleHistorial >= historial.length
            ? "Ver menos ▲"
            : `Ver más ▼ (${historial.length - cantidadVisibleHistorial})`;
}

const historialVisible = historial.slice(
    0,
    cantidadVisibleHistorial
);

    historialVisible.forEach((item) => {
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

        },
            porcentajes: {
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
    Number(
        (suma / historial.length).toFixed(2)
    );
    }
    if (estadisticas.total > 0) {
    for (const categoria in estadisticas.categorias) {
        estadisticas.porcentajes[categoria] =
            (
                estadisticas.categorias[categoria] /
                estadisticas.total
            ) * 100;
    }
}

    return estadisticas;

}
function evaluarCalidadModelo(estadisticas) {

    const totalCategorias =
        Object.keys(
            estadisticas.categorias
        ).length;

    const categoriasConDatos =
        Object.values(
            estadisticas.categorias
        ).filter(
            cantidad => cantidad > 0
        ).length;

    const cobertura =
        (
            categoriasConDatos /
            totalCategorias
        ) * 100;

    const valores =
        Object.values(
            estadisticas.categorias
        );

    const mayor =
        Math.max(...valores);

    const menor =
        Math.min(
            ...valores.filter(
                valor => valor > 0
            ),
            mayor
        );

    let balance = 100;

    if (mayor > 0) {
        balance =
            (
                menor /
                mayor
            ) * 100;
    }

    let estado = "";
    let icono = "";
    let mensaje = "";

    if (
        estadisticas.total >= 100 &&
        cobertura === 100 &&
        estadisticas.promedioConfianza >= 90
    ) {

        estado = "Excelente";
        icono = "🟢";

        mensaje =
            "El conjunto de datos presenta una excelente calidad y cobertura.";

    }

    else if (
        estadisticas.total >= 50 &&
        cobertura >= 80 &&
        estadisticas.promedioConfianza >= 80
    ) {

        estado = "Muy bueno";
        icono = "🟢";

        mensaje =
            "El modelo cuenta con una buena base para continuar aprendiendo.";

    }

    else if (
        estadisticas.total >= 10 &&
        cobertura >= 40 &&
        estadisticas.promedioConfianza >= 70
    ) {

        estado = "Bueno";
        icono = "🟡";

        mensaje =
            "El modelo funciona correctamente, pero necesita ampliar algunas categorías.";

    }

    else if (
        estadisticas.total >= 5
    ) {

        estado = "En desarrollo";
        icono = "🟠";

        mensaje =
            "Todavía se requieren más imágenes para mejorar el aprendizaje.";

    }

    else {

        estado = "Inicial";
        icono = "🔴";

        mensaje =
            "El conjunto de datos es insuficiente para realizar un análisis confiable.";

    }
const saludModelo =
(
    estadisticas.promedioConfianza * 0.40 +

    cobertura * 0.30 +

    balance * 0.30
);
    return {
    estado,
    icono,

    cobertura:
        cobertura.toFixed(1),

    balance:
        balance.toFixed(1),

    salud:
        saludModelo.toFixed(1),

    mensaje,

    categorias:
        estadisticas.categorias
};

}
window.HistoryRecibot = {
    agregarClasificacion,
    obtenerHistorial,
    obtenerEstadisticas,
    mostrarEstadisticas,
    generarResumenInteligente,
    
};
function mostrarResumenEnEcoBot() {
    const contenedor = document.getElementById(
        "contenidoAsistente"
    );

    if (!contenedor) {
        return;
    }

    const resumen = generarResumenInteligente();

    const resumenExistente = document.getElementById(
        "resumen-inteligente-ecobot"
    );

    if (resumenExistente) {
        resumenExistente.remove();
    }

    const tarjeta = document.createElement("section");

    tarjeta.id = "resumen-inteligente-ecobot";
    tarjeta.className = "resumen-inteligente-ecobot";

    tarjeta.innerHTML = `
        <div class="resumen-inteligente-cabecera">
            <span aria-hidden="true">🧠</span>

            <div>
                <h3>Resumen inteligente</h3>
                <p>Análisis automático del historial de ReciBot</p>
            </div>
        </div>

        <div class="resumen-inteligente-texto">
            ${resumen
                .split("\n\n")
                .filter(Boolean)
                .map(
                    parrafo => `<p>${parrafo}</p>`
                )
                .join("")}
        </div>
    `;

    contenedor.prepend(tarjeta);
}
function generarResumenInteligente() {

    const estadisticas =
        obtenerEstadisticas();

    const calidad =
        evaluarCalidadModelo(
            estadisticas
        );

    const categoriasOrdenadas =
        Object.entries(
            estadisticas.categorias
        ).sort(
            (a, b) => b[1] - a[1]
        );

    const principal =
        categoriasOrdenadas[0]?.[0] || "Sin datos";

    const faltantes =
        Object.entries(
            estadisticas.categorias
        )
        .filter(
            ([, cantidad]) => cantidad === 0
        )
        .map(
            ([categoria]) => categoria
        );

    let resumen = "";

    resumen +=
        `Actualmente existen ${estadisticas.total} clasificaciones registradas.\n\n`;

    resumen +=
        `La categoría predominante es ${principal}.\n\n`;

    resumen +=
        `La confianza promedio del modelo es de ${estadisticas.promedioConfianza.toFixed(1)}%.\n\n`;

    resumen +=
        `El estado actual del modelo es ${calidad.estado}.\n\n`;

    if (faltantes.length > 0) {

        resumen +=
            `Aún hacen falta registros de ${faltantes.join(", ")} para mejorar el aprendizaje del modelo.`;

    }

    return resumen;

}
function mostrarCalidadModelo(calidad) {

    const panel =
        document.getElementById(
            "panelCalidadModelo"
        );

    if (!panel) {
        return;
    }

    panel.innerHTML = `

    <div class="calidad-resumen">

        <article class="calidad-indicador">

            <span class="calidad-icono">
                🧠
            </span>

            <div>

                <small>
                    Salud del modelo
                </small>

               <strong id="contadorSaludModelo">
    0%
</strong>

            </div>

        </article>

        <article class="calidad-indicador">

            <span class="calidad-icono">
                ${calidad.icono}
            </span>

            <div>

                <small>
                    Estado
                </small>

                <strong>
                    ${calidad.estado}
                </strong>

            </div>

        </article>

        <article class="calidad-indicador">

            <span class="calidad-icono">
                📊
            </span>

            <div>

                <small>
                    Cobertura
                </small>

                <strong>
                    ${calidad.cobertura}%
                </strong>

            </div>

        </article>

        <article class="calidad-indicador">

            <span class="calidad-icono">
                ⚖️
            </span>

            <div>

                <small>
                    Balance
                </small>

                <strong>
                    ${calidad.balance}%
                </strong>

            </div>

        </article>

    </div>

    <section class="calidad-cobertura">

        <h4>
            📦 Cobertura del conjunto de datos
        </h4>

        <div id="listaCobertura">

        </div>

    </section>

    <div class="calidad-diagnostico">

        <span>
            💬
        </span>

        <div>

            <strong>
                Diagnóstico
            </strong>

            <p>

                ${calidad.mensaje}

            </p>

        </div>

    </div>

    `;

    const listaCobertura =
        document.getElementById(
            "listaCobertura"
        );

    Object.entries(
        calidad.categorias
    ).forEach(
        ([categoria, cantidad]) => {

            listaCobertura.innerHTML += `

            <div class="item-cobertura">

                <span>

                    ${
                        cantidad > 0
                            ? "✅"
                            : "❌"
                    }

                </span>

                <span>

                    ${categoria}

                </span>

            </div>

            `;

        }
    );

}

function interpretarConfianza(promedio) {
    const valor = Number(promedio) || 0;

    if (valor >= 90) {
        return {
            nivel: "Excelente",
            clase: "nivel-excelente",
            mensaje: "El modelo presenta resultados muy consistentes."
        };
    }

    if (valor >= 80) {
        return {
            nivel: "Muy buena",
            clase: "nivel-muy-bueno",
            mensaje: "El modelo está reconociendo adecuadamente los residuos."
        };
    }

    if (valor >= 60) {
        return {
            nivel: "En aprendizaje",
            clase: "nivel-aprendizaje",
            mensaje: "Conviene ampliar y diversificar el conjunto de imágenes."
        };
    }

    return {
        nivel: "Requiere mejora",
        clase: "nivel-mejora",
        mensaje: "El modelo necesita más datos y mejores ejemplos de entrenamiento."
    };
}
function obtenerIconoCategoria(categoria) {
    const iconos = {
        "Orgánico": "🍌",
        "Cartón": "📦",
        "Plástico": "🥤",
        "Metal": "🥫",
        "Vidrio": "🍾"
    };

    return iconos[categoria] || "♻️";
}
function mostrarEstadisticas() {
   

    const panel = document.querySelector(
        '[data-panel="estadisticas"]'
    );

    if (!panel) {
        return;
    }

    const estadisticas = obtenerEstadisticas();
const calidad =
    evaluarCalidadModelo(
        estadisticas
    );

    if (estadisticas.total === 0) {
    panel.innerHTML = `
        <div class="estado-vacio">
            <span class="estado-vacio-icono">
                📊
            </span>

            <h3>
                Aún no hay datos para analizar
            </h3>

            <p>
                Clasifica tu primer residuo para comenzar
                a construir el análisis ambiental de ReciBot.
            </p>
        </div>
    `;

    return;
}
    

    const categoriaPrincipal = Object.entries(
        estadisticas.categorias
    ).sort((a, b) => b[1] - a[1])[0];

    const nombrePrincipal =
        categoriaPrincipal?.[1] > 0
            ? categoriaPrincipal[0]
            : "Sin datos";

    const cantidadPrincipal =
    categoriaPrincipal?.[1] || 0;

const porcentajePrincipal =
    estadisticas.total > 0
        ? (
            cantidadPrincipal /
            estadisticas.total *
            100
        ).toFixed(1)
        : "0.0";

const interpretacionConfianza =
    interpretarConfianza(
        estadisticas.promedioConfianza
    );

const iconoPrincipal =
    obtenerIconoCategoria(
        nombrePrincipal
    );
    
    const resumenIA =
    generarResumenInteligente()
        .replace(/\n\n/g,"<br><br>");


    panel.innerHTML = `
    
        <div class="panel-estadisticas">
        <section class="panel-ejecutivo">

    <div class="panel-ejecutivo-icono">

        🧠

    </div>

    <div class="panel-ejecutivo-contenido">

        <h2>

            Estado General del Modelo

        </h2>

        <p>

            ${resumenIA}

        </p>

    </div>

</section>
        <div class="dashboard-encabezado">
    <div>
        <h3>Análisis Ambiental</h3>

        <p>
            Explora los resultados generados a partir
            de las clasificaciones registradas.
        </p>
    </div>

    <span class="dashboard-estado">
        Datos actualizados
    </span>
</div>
            <div class="resumen-estadisticas">
                <article class="tarjeta-estadistica">
    <span class="tarjeta-estadistica-icono">
        📋
    </span>

    <p>Total de clasificaciones</p>

    <strong id="contadorTotal">
    0
</strong>
    <small>
        Registros analizados por ReciBot
    </small>
</article>


<article class="tarjeta-estadistica">
    <span class="tarjeta-estadistica-icono">
        🎯
    </span>

    <p>Confianza promedio</p>

    <strong id="contadorConfianza">
    0%
</strong>
    <span
        class="nivel-modelo ${interpretacionConfianza.clase}"
    >
        ${interpretacionConfianza.nivel}
    </span>

    <small>
        ${interpretacionConfianza.mensaje}
    </small>
</article>


<article class="tarjeta-estadistica tarjeta-destacada">
    <span class="tarjeta-estadistica-icono">
        ${iconoPrincipal}
    </span>

    <p>Material más clasificado</p>

    <strong>
        ${nombrePrincipal}
    </strong>

    <span
    class="porcentaje-principal"
    id="contadorPorcentajePrincipal">

    0%

</span>

    <small>
        ${cantidadPrincipal}
        ${
            cantidadPrincipal === 1
                ? "clasificación registrada"
                : "clasificaciones registradas"
        }
    </small>
</article>
            </div>
            <div class="distribucion-estadisticas">
    <h3>📊 Distribución de residuos</h3>

    <div id="listaDistribucion"></div>
</div>
           <div class="grafico-estadisticas">
    <h3>📊 Clasificaciones por categoría</h3>

    <canvas id="graficoCategorias"></canvas>
</div>
<section class="recomendaciones-estadisticas">
    <h3>
        💡 Recomendaciones inteligentes
    </h3>

    <div id="listaRecomendaciones">
    </div>
</section> 
<section class="calidad-modelo">

    <h3>
        🧠 Calidad del Modelo
    </h3>

    <div id="panelCalidadModelo">

    </div>

</section>
        </div>
    `;
    const listaDistribucion =
    document.getElementById("listaDistribucion");
    listaDistribucion.innerHTML = "";
    const colores = {
    "Orgánico": "#4CAF50",
    "Cartón": "#8D6E63",
    "Plástico": "#42A5F5",
    "Metal": "#9E9E9E",
    "Vidrio": "#26C6DA"
};
    const iconosCategorias = {
    "Orgánico": "🍌",
    "Cartón": "📦",
    "Plástico": "🥤",
    "Metal": "🥫",
    "Vidrio": "🍾"
};

const clasesCategorias = {
    "Orgánico": "distribucion-organico",
    "Cartón": "distribucion-carton",
    "Plástico": "distribucion-plastico",
    "Metal": "distribucion-metal",
    "Vidrio": "distribucion-vidrio"
};

for (const categoria in estadisticas.porcentajes) {
    const porcentaje =
        estadisticas.porcentajes[categoria];

    const cantidad =
        estadisticas.categorias[categoria];

    if (cantidad === 0) {
        continue;
    }

    const icono =
        iconosCategorias[categoria] || "♻️";

    const claseCategoria =
        clasesCategorias[categoria] ||
        "distribucion-neutra";

    listaDistribucion.innerHTML += `
        <article class="item-distribucion ${claseCategoria}">

            <div class="distribucion-cabecera">

                <div class="distribucion-identidad">
                    <span class="distribucion-icono">
                        ${icono}
                    </span>

                    <div>
                        <strong>
                            ${categoria}
                        </strong>

                        <small>
                            ${cantidad}
                            ${
                                cantidad === 1
                                    ? "clasificación"
                                    : "clasificaciones"
                            }
                        </small>
                    </div>
                </div>

                <span class="distribucion-porcentaje">
                    ${porcentaje.toFixed(1)}%
                </span>

            </div>

            <div class="barra-fondo">
    <div
        class="barra-porcentaje"
        data-porcentaje="${porcentaje}"
    ></div>
</div>
        </article>
    `;
}
    dibujarGraficoCategorias(estadisticas);
    generarRecomendaciones(estadisticas);
    mostrarCalidadModelo(calidad);
    
    setTimeout(() => {
    document
        .querySelectorAll(".barra-porcentaje")
        .forEach((barra) => {
            const porcentaje =
                Number(barra.dataset.porcentaje) || 0;

            barra.style.width =
                `${porcentaje}%`;
        });
}, 200);
  
    animarContador(
    document.getElementById("contadorTotal"),
    estadisticas.total
);

animarContador(
    document.getElementById("contadorConfianza"),
    parseFloat(estadisticas.promedioConfianza),
    "%"
);

animarContador(
    document.getElementById("contadorPorcentajePrincipal"),
    parseFloat(porcentajePrincipal),
    "%"
);

const contadorSalud =
    document.getElementById("contadorSaludModelo");

if (contadorSalud) {

    animarContador(
        contadorSalud,
        parseFloat(calidad.salud),
        "%"
    );

}
}
function mostrarDashboardProfesional() {

    const contenedor =
        document.getElementById(
            "dashboard-kpis"
        );

    if(!contenedor){
        return;
    }

    const estadisticas =
        obtenerEstadisticas();

    const calidad =
        evaluarCalidadModelo(
            estadisticas
        );

    contenedor.innerHTML = `

        <article class="kpi-card">

            <div class="kpi-icono">
                📦
            </div>

            <small>
                Clasificaciones
            </small>

            <strong>
                ${estadisticas.total}
            </strong>

        </article>

    `;

}
function crearRecomendacion(icono, texto) {
    return `
        <div class="recomendacion-item">

            <div class="recomendacion-icono">
                ${icono}
            </div>

            <div class="recomendacion-texto">
                ${texto}
            </div>

        </div>
    `;
}
function generarRecomendaciones(estadisticas) {
    const lista = document.getElementById(
        "listaRecomendaciones"
    );

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    const recomendaciones = [];

    const categoriasOrdenadas = Object.entries(
        estadisticas.categorias
    ).sort((a, b) => b[1] - a[1]);

    const categoriaPrincipal =
        categoriasOrdenadas[0]?.[0] || "Sin datos";

    const cantidadPrincipal =
        categoriasOrdenadas[0]?.[1] || 0;

    const porcentajePrincipal =
        estadisticas.porcentajes[
            categoriaPrincipal
        ] || 0;

    recomendaciones.push(
        crearRecomendacion(
            "💡",
            `
                La categoría
                <strong>${categoriaPrincipal}</strong>
                representa aproximadamente
                <strong>${porcentajePrincipal.toFixed(1)}%</strong>
                del total de residuos registrados,
                con
                <strong>${cantidadPrincipal}</strong>
                ${
                    cantidadPrincipal === 1
                        ? "clasificación"
                        : "clasificaciones"
                }.
            `
        )
    );

    const categoriasSinRegistros = Object.entries(
        estadisticas.categorias
    )
        .filter(([, cantidad]) => cantidad === 0)
        .map(([categoria]) => categoria);

    if (categoriasSinRegistros.length > 0) {
        recomendaciones.push(
            crearRecomendacion(
                "⚠️",
                `
                    No existen registros de
                    <strong>
                        ${categoriasSinRegistros.join(", ")}
                    </strong>.
                    Conviene recopilar imágenes de estas categorías
                    para obtener un análisis más equilibrado.
                `
            )
        );
    }

    const promedioConfianza =
        Number(estadisticas.promedioConfianza) || 0;

    let mensajeConfianza = "";

    if (promedioConfianza >= 90) {
        mensajeConfianza =
            "El modelo presenta resultados muy consistentes.";
    } else if (promedioConfianza >= 80) {
        mensajeConfianza =
            "El modelo está reconociendo adecuadamente los residuos.";
    } else if (promedioConfianza >= 60) {
        mensajeConfianza =
            "El modelo continúa en aprendizaje. Conviene ampliar y diversificar el conjunto de imágenes.";
    } else {
        mensajeConfianza =
            "El modelo necesita más datos y mejores ejemplos de entrenamiento.";
    }

    recomendaciones.push(
        crearRecomendacion(
            "📈",
            `
                La confianza promedio del modelo es de
                <strong>${promedioConfianza.toFixed(1)}%</strong>.
                ${mensajeConfianza}
            `
        )
    );

    if (porcentajePrincipal >= 50) {
        recomendaciones.push(
            crearRecomendacion(
                "🌱",
                `
                    Actualmente predomina la categoría
                    <strong>${categoriaPrincipal}</strong>.
                    Esto puede indicar que este tipo de residuo aparece
                    con mayor frecuencia en las clasificaciones realizadas.
                `
            )
        );
    }

    if (estadisticas.total < 30) {
        recomendaciones.push(
            crearRecomendacion(
                "🎯",
                `
                    Continúa utilizando ReciBot.
                    A medida que aumente el número de clasificaciones,
                    los resultados serán más representativos.
                `
            )
        );
    }

    lista.innerHTML = recomendaciones.join("");
}
function dibujarGraficoCategorias(estadisticas) {

    const canvas =
        document.getElementById(
            "graficoCategorias"
        );

    if (!canvas) {
        return;
    }

    if (graficoCategorias) {
        graficoCategorias.destroy();
    }

    const contexto =
        canvas.getContext("2d");

    graficoCategorias =
        new Chart(contexto, {

            type: "bar",

            data: {
                labels:
                    Object.keys(
                        estadisticas.categorias
                    ),

                datasets: [
                    {
                        label: "Clasificaciones",

                        data:
                            Object.values(
                                estadisticas.categorias
                            ),

                        backgroundColor: [
                            "#4CAF50",
                            "#8D6E63",
                            "#FBC02D",
                            "#9E9E9E",
                            "#42A5F5"
                        ],

                        borderColor: [
                            "#388E3C",
                            "#6D4C41",
                            "#F9A825",
                            "#757575",
                            "#1E88E5"
                        ],

                        borderWidth: 2,

                        borderRadius: 8
                    }
                ]
            },

            options: {
                responsive: true,
maintainAspectRatio: true,
aspectRatio: 2,
                animation: {
                    duration: 1200,
                    easing: "easeOutQuart"
                },

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: true,

                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },

                        grid: {
                            color:
                                "rgba(0,0,0,0.08)"
                        }
                    }
                }
            }
        });
}
document.addEventListener("DOMContentLoaded", () => {
    const botonVerMas = document.getElementById(
        "btn-ver-mas"
    );

    if (!botonVerMas) {
        return;
    }

    botonVerMas.addEventListener("click", () => {
        const historial = obtenerHistorial();

        if (cantidadVisibleHistorial >= historial.length) {
            cantidadVisibleHistorial = 10;
        } else {
            cantidadVisibleHistorial += 10;
        }

        mostrarHistorial();
    });
});
const selectorOrden =
    document.getElementById("ordenar-historial");

if (selectorOrden) {
    selectorOrden.addEventListener("change", (evento) => {
        criterioOrden = evento.target.value;
        cantidadVisibleHistorial = 10;
        mostrarHistorial();
    });
}
const selectorCategoria =
    document.getElementById("filtrar-historial");

if (selectorCategoria) {
    selectorCategoria.addEventListener(
        "change",
        (evento) => {
            filtroCategoria = evento.target.value;
            cantidadVisibleHistorial = 10;
            mostrarHistorial();
        }
    );
}
function animarContador(elemento, destino) {

    let valor = 0;

    const incremento =
        destino / 40;

    const intervalo = setInterval(() => {

        valor += incremento;

        if (valor >= destino) {

            valor = destino;

            clearInterval(intervalo);

        }

        elemento.textContent =
            Number.isInteger(destino)
                ? Math.round(valor)
                : valor.toFixed(1);

    },20);

}
function animarContador(elemento, valorFinal, sufijo = "") {

    let inicio = 0;

    const incremento = valorFinal / 40;

    const intervalo = setInterval(() => {

        inicio += incremento;

        if (inicio >= valorFinal) {

            inicio = valorFinal;

            clearInterval(intervalo);

        }

        if (Number.isInteger(valorFinal)) {

            elemento.textContent =
                Math.round(inicio) + sufijo;

        } else {

            elemento.textContent =
                inicio.toFixed(1) + sufijo;

        }

    }, 20);

}
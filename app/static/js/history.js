document.addEventListener("DOMContentLoaded", () => {
    
    registrarResultadoActual();
    mostrarHistorial();    

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
    agregarClasificacion({

    categoria: resultado.dataset.categoria,

    confianza: resultado.dataset.confianza,

    contenedor: resultado.dataset.contenedor,

    recomendacion: resultado.dataset.recomendacion,

    origen: sessionStorage.getItem(
        "recibotOrigenPendiente"
    ),

    fecha: new Date().toLocaleString("es-CO")

});
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

    historial.unshift(clasificacion);

    guardarHistorial(historial);

    console.log("Clasificación guardada");

    console.table(historial);

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

        tarjeta.className = "tarjeta-historial";

        tarjeta.innerHTML = `
            <div class="historial-icono">
                ♻️
            </div>

            <div class="info-historial">
                <h4>${item.categoria}</h4>

                <p>
                    <strong>Confianza:</strong>
                    ${item.confianza}%
                </p>

                <p>
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



window.HistoryRecibot = {

    agregarClasificacion

};
// =====================================
// ECOCHAT 2.0
// Motor conversacional local
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        restaurarMemoriaConversacion();

        inicializarEcoChat();

    }
);
const memoriaConversacion = {

    ultimaCategoria: null,

    ultimoTema: null,

    ultimoObjeto: null

};
function restaurarMemoriaConversacion() {

    memoriaConversacion.ultimaCategoria =
        sessionStorage.getItem("ultimaCategoria");

    memoriaConversacion.ultimoTema =
        sessionStorage.getItem("ultimoTema");

    memoriaConversacion.ultimoObjeto =
        sessionStorage.getItem("ultimoObjeto");

}
function detectarTemaConversacion(texto) {

    if (
        texto.includes("beneficio") ||
        texto.includes("beneficios")
    ) {
        return "beneficio";
    }

    if (
        texto.includes("contenedor") ||
        texto.includes("caneca") ||
        texto.includes("depositar")
    ) {
        return "contenedor";
    }

    if (
        texto.includes("consejo") ||
        texto.includes("reciclar") ||
        texto.includes("reciclo") ||
        texto.includes("reutilizar")
    ) {
        return "consejo";
    }

    if (
        texto.includes("curiosidad") ||
        texto.includes("dato curioso")
    ) {
        return "curiosidad";
    }

    return null;
}
function inicializarEcoChat() {

    const boton = document.getElementById("btnEnviarPregunta");
    const input = document.getElementById("preguntaUsuario");

    if (!boton || !input) return;

    boton.addEventListener("click", enviarPregunta);

    input.addEventListener("keydown", (evento) => {

        if (evento.key === "Enter") {
            enviarPregunta();
        }

    });

}
function enviarPregunta() {

    const input = document.getElementById("preguntaUsuario");
    const pregunta = input.value.trim();

    if (pregunta === "") return;

    input.value = "";

    agregarMensajeUsuario(pregunta);

    mostrarTyping();

    setTimeout(() => {

        ocultarTyping();

        const respuesta = interpretarPregunta(pregunta);

        agregarMensajeBot(respuesta);

    }, 900);
}
function agregarMensajeUsuario(texto) {

    const chat = document.getElementById("chatMensajes");

    const mensaje = document.createElement("div");
    mensaje.className = "chat-message user";

    const burbuja = document.createElement("div");
    burbuja.className = "chat-bubble";

    // textContent evita errores cuando el usuario escribe símbolos o etiquetas
    burbuja.textContent = texto;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = "👤";

    mensaje.appendChild(burbuja);
    mensaje.appendChild(avatar);

    chat.appendChild(mensaje);

    chat.scrollTop = chat.scrollHeight;
}
function agregarMensajeBot(texto) {
    const chat = document.getElementById("chatMensajes");

    if (!chat) return;

    const mensaje = document.createElement("div");
    mensaje.className = "chat-message bot";

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";

    avatar.innerHTML = `
        <div class="ecobot-mini">
            <div class="ecobot-mini-head">
                <span class="mini-eye"></span>
                <span class="mini-eye"></span>
            </div>
        </div>
    `;

    const burbuja = document.createElement("div");
    burbuja.className = "chat-bubble";

    mensaje.appendChild(avatar);
    mensaje.appendChild(burbuja);

    chat.appendChild(mensaje);
    chat.scrollTop = chat.scrollHeight;

    const contieneHTML = /<[^>]+>/.test(texto);

    if (contieneHTML) {
        burbuja.innerHTML = texto;
        chat.scrollTop = chat.scrollHeight;
        return;
    }

    escribirTextoProgresivo(burbuja, texto, chat);
}
function escribirTextoProgresivo(elemento, texto, chat) {
    let indice = 0;
    const velocidad = 22;

    elemento.textContent = "";

    function escribirCaracter() {
        if (indice < texto.length) {
            elemento.textContent += texto.charAt(indice);
            indice += 1;

            chat.scrollTop = chat.scrollHeight;

            window.setTimeout(escribirCaracter, velocidad);
        }
    }

    escribirCaracter();
}
function mostrarTyping() {

    const chat =
        document.getElementById("chatMensajes");

    if (!chat) {
        return;
    }

    const typingExistente =
        document.getElementById("ecobotTyping");

    if (typingExistente) {
        return;
    }

    const mensaje =
        document.createElement("div");

    mensaje.className =
        "chat-message bot";

    mensaje.id =
        "ecobotTyping";

    const avatar =
        document.createElement("div");

    avatar.className =
        "chat-avatar";

    avatar.innerHTML = `
        <div class="ecobot-mini">
            <div class="ecobot-mini-head">
                <span class="mini-eye"></span>
                <span class="mini-eye"></span>
            </div>
        </div>
    `;

    const burbuja =
        document.createElement("div");

    burbuja.className =
        "chat-bubble typing-bubble";

    burbuja.innerHTML = `
        <span>EcoBot está pensando</span>

        <span class="typing-puntos">
            <span></span>
            <span></span>
            <span></span>
        </span>
    `;

    mensaje.appendChild(avatar);
    mensaje.appendChild(burbuja);

    chat.appendChild(mensaje);

    chat.scrollTop =
        chat.scrollHeight;
}
function ocultarTyping(){

    const typing = document.getElementById("ecobotTyping");

    if(typing){

        typing.remove();

    }

}
function obtenerUltimaCategoria() {

    return (
        memoriaConversacion.ultimaCategoria ||
        sessionStorage.getItem(
            "ultimaCategoria"
        )
    );

}
function interpretarPregunta(pregunta){
   
   const texto = pregunta
        .toLowerCase()
        .trim();
    const objetoActual =
    memoriaConversacion.ultimoObjeto ||
    sessionStorage.getItem("ultimoObjeto");

const categoriaActual =
    memoriaConversacion.ultimaCategoria ||
    sessionStorage.getItem("ultimaCategoria");
if (
    texto.includes("degradarse") ||
    texto.includes("degradación") ||
    texto.includes("degradacion") ||
    texto.includes("cuánto tarda") ||
    texto.includes("cuanto tarda") ||
    texto.includes("cuánto demora") ||
    texto.includes("cuanto demora")
) {

    const respuestaDegradacion =
        obtenerRespuestaDegradacion(
            objetoActual,
            categoriaActual
        );

    if (respuestaDegradacion) {
        memoriaConversacion.ultimoTema =
            "degradacion";

        return respuestaDegradacion;
    }
}

   const temaDetectado =
    detectarTemaConversacion(texto);

if (temaDetectado) {
    memoriaConversacion.ultimoTema =
        temaDetectado;
}

    if (
        texto.includes("contenedor verde") ||
        texto.includes("qué va en el contenedor verde") ||
        texto.includes("que va en el contenedor verde")
    ) {
        return `
            <div class="eco-card">
                <h4>🟢 Contenedor verde</h4>

                <div class="eco-divider"></div>

                <div class="eco-card-section">
                    Aquí se depositan residuos orgánicos
                    aprovechables, como cáscaras, restos de
                    frutas, verduras y residuos de jardinería.
                </div>
            </div>
        `;
    }

    if (
        texto.includes("consejo ambiental") ||
        texto.includes("dame un consejo ambiental")
    ) {
        return obtenerConsejoAmbiental();
    }
    // Saludos
    if (
        texto.includes("hola") ||
        texto.includes("buenos días") ||
        texto.includes("buenas") ||
        texto.includes("buenas tardes") ||
        texto.includes("buenas noches")
    ) {

        return  "🌎 Soy <strong>EcoBot</strong>, el asistente inteligente de ReciBot 2.0. Puedo ayudarte con reciclaje, residuos y cuidado del medio ambiente.";

    }

    // Despedidas
    if (
        texto.includes("adiós") ||
        texto.includes("hasta luego") ||
        texto.includes("chao")
    ) {

        return "👋 ¡Hasta luego! Recuerda reciclar y cuidar el planeta.";

    }

    // Agradecimientos
    if (
        texto.includes("gracias") ||
        texto.includes("muchas gracias")
    ) {

        return "😊 ¡Con mucho gusto! Estoy para ayudarte.";

    }

    // Presentación
   if (
    texto.includes("quien eres") ||
    texto.includes("quién eres") ||
    texto.includes("que eres") ||
    texto.includes("qué eres") ||
    texto.includes("eres quien")
    ) {

        return `👋 Hola.

Soy <strong>EcoBot</strong>, tu asistente ambiental inteligente.

Puedo ayudarte a:

♻️ Clasificar residuos.

🗑️ Identificar el contenedor correcto.

🌱 Explicar conceptos de reciclaje.

💡 Compartir consejos para cuidar el planeta.

¿En qué puedo ayudarte hoy?`;

    }

    // Qué haces
    if (
        texto.includes("qué haces") ||
        texto.includes("que haces")
    ) {

        return "♻️ Puedo responder preguntas sobre reciclaje, residuos y medio ambiente.";

    }
    // Resumen personalizado del historial
if (
    texto.includes("mi historial") ||
    texto.includes("mis clasificaciones") ||
    texto.includes("resumen") ||
    texto.includes("cómo va el modelo") ||
    texto.includes("como va el modelo") ||
    texto.includes("estado del modelo") ||
    texto.includes("analiza mis datos")
) {
    const generarResumen =
        window.HistoryRecibot
            ?.generarResumenInteligente;

    if (typeof generarResumen === "function") {
        const resumen = generarResumen();

        return `
            <div class="eco-card">
                <h4>🧠 Resumen de tus clasificaciones</h4>

                <div class="eco-divider"></div>

                <div class="eco-card-section">
                    ${resumen
                        .split("\n\n")
                        .filter(Boolean)
                        .map(
                            parrafo => `<p>${parrafo}</p>`
                        )
                        .join("")}
                </div>
            </div>
        `;
    }

    return "No pude consultar el historial en este momento.";
}
// Contenedor verde
if (
    texto.includes("contenedor verde") ||
    texto.includes("qué va en el contenedor verde") ||
    texto.includes("que va en el contenedor verde")
) {

    return `

<div class="eco-card">

    <h4>🟢 Contenedor Verde</h4>

    <div class="eco-divider"></div>

    <div class="eco-card-section">

        Aquí se depositan principalmente:

        <br><br>

        🍌 Restos de frutas.

        <br>

        🥬 Verduras.

        <br>

        ☕ Residuos de café.

        <br>

        🍃 Hojas y residuos de jardinería.

        <br><br>

        ♻️ Estos residuos pueden convertirse en compost.

    </div>

</div>

`;

}
let categoria = buscarCategoria(texto);

if(!categoria){

    categoria = buscarObjeto(texto);  
    

}

if(categoria){

    const info = obtenerInformacionCategoria(categoria);

    if(info){
        memoriaConversacion.ultimaCategoria =
    categoria;

    memoriaConversacion.ultimoTema =
        null; 

    const objetoDetectado =
    detectarObjetoMencionado(texto);

if (objetoDetectado) {
    memoriaConversacion.ultimoObjeto =
        objetoDetectado;
}
sessionStorage.setItem(
    "ultimoObjeto",
    objetoDetectado
);


sessionStorage.setItem(
    "ultimaCategoria",
    categoria
);

sessionStorage.setItem(
    "ultimoTema",
    memoriaConversacion.ultimoTema
);
const temaActual =
    temaDetectado ||
    memoriaConversacion.ultimoTema;

if (temaActual === "beneficio") {
    return "🌱 " + info.beneficio;
}

if (temaActual === "contenedor") {
    return "🗑️ Debe ir al contenedor " +
        info.contenedor;
}

if (temaActual === "consejo") {
    return "💡 " + info.consejo;
}

if (temaActual === "curiosidad") {
    return "📚 " + info.curiosidad;
}

      return `

<div class="eco-card">

    <h4>📦 ${categoria}</h4>

    <div class="eco-divider"></div>

    <div class="eco-card-section">

        <div class="eco-card-title">
            🗑️ CONTENEDOR
        </div>

        ${info.contenedor}

    </div>

    <div class="eco-divider"></div>

    <div class="eco-card-section">

        <div class="eco-card-title">
            💡 CONSEJO
        </div>

        ${info.consejo}

    </div>

    <div class="eco-divider"></div>

    <div class="eco-card-section">

        <div class="eco-card-title">
            🌱 BENEFICIO
        </div>

        ${info.beneficio}

    </div>

    <div class="eco-divider"></div>

    <div class="eco-card-section">

        <div class="eco-card-title">
            📚 CURIOSIDAD
        </div>

        ${info.curiosidad}

    </div>

</div>

`;

    }

}
const ultimaCategoria = obtenerUltimaCategoria();

if(ultimaCategoria){

    if(

        texto.includes("beneficio") ||

        texto.includes("consejo") ||

        texto.includes("contenedor") ||

        texto.includes("curiosidad")

    ){

        const info = obtenerInformacionCategoria(
            ultimaCategoria
        );

        if(info){

            if(texto.includes("beneficio")){

                return "🌱 " + info.beneficio;

            }

            if(texto.includes("consejo")){

                return "💡 " + info.consejo;

            }

            if(texto.includes("contenedor")){

                return "🗑️ Debe ir al contenedor " + info.contenedor;

            }

            if(texto.includes("curiosidad")){

                return "📚 " + info.curiosidad;

            }

        }

    }

}
    return "🤔 Aún no conozco esa respuesta. Intenta preguntarme sobre reciclaje o residuos.";

}
function obtenerConsejoAmbiental(){

    const consejos = [

        "💧 Cierra la llave mientras te cepillas los dientes.",

        "🌳 Planta un árbol o cuida uno cercano.",

        "♻️ Separa correctamente tus residuos.",

        "🛍️ Usa bolsas reutilizables.",

        "🚲 Siempre que puedas utiliza bicicleta o camina.",

        "🔌 Desconecta los cargadores cuando no los uses.",

        "💡 Aprovecha la luz natural durante el día.",

        "🥤 Evita los plásticos de un solo uso."

    ];

    return consejos[
        Math.floor(
            Math.random() * consejos.length
        )
    ];

}
function obtenerRespuestaDegradacion(objeto, categoria) {

    const tiempos = {
        botella: {
            categoria: "Plástico",
            respuesta:
                "🕒 Una botella de plástico puede tardar más de 400 años en degradarse."
        },

        bolsa: {
            categoria: "Plástico",
            respuesta:
                "🕒 Una bolsa plástica puede tardar entre 10 y 150 años en degradarse."
        },

        lata: {
            categoria: "Metal",
            respuesta:
                "🕒 Una lata metálica puede tardar aproximadamente 200 años en degradarse."
        },

        periódico: {
            categoria: "Cartón",
            respuesta:
                "🕒 Un periódico puede degradarse en varias semanas si permanece en condiciones naturales adecuadas."
        },

        papel: {
            categoria: "Cartón",
            respuesta:
                "🕒 El papel puede tardar entre 2 y 5 meses en degradarse."
        },

        caja: {
            categoria: "Cartón",
            respuesta:
                "🕒 Una caja de cartón puede degradarse en pocos meses si está limpia y expuesta a condiciones naturales."
        },

        frasco: {
            categoria: "Vidrio",
            respuesta:
                "🕒 Un frasco de vidrio puede tardar miles de años en degradarse."
        },

        vaso: {
            categoria: categoria,
            respuesta:
                `🕒 El tiempo de degradación de un vaso depende del material del que esté fabricado.`
        },

        envase: {
            categoria: categoria,
            respuesta:
                `🕒 El tiempo de degradación de un envase depende de su material: plástico, vidrio, metal o cartón.`
        }
    };

    if (objeto && tiempos[objeto]) {
        return tiempos[objeto].respuesta;
    }

    if (categoria === "Plástico") {
        return "🕒 Los residuos plásticos pueden tardar desde varias décadas hasta cientos de años en degradarse.";
    }

    if (categoria === "Metal") {
        return "🕒 Los residuos metálicos pueden tardar décadas o incluso siglos en degradarse.";
    }

    if (categoria === "Vidrio") {
        return "🕒 El vidrio puede permanecer en el ambiente durante miles de años.";
    }

    if (categoria === "Cartón") {
        return "🕒 El cartón suele degradarse en algunos meses si permanece limpio y en condiciones naturales.";
    }

    if (categoria === "Orgánico") {
        return "🕒 Los residuos orgánicos pueden degradarse en días o meses, según el tipo de residuo y las condiciones ambientales.";
    }

    return null;
}
function buscarCategoria(texto){

    texto = texto.toLowerCase();

    if(texto.includes("cartón") || texto.includes("carton"))
        return "Cartón";

    if(texto.includes("plástico") || texto.includes("plastico"))
        return "Plástico";

    if(texto.includes("vidrio"))
        return "Vidrio";

    if(texto.includes("metal"))
        return "Metal";

    if(texto.includes("orgánico") || texto.includes("organico"))
        return "Orgánico";

    return null;

}
function detectarObjetoMencionado(texto) {
    const objetos = [
        "botella",
        "lata",
        "periódico",
        "periodico",
        "caja",
        "frasco",
        "vaso",
        "bolsa",
        "papel",
        "envase",
        "cartón",
        "carton"
    ];

    const objetoEncontrado = objetos.find(
        (objeto) => texto.includes(objeto)
    );

    if (!objetoEncontrado) {
        return null;
    }

    const nombresNormalizados = {
        periodico: "periódico",
        carton: "cartón"
    };

    return (
        nombresNormalizados[objetoEncontrado] ||
        objetoEncontrado
    );
}
function buscarObjeto(texto){

    texto = texto.toLowerCase();

    const objetos = {

        "botella":"Vidrio",
        "botellas":"Vidrio",

        "vaso":"Vidrio",

        "frasco":"Vidrio",

        "lata":"Metal",
        "latas":"Metal",

        "tarro":"Metal",

        "cartón":"Cartón",
        "caja":"Cartón",
        "papel":"Cartón",

        "bolsa":"Plástico",
        "botella plastica":"Plástico",
        "envase":"Plástico",

        "cáscaras":"Orgánico",
        "cascaras":"Orgánico",
        "comida":"Orgánico",
        "fruta":"Orgánico",
        "verdura":"Orgánico"

    };

    for(const objeto in objetos){

        if(texto.includes(objeto)){

            return objetos[objeto];

        }

    }

    return null;

}
function preguntaRapida(texto) {
    const input = document.getElementById(
        "preguntaUsuario"
    );

    if (!input) {
        return;
    }

    input.value = texto;
    enviarPregunta();
}
window.preguntaRapida = preguntaRapida;
// =====================================
// ECOCHAT 2.0
// Motor conversacional local
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    inicializarEcoChat();

});

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
    const chat = document.getElementById("chatMensajes");

    if (!chat) return;

    chat.insertAdjacentHTML(
        "beforeend",
        `
        <div class="chat-message bot" id="typingMessage">
            <div class="chat-avatar">🤖</div>

            <div class="chat-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
        `
    );

    chat.scrollTop = chat.scrollHeight;
}
function ocultarTyping(){

    const typing = document.getElementById("typingMessage");

    if(typing){

        typing.remove();

    }

}
function interpretarPregunta(pregunta){

    const texto = pregunta.toLowerCase();

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
let categoria = buscarCategoria(texto);

if(!categoria){

    categoria = buscarObjeto(texto);
    
    function obtenerUltimaCategoria(){

    return sessionStorage.getItem(
        "ultimaCategoria"
    );

}

}

if(categoria){

    const info = obtenerInformacionCategoria(categoria);

    if(info){

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
function preguntaRapida(texto){

    const input = document.getElementById("preguntaUsuario");

    input.value = texto;

    document.getElementById("btnEnviarPregunta").click();

}
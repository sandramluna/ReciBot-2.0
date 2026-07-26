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

    const respuesta = interpretarPregunta(pregunta);

    agregarMensajeBot(respuesta);

}
function agregarMensajeUsuario(texto){

    const chat = document.getElementById("chatMensajes");

    chat.innerHTML += `
        <div class="mensaje-usuario">
            ${texto}
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

}
function agregarMensajeBot(texto){

    const chat = document.getElementById("chatMensajes");

    chat.innerHTML += `
        <div class="mensaje-bot">
            ${texto}
        </div>
    `;

    chat.scrollTop = chat.scrollHeight;

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

        return "👋 ¡Hola! Soy EcoChat. ¿En qué puedo ayudarte sobre reciclaje o medio ambiente?";

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

        return "🌎 Soy EcoChat, el asistente ambiental de ReciBot 2.0.";

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
📦 <strong>${categoria}</strong><br><br>

🗑️ <strong>Contenedor:</strong> ${info.contenedor}<br><br>

💡 <strong>Consejo:</strong><br>
${info.consejo}<br><br>

🌱 <strong>Beneficio:</strong><br>
${info.beneficio}

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
const BASE_CONOCIMIENTO = {

    "Orgánico": {
        contenedor: "Verde",

        consejo:
            "Deposita aquí restos de comida, cáscaras de frutas y residuos vegetales. Evita mezclarlos con plástico o vidrio.",

        curiosidad:
            "Más del 50% de los residuos domésticos pueden convertirse en compost.",

        beneficio:
            "El compost reduce la cantidad de basura enviada a los rellenos sanitarios.",

        mensaje:
            "🌱 Cada residuo orgánico correctamente separado ayuda a cuidar el planeta."
    },

    "Cartón": {

    contenedor: "Blanco",

    consejo:
        "Deposita cajas, cartón y papel limpio y seco. Evita materiales con grasa o humedad.",

    curiosidad:
        "Reciclar una tonelada de cartón puede evitar la tala de aproximadamente 17 árboles.",

    beneficio:
        "Reduce el consumo de madera y el uso de agua en la fabricación de papel.",

    mensaje:
        "📦 Cada caja reciclada representa un árbol menos talado."

},

"Plástico": {

    contenedor: "Blanco",

    consejo:
        "Enjuaga los envases antes de reciclarlos y reduce el uso de plásticos de un solo uso.",

    curiosidad:
        "Una botella plástica puede tardar más de 400 años en degradarse.",

    beneficio:
        "Reciclar plástico reduce la contaminación de océanos y ecosistemas.",

    mensaje:
        "🧴 Cada envase reciclado evita más contaminación."

},

"Metal": {

    contenedor: "Blanco",

    consejo:
        "Deposita latas y envases metálicos limpios y vacíos.",

    curiosidad:
        "El aluminio puede reciclarse prácticamente de forma indefinida.",

    beneficio:
        "Reciclar aluminio ahorra hasta un 95% de la energía necesaria para producirlo desde cero.",

    mensaje:
        "🥫 El reciclaje de metales ahorra enormes cantidades de energía."

},

"Vidrio": {

    contenedor: "Blanco",

    consejo:
        "Deposita únicamente envases de vidrio limpios y sin tapas.",

    curiosidad:
        "El vidrio puede reciclarse infinitas veces sin perder calidad.",

    beneficio:
        "Reduce la extracción de arena y disminuye el consumo energético.",

    mensaje:
        "🍾 Cada botella reciclada puede convertirse en una nueva."

}

};

function obtenerInformacionCategoria(categoria) {
    return BASE_CONOCIMIENTO[categoria] || null;
}
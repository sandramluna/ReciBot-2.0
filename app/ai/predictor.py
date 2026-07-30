from pathlib import Path
from threading import Lock

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

RAIZ_PROYECTO = Path(__file__).resolve().parents[2]

MODELO_PATH = RAIZ_PROYECTO / "model" / "training" / "modelo.keras"
LABELS_PATH = RAIZ_PROYECTO / "model" / "training" / "labels.txt"

IMAGE_SIZE = (224, 224)


NOMBRES_ES = {
    "cardboard": "Cartón",
    "glass": "Vidrio",
    "metal": "Metal",
    "organic": "Orgánico",
    "plastic": "Plástico",
}

RECOMENDACIONES = {
    "cardboard": "Retira cintas y restos de comida. Deposítalo en el contenedor blanco.",
    "glass": "Enjuaga el envase antes de reciclarlo. Deposítalo en el contenedor blanco.",
    "metal": "Limpia el envase metálico y deposítalo en el contenedor blanco.",
    "organic": "Deposita el residuo en el contenedor verde. Puede convertirse en compost.",
    "plastic": "Vacía, limpia y seca el envase antes de reciclarlo.",
}

_modelo = None
_etiquetas = None
_lock = Lock()


# ==========================================================
# ETIQUETAS
# ==========================================================

def cargar_etiquetas():

    if not LABELS_PATH.exists():
        raise FileNotFoundError(
            f"No existe:\n{LABELS_PATH}"
        )

    etiquetas = [
        linea.strip()
        for linea in LABELS_PATH.read_text(
            encoding="utf-8"
        ).splitlines()
        if linea.strip()
    ]

    if not etiquetas:
        raise RuntimeError(
            "labels.txt está vacío."
        )

    return etiquetas


# ==========================================================
# MODELO
# ==========================================================

def obtener_modelo():

    global _modelo
    global _etiquetas

    if _modelo is None:

        with _lock:

            if _modelo is None:

                if not MODELO_PATH.exists():
                    raise FileNotFoundError(
                        f"No existe el modelo:\n{MODELO_PATH}"
                    )

                print("Cargando modelo...")

                _modelo = tf.keras.models.load_model(
                    MODELO_PATH
                )

                _etiquetas = cargar_etiquetas()

                print("Modelo cargado correctamente.")

    return _modelo


# ==========================================================
# IMAGEN
# ==========================================================

def preparar_imagen(ruta):

    ruta = Path(ruta)

    if not ruta.exists():
        raise FileNotFoundError(
            f"No existe la imagen:\n{ruta}"
        )

    try:

        with Image.open(ruta) as imagen:

            imagen = imagen.convert("RGB")
            imagen = imagen.resize(IMAGE_SIZE)

            arreglo = np.array(
                imagen,
                dtype=np.float32,
            )

    except UnidentifiedImageError:

        raise ValueError(
            "La imagen no es válida."
        )

    arreglo = np.expand_dims(
        arreglo,
        axis=0,
    )

    return arreglo


# ==========================================================
# PREDICCIÓN
# ==========================================================

def clasificar_imagen(ruta_imagen):

    modelo = obtener_modelo()

    if _etiquetas is None:
        raise RuntimeError(
            "Las etiquetas no fueron cargadas."
        )

    imagen = preparar_imagen(
        ruta_imagen
    )

    probabilidades = modelo.predict(
        imagen,
        verbose=0,
    )[0]

    indice = int(
        np.argmax(probabilidades)
    )

    if indice >= len(_etiquetas):
        raise RuntimeError(
            "El modelo devolvió una clase inexistente."
        )

    etiqueta = _etiquetas[indice]

    confianza = float(
        probabilidades[indice]
    )

    return {

        "etiqueta": etiqueta,

        "categoria": NOMBRES_ES.get(
            etiqueta,
            etiqueta,
        ),

        "confianza": confianza,

        "confianza_porcentaje": round(
            confianza * 100,
            2,
        ),

        "recomendacion": RECOMENDACIONES.get(
            etiqueta,
            "",
        ),

        "probabilidades": {

            nombre: round(
                float(prob) * 100,
                2,
            )

            for nombre, prob in zip(
                _etiquetas,
                probabilidades,
            )

        },

    }
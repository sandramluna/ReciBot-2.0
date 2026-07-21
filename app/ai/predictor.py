from pathlib import Path
from threading import Lock

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError


# ==========================================================
# RUTAS Y CONFIGURACIÓN
# ==========================================================

RAIZ_PROYECTO = Path(__file__).resolve().parents[2]

MODELO_PATH = (
    RAIZ_PROYECTO
    / "model"
    / "training"
    / "modelo.keras"
)

LABELS_PATH = (
    RAIZ_PROYECTO
    / "model"
    / "training"
    / "labels.txt"
)

IMAGE_SIZE = (224, 224)

NOMBRES_ES = {
    "cardboard": "Cartón",
    "glass": "Vidrio",
    "metal": "Metal",
    "organic": "Orgánico",
    "plastic": "Plástico",
}

RECOMENDACIONES = {
    "cardboard": (
        "Retira cintas, grapas y restos de comida. "
        "Deposita el cartón limpio y seco en el recipiente blanco."
    ),
    "glass": (
        "Vacía y enjuaga el recipiente. "
        "Deposítalo con cuidado en el recipiente blanco."
    ),
    "metal": (
        "Limpia latas y envases metálicos antes de reciclarlos. "
        "Deposítalos en el recipiente blanco."
    ),
    "organic": (
        "Deposita este residuo en el recipiente verde. "
        "Puede aprovecharse para producir compost."
    ),
    "plastic": (
        "Vacía, limpia y seca el envase. "
        "Deposítalo en el recipiente blanco cuando sea aprovechable."
    ),
}


# ==========================================================
# CARGA ÚNICA DEL MODELO
# ==========================================================

_modelo = None
_etiquetas = None
_bloqueo = Lock()


def cargar_etiquetas() -> list[str]:
    """Carga el orden de las clases usado durante el entrenamiento."""

    if not LABELS_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo de etiquetas:\n{LABELS_PATH}"
        )

    etiquetas = [
        linea.strip()
        for linea in LABELS_PATH.read_text(
            encoding="utf-8"
        ).splitlines()
        if linea.strip()
    ]

    if not etiquetas:
        raise ValueError(
            "El archivo labels.txt está vacío."
        )

    return etiquetas


def obtener_modelo() -> tf.keras.Model:
    """
    Carga el modelo una sola vez y lo reutiliza
    durante la ejecución de Flask.
    """

    global _modelo, _etiquetas

    if _modelo is None:
        with _bloqueo:
            if _modelo is None:
                if not MODELO_PATH.exists():
                    raise FileNotFoundError(
                        f"No se encontró el modelo:\n{MODELO_PATH}"
                    )

                print("Cargando modelo de ReciBot...")

                _modelo = tf.keras.models.load_model(
                    MODELO_PATH
                )

                _etiquetas = cargar_etiquetas()

                print("Modelo de ReciBot cargado correctamente.")

    return _modelo


# ==========================================================
# PROCESAMIENTO Y PREDICCIÓN
# ==========================================================

def preparar_imagen(
    ruta_imagen: str | Path,
) -> np.ndarray:
    """Convierte la imagen al formato esperado por el modelo."""

    ruta = Path(ruta_imagen)

    if not ruta.exists():
        raise FileNotFoundError(
            f"No se encontró la imagen:\n{ruta}"
        )

    try:
        with Image.open(ruta) as imagen:
            imagen = imagen.convert("RGB")
            imagen = imagen.resize(IMAGE_SIZE)

            arreglo = np.asarray(
                imagen,
                dtype=np.float32,
            )

    except UnidentifiedImageError as error:
        raise ValueError(
            "El archivo recibido no es una imagen válida."
        ) from error

    # El modelo ya contiene preprocess_input,
    # por lo que aquí no normalizamos manualmente.
    arreglo = np.expand_dims(
        arreglo,
        axis=0,
    )

    return arreglo


def clasificar_imagen(
    ruta_imagen: str | Path,
) -> dict:
    """
    Clasifica una imagen y devuelve la categoría,
    confianza y recomendación ambiental.
    """

    modelo = obtener_modelo()
    imagen = preparar_imagen(ruta_imagen)

    probabilidades = modelo.predict(
        imagen,
        verbose=0,
    )[0]

    indice = int(
        np.argmax(probabilidades)
    )

    confianza = float(
        probabilidades[indice]
    )

    etiqueta = _etiquetas[indice]

    return {
        "etiqueta": etiqueta,
        "categoria": NOMBRES_ES.get(
            etiqueta,
            etiqueta.capitalize(),
        ),
        "confianza": confianza,
        "confianza_porcentaje": round(
            confianza * 100,
            2,
        ),
        "recomendacion": RECOMENDACIONES.get(
            etiqueta,
            "Consulta las normas locales para disponer correctamente este residuo.",
        ),
        "probabilidades": {
            nombre: round(
                float(probabilidad) * 100,
                2,
            )
            for nombre, probabilidad in zip(
                _etiquetas,
                probabilidades,
            )
        },
    }
import tensorflow as tf

from model.training.config import (
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    NUM_CLASSES,
)
from model.training.model_builder import construir_modelo


def main() -> None:
    print("Construyendo el modelo de ReciBot...\n")

    modelo = construir_modelo()

    modelo.summary()

    lote_prueba = tf.random.uniform(
        shape=(
            2,
            IMAGE_HEIGHT,
            IMAGE_WIDTH,
            3,
        ),
        minval=0,
        maxval=255,
        dtype=tf.float32,
    )

    predicciones = modelo(
        lote_prueba,
        training=False,
    )

    print("\nModelo construido correctamente.")
    print(f"Forma de entrada: {lote_prueba.shape}")
    print(f"Forma de salida: {predicciones.shape}")
    print(f"Número de clases: {NUM_CLASSES}")

    print("\nSuma de probabilidades por imagen:")
    print(
        tf.reduce_sum(
            predicciones,
            axis=1,
        ).numpy()
    )


if __name__ == "__main__":
    main()
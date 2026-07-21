import json

import tensorflow as tf

from model.training.config import (
    CLASS_NAMES,
    EARLY_STOPPING_PATIENCE,
    EPOCHS,
    HISTORY_PATH,
    MIN_LEARNING_RATE,
    MODELO_PATH,
    REDUCE_LR_FACTOR,
    REDUCE_LR_PATIENCE,
    TRAINING_DIR,
)
from model.training.data_loader import cargar_datasets
from model.training.model_builder import construir_modelo


def preparar_directorio_salida() -> None:
    """Crea el directorio donde se guardarán los resultados."""

    TRAINING_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


def crear_callbacks() -> list[tf.keras.callbacks.Callback]:
    """Configura los callbacks usados durante el entrenamiento."""

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        filepath=MODELO_PATH,
        monitor="val_loss",
        mode="min",
        save_best_only=True,
        save_weights_only=False,
        verbose=1,
    )

    early_stopping = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        mode="min",
        patience=EARLY_STOPPING_PATIENCE,
        restore_best_weights=True,
        verbose=1,
    )

    reducir_learning_rate = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        mode="min",
        factor=REDUCE_LR_FACTOR,
        patience=REDUCE_LR_PATIENCE,
        min_lr=MIN_LEARNING_RATE,
        verbose=1,
    )

    terminar_si_nan = tf.keras.callbacks.TerminateOnNaN()

    return [
        checkpoint,
        early_stopping,
        reducir_learning_rate,
        terminar_si_nan,
    ]


def convertir_historial_a_json(
    historial: tf.keras.callbacks.History,
) -> dict:
    """Convierte los valores del historial en datos serializables."""

    return {
        clave: [
            float(valor)
            for valor in valores
        ]
        for clave, valores in historial.history.items()
    }


def guardar_historial(
    historial: tf.keras.callbacks.History,
) -> None:
    """Guarda el historial de entrenamiento en formato JSON."""

    datos = convertir_historial_a_json(historial)

    with HISTORY_PATH.open(
        mode="w",
        encoding="utf-8",
    ) as archivo:
        json.dump(
            datos,
            archivo,
            indent=4,
            ensure_ascii=False,
        )


def guardar_etiquetas() -> None:
    """Guarda el orden de las categorías del modelo."""

    labels_path = TRAINING_DIR / "labels.txt"

    with labels_path.open(
        mode="w",
        encoding="utf-8",
    ) as archivo:
        for clase in CLASS_NAMES:
            archivo.write(f"{clase}\n")


def entrenar_modelo() -> tuple[
    tf.keras.Model,
    tf.keras.callbacks.History,
]:
    """Carga los datos, construye el modelo y lo entrena."""

    preparar_directorio_salida()

    print("\nCargando datasets...")
    train_dataset, validation_dataset, _ = cargar_datasets()

    print("\nConstruyendo modelo...")
    modelo = construir_modelo()

    print("\nIniciando entrenamiento de ReciBot...")
    print(
        "El tiempo dependerá de la capacidad del computador.\n"
    )

    historial = modelo.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=EPOCHS,
        callbacks=crear_callbacks(),
        verbose=1,
    )

    guardar_historial(historial)
    guardar_etiquetas()

    return modelo, historial


def main() -> None:
    modelo, historial = entrenar_modelo()

    epocas_realizadas = len(
        historial.history.get(
            "loss",
            [],
        )
    )

    print("\n" + "=" * 60)
    print("ENTRENAMIENTO FINALIZADO")
    print("=" * 60)
    print(f"Épocas realizadas: {epocas_realizadas}")
    print(f"Modelo guardado en: {MODELO_PATH}")
    print(f"Historial guardado en: {HISTORY_PATH}")
    print(f"Salida del modelo: {modelo.output_shape}")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()

    except (
        FileNotFoundError,
        ValueError,
        OSError,
        RuntimeError,
    ) as error:
        print("\nERROR DURANTE EL ENTRENAMIENTO")
        print("-" * 60)
        print(error)
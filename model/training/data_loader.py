import tensorflow as tf

from model.training.config import (
    AUTOTUNE,
    BATCH_SIZE,
    CLASS_NAMES,
    IMAGE_SIZE,
    SEED,
    TEST_DIR,
    TRAIN_DIR,
    VALIDATION_DIR,
)


def verificar_directorios() -> None:
    """Comprueba que existan las tres divisiones del dataset."""

    directorios = {
        "entrenamiento": TRAIN_DIR,
        "validación": VALIDATION_DIR,
        "prueba": TEST_DIR,
    }

    for nombre, directorio in directorios.items():
        if not directorio.exists():
            raise FileNotFoundError(
                f"No se encontró el directorio de {nombre}:\n"
                f"{directorio}\n"
                "Ejecuta primero model/prepare_dataset.py."
            )


def cargar_directorio(
    directorio,
    shuffle: bool,
) -> tf.data.Dataset:
    """Carga imágenes y etiquetas desde una carpeta."""

    return tf.keras.utils.image_dataset_from_directory(
        directorio,
        labels="inferred",
        label_mode="int",
        class_names=CLASS_NAMES,
        color_mode="rgb",
        batch_size=BATCH_SIZE,
        image_size=IMAGE_SIZE,
        shuffle=shuffle,
        seed=SEED,
    )


def optimizar_dataset(
    dataset: tf.data.Dataset,
) -> tf.data.Dataset:
    """Optimiza la lectura de imágenes durante el entrenamiento."""

    return dataset.prefetch(buffer_size=AUTOTUNE)


def cargar_datasets() -> tuple[
    tf.data.Dataset,
    tf.data.Dataset,
    tf.data.Dataset,
]:
    """Carga train, validation y test."""

    verificar_directorios()

    train_dataset = cargar_directorio(
        TRAIN_DIR,
        shuffle=True,
    )

    validation_dataset = cargar_directorio(
        VALIDATION_DIR,
        shuffle=False,
    )

    test_dataset = cargar_directorio(
        TEST_DIR,
        shuffle=False,
    )

    train_dataset = optimizar_dataset(train_dataset)
    validation_dataset = optimizar_dataset(validation_dataset)
    test_dataset = optimizar_dataset(test_dataset)

    return (
        train_dataset,
        validation_dataset,
        test_dataset,
    )
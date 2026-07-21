import tensorflow as tf

from model.training.config import (
    DROPOUT_RATE,
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
    LEARNING_RATE,
    NUM_CLASSES,
    SEED,
)


def crear_aumento_datos() -> tf.keras.Sequential:
    """
    Crea transformaciones aleatorias para aumentar la diversidad
    de las imágenes durante el entrenamiento.
    """

    return tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip(
                mode="horizontal",
                seed=SEED,
            ),
            tf.keras.layers.RandomRotation(
                factor=0.10,
                seed=SEED,
            ),
            tf.keras.layers.RandomZoom(
                height_factor=0.10,
                width_factor=0.10,
                seed=SEED,
            ),
            tf.keras.layers.RandomTranslation(
                height_factor=0.08,
                width_factor=0.08,
                seed=SEED,
            ),
            tf.keras.layers.RandomContrast(
                factor=0.10,
                seed=SEED,
            ),
        ],
        name="data_augmentation",
    )


def crear_modelo_base() -> tf.keras.Model:
    """
    Carga MobileNetV2 con pesos preentrenados en ImageNet.

    Se elimina su clasificador original porque ReciBot
    tendrá su propia salida de cinco categorías.
    """

    modelo_base = tf.keras.applications.MobileNetV2(
        input_shape=(
            IMAGE_HEIGHT,
            IMAGE_WIDTH,
            3,
        ),
        include_top=False,
        weights="imagenet",
    )

    # Primera etapa de transferencia de aprendizaje:
    # las capas de MobileNetV2 permanecen congeladas.
    modelo_base.trainable = False

    return modelo_base


def construir_modelo() -> tf.keras.Model:
    """
    Construye y compila el modelo clasificador de ReciBot.
    """

    aumento_datos = crear_aumento_datos()
    modelo_base = crear_modelo_base()

    entradas = tf.keras.Input(
        shape=(
            IMAGE_HEIGHT,
            IMAGE_WIDTH,
            3,
        ),
        name="imagen_entrada",
    )

    # Las transformaciones aleatorias solo se aplican
    # automáticamente durante el entrenamiento.
    x = aumento_datos(entradas)

    # MobileNetV2 necesita píxeles transformados al intervalo [-1, 1].
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

    # training=False mantiene estables las capas BatchNormalization
    # del modelo preentrenado.
    x = modelo_base(
        x,
        training=False,
    )

    x = tf.keras.layers.GlobalAveragePooling2D(
        name="global_average_pooling",
    )(x)

    x = tf.keras.layers.Dropout(
        rate=DROPOUT_RATE,
        name="dropout",
    )(x)

    salidas = tf.keras.layers.Dense(
        units=NUM_CLASSES,
        activation="softmax",
        name="clasificador",
    )(x)

    modelo = tf.keras.Model(
        inputs=entradas,
        outputs=salidas,
        name="recibot_mobilenetv2",
    )

    modelo.compile(
        optimizer=tf.keras.optimizers.Adam(
            learning_rate=LEARNING_RATE,
        ),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=[
            tf.keras.metrics.SparseCategoricalAccuracy(
                name="accuracy",
            ),
        ],
    )

    return modelo
import json

import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    classification_report,
    confusion_matrix,
)

from model.training.config import (
    ACCURACY_GRAPH_PATH,
    CLASS_NAMES,
    CLASSIFICATION_REPORT_PATH,
    CONFUSION_MATRIX_PATH,
    HISTORY_PATH,
    LOSS_GRAPH_PATH,
    METRICS_PATH,
    MODELO_PATH,
)
from model.training.data_loader import cargar_datasets


def cargar_modelo() -> tf.keras.Model:
    """Carga el mejor modelo guardado durante el entrenamiento."""

    if not MODELO_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró el modelo:\n{MODELO_PATH}\n"
            "Ejecuta primero el entrenamiento."
        )

    print(f"Cargando modelo desde:\n{MODELO_PATH}\n")

    return tf.keras.models.load_model(MODELO_PATH)


def obtener_etiquetas_y_predicciones(
    modelo: tf.keras.Model,
    test_dataset: tf.data.Dataset,
) -> tuple[np.ndarray, np.ndarray]:
    """Obtiene las etiquetas reales y las predicciones del modelo."""

    etiquetas_reales = []
    predicciones = []

    for imagenes, etiquetas in test_dataset:
        probabilidades = modelo.predict(
            imagenes,
            verbose=0,
        )

        clases_predichas = np.argmax(
            probabilidades,
            axis=1,
        )

        etiquetas_reales.extend(
            etiquetas.numpy().tolist()
        )

        predicciones.extend(
            clases_predichas.tolist()
        )

    return (
        np.asarray(etiquetas_reales),
        np.asarray(predicciones),
    )


def evaluar_modelo(
    modelo: tf.keras.Model,
    test_dataset: tf.data.Dataset,
) -> dict:
    """Calcula loss y accuracy sobre el conjunto de prueba."""

    resultados = modelo.evaluate(
        test_dataset,
        verbose=1,
        return_dict=True,
    )

    return {
        clave: float(valor)
        for clave, valor in resultados.items()
    }


def guardar_reporte_clasificacion(
    etiquetas_reales: np.ndarray,
    predicciones: np.ndarray,
) -> dict:
    """Genera y guarda precision, recall y F1 por categoría."""

    reporte_texto = classification_report(
        etiquetas_reales,
        predicciones,
        target_names=CLASS_NAMES,
        digits=4,
        zero_division=0,
    )

    reporte_dict = classification_report(
        etiquetas_reales,
        predicciones,
        target_names=CLASS_NAMES,
        output_dict=True,
        zero_division=0,
    )

    with CLASSIFICATION_REPORT_PATH.open(
        mode="w",
        encoding="utf-8",
    ) as archivo:
        archivo.write(
            "REPORTE DE CLASIFICACIÓN DE RECIBOT\n"
        )
        archivo.write("=" * 60)
        archivo.write("\n\n")
        archivo.write(reporte_texto)

    print("\nReporte de clasificación:\n")
    print(reporte_texto)

    return reporte_dict


def crear_matriz_confusion(
    etiquetas_reales: np.ndarray,
    predicciones: np.ndarray,
) -> None:
    """Genera la matriz de confusión y la guarda como imagen."""

    matriz = confusion_matrix(
        etiquetas_reales,
        predicciones,
        labels=range(len(CLASS_NAMES)),
    )

    figura, eje = plt.subplots(
        figsize=(9, 8),
    )

    visualizacion = ConfusionMatrixDisplay(
        confusion_matrix=matriz,
        display_labels=CLASS_NAMES,
    )

    visualizacion.plot(
        ax=eje,
        cmap="Blues",
        values_format="d",
        colorbar=False,
    )

    eje.set_title(
        "Matriz de confusión — ReciBot"
    )

    figura.tight_layout()
    figura.savefig(
        CONFUSION_MATRIX_PATH,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close(figura)


def cargar_historial() -> dict:
    """Carga el historial producido durante el entrenamiento."""

    if not HISTORY_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró el historial:\n{HISTORY_PATH}"
        )

    with HISTORY_PATH.open(
        mode="r",
        encoding="utf-8",
    ) as archivo:
        return json.load(archivo)


def crear_grafica_accuracy(
    historial: dict,
) -> None:
    """Genera la gráfica de precisión por época."""

    epocas = range(
        1,
        len(historial["accuracy"]) + 1,
    )

    figura = plt.figure(
        figsize=(9, 6),
    )

    plt.plot(
        epocas,
        historial["accuracy"],
        marker="o",
        label="Entrenamiento",
    )

    plt.plot(
        epocas,
        historial["val_accuracy"],
        marker="o",
        label="Validación",
    )

    plt.title(
        "Precisión durante el entrenamiento"
    )
    plt.xlabel("Época")
    plt.ylabel("Accuracy")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()

    figura.savefig(
        ACCURACY_GRAPH_PATH,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close(figura)


def crear_grafica_loss(
    historial: dict,
) -> None:
    """Genera la gráfica de pérdida por época."""

    epocas = range(
        1,
        len(historial["loss"]) + 1,
    )

    figura = plt.figure(
        figsize=(9, 6),
    )

    plt.plot(
        epocas,
        historial["loss"],
        marker="o",
        label="Entrenamiento",
    )

    plt.plot(
        epocas,
        historial["val_loss"],
        marker="o",
        label="Validación",
    )

    plt.title(
        "Pérdida durante el entrenamiento"
    )
    plt.xlabel("Época")
    plt.ylabel("Loss")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()

    figura.savefig(
        LOSS_GRAPH_PATH,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close(figura)


def guardar_metricas(
    resultados_evaluacion: dict,
    reporte: dict,
) -> None:
    """Guarda las métricas principales en formato JSON."""

    metricas = {
        "test_loss": resultados_evaluacion.get(
            "loss"
        ),
        "test_accuracy": resultados_evaluacion.get(
            "accuracy"
        ),
        "macro_precision": reporte[
            "macro avg"
        ]["precision"],
        "macro_recall": reporte[
            "macro avg"
        ]["recall"],
        "macro_f1_score": reporte[
            "macro avg"
        ]["f1-score"],
        "weighted_f1_score": reporte[
            "weighted avg"
        ]["f1-score"],
    }

    with METRICS_PATH.open(
        mode="w",
        encoding="utf-8",
    ) as archivo:
        json.dump(
            metricas,
            archivo,
            indent=4,
            ensure_ascii=False,
        )


def main() -> None:
    print("\nIniciando evaluación de ReciBot...\n")

    _, _, test_dataset = cargar_datasets()

    modelo = cargar_modelo()

    resultados_evaluacion = evaluar_modelo(
        modelo,
        test_dataset,
    )

    etiquetas_reales, predicciones = (
        obtener_etiquetas_y_predicciones(
            modelo,
            test_dataset,
        )
    )

    reporte = guardar_reporte_clasificacion(
        etiquetas_reales,
        predicciones,
    )

    crear_matriz_confusion(
        etiquetas_reales,
        predicciones,
    )

    historial = cargar_historial()

    crear_grafica_accuracy(historial)
    crear_grafica_loss(historial)

    guardar_metricas(
        resultados_evaluacion,
        reporte,
    )

    print("\n" + "=" * 65)
    print("EVALUACIÓN FINALIZADA")
    print("=" * 65)

    print(
        "Accuracy de prueba: "
        f"{resultados_evaluacion['accuracy'] * 100:.2f}%"
    )

    print(
        "Loss de prueba: "
        f"{resultados_evaluacion['loss']:.4f}"
    )

    print(
        f"Matriz de confusión: {CONFUSION_MATRIX_PATH}"
    )

    print(
        f"Reporte: {CLASSIFICATION_REPORT_PATH}"
    )

    print(
        f"Gráfica de accuracy: {ACCURACY_GRAPH_PATH}"
    )

    print(
        f"Gráfica de loss: {LOSS_GRAPH_PATH}"
    )

    print(
        f"Métricas JSON: {METRICS_PATH}"
    )

    print("=" * 65)


if __name__ == "__main__":
    try:
        main()

    except (
        FileNotFoundError,
        ValueError,
        OSError,
        KeyError,
    ) as error:
        print("\nERROR DURANTE LA EVALUACIÓN")
        print("-" * 60)
        print(error)
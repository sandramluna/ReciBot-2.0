from pathlib import Path

from app.ai.predictor import clasificar_imagen


def main() -> None:
    raiz_proyecto = Path(__file__).resolve().parents[2]

    carpeta_test = (
        raiz_proyecto
        / "dataset"
        / "test"
        / "cardboard"
    )

    imagenes = sorted(
        archivo
        for archivo in carpeta_test.iterdir()
        if archivo.is_file()
    )

    if not imagenes:
        raise FileNotFoundError(
            "No hay imágenes disponibles para la prueba."
        )

    imagen_prueba = imagenes[0]

    print(f"\nImagen utilizada:\n{imagen_prueba}\n")

    resultado = clasificar_imagen(
        imagen_prueba
    )

    print("Resultado de ReciBot")
    print("=" * 50)
    print(
        f"Categoría: {resultado['categoria']}"
    )
    print(
        "Confianza: "
        f"{resultado['confianza_porcentaje']}%"
    )
    print(
        f"Recomendación: {resultado['recomendacion']}"
    )

    print("\nProbabilidades:")
    for clase, porcentaje in resultado[
        "probabilidades"
    ].items():
        print(
            f"- {clase}: {porcentaje}%"
        )


if __name__ == "__main__":
    main()
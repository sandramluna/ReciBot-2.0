from pathlib import Path
import random
import shutil


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

SEMILLA = 42
CANTIDAD_ORGANIC = 500

PORCENTAJE_TRAIN = 0.70
PORCENTAJE_VALIDATION = 0.15
PORCENTAJE_TEST = 0.15

EXTENSIONES_VALIDAS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# Carpeta principal del proyecto ReciBot-2.0
RAIZ_PROYECTO = Path(__file__).resolve().parent.parent

# Dataset final dentro del proyecto
DESTINO_DATASET = RAIZ_PROYECTO / "dataset"

# ==========================================================
# RUTAS DE LOS DATASETS DESCARGADOS
# Modifica estas rutas únicamente si en tu computador son distintas.
# ==========================================================

TRASHNET = Path.home() / "Documents" / "ReciBot" / "dataset-resized"

ORGANIC = (
    Path.home()
    / "Documents"
    / "ReciBot"
    / "DATASET"
    / "DATASET"
    / "TRAIN"
    / "O"
)

# Relación entre las carpetas originales y las clases de ReciBot
FUENTES = {
    "cardboard": TRASHNET / "cardboard",
    "glass": TRASHNET / "glass",
    "metal": TRASHNET / "metal",
    "plastic": TRASHNET / "plastic",
    "organic": ORGANIC,
}


def obtener_imagenes(carpeta: Path) -> list[Path]:
    """Devuelve las imágenes válidas encontradas en una carpeta."""

    if not carpeta.exists():
        raise FileNotFoundError(
            f"No se encontró la carpeta:\n{carpeta}\n"
            "Revisa la ruta configurada en el archivo."
        )

    return [
        archivo
        for archivo in carpeta.rglob("*")
        if archivo.is_file()
        and archivo.suffix.lower() in EXTENSIONES_VALIDAS
    ]


def limpiar_dataset_destino() -> None:
    """Elimina el contenido anterior de train, validation y test."""

    for division in ("train", "validation", "test"):
        carpeta = DESTINO_DATASET / division

        if carpeta.exists():
            shutil.rmtree(carpeta)

        carpeta.mkdir(parents=True, exist_ok=True)


def crear_carpetas_clases() -> None:
    """Crea las carpetas de las cinco clases en cada división."""

    for division in ("train", "validation", "test"):
        for clase in FUENTES:
            carpeta = DESTINO_DATASET / division / clase
            carpeta.mkdir(parents=True, exist_ok=True)


def copiar_imagenes(
    archivos: list[Path],
    clase: str,
    division: str,
) -> None:
    """Copia las imágenes y les asigna nombres únicos."""

    carpeta_destino = DESTINO_DATASET / division / clase

    for numero, archivo_origen in enumerate(archivos, start=1):
        nuevo_nombre = (
            f"{clase}_{division}_{numero:04d}"
            f"{archivo_origen.suffix.lower()}"
        )

        archivo_destino = carpeta_destino / nuevo_nombre
        shutil.copy2(archivo_origen, archivo_destino)


def dividir_imagenes(
    archivos: list[Path],
) -> tuple[list[Path], list[Path], list[Path]]:
    """Divide las imágenes en entrenamiento, validación y prueba."""

    random.shuffle(archivos)

    total = len(archivos)

    cantidad_train = int(total * PORCENTAJE_TRAIN)
    cantidad_validation = int(total * PORCENTAJE_VALIDATION)

    train = archivos[:cantidad_train]

    validation = archivos[
        cantidad_train:
        cantidad_train + cantidad_validation
    ]

    test = archivos[
        cantidad_train + cantidad_validation:
    ]

    return train, validation, test


def preparar_clase(clase: str, carpeta_fuente: Path) -> dict:
    """Procesa y distribuye las imágenes de una categoría."""

    imagenes = obtener_imagenes(carpeta_fuente)

    if clase == "organic":
        if len(imagenes) < CANTIDAD_ORGANIC:
            raise ValueError(
                f"La carpeta organic contiene solamente "
                f"{len(imagenes)} imágenes. Se necesitan "
                f"{CANTIDAD_ORGANIC}."
            )

        imagenes = random.sample(imagenes, CANTIDAD_ORGANIC)

    train, validation, test = dividir_imagenes(imagenes)

    copiar_imagenes(train, clase, "train")
    copiar_imagenes(validation, clase, "validation")
    copiar_imagenes(test, clase, "test")

    return {
        "total": len(imagenes),
        "train": len(train),
        "validation": len(validation),
        "test": len(test),
    }


def mostrar_informe(resultados: dict) -> None:
    """Muestra la distribución final del dataset."""

    print("\n" + "=" * 66)
    print("DATASET DE RECIBOT PREPARADO CORRECTAMENTE")
    print("=" * 66)

    encabezado = (
        f"{'Clase':<14}"
        f"{'Total':>10}"
        f"{'Train':>12}"
        f"{'Validation':>15}"
        f"{'Test':>10}"
    )

    print(encabezado)
    print("-" * 66)

    total_general = 0

    for clase, cantidades in resultados.items():
        print(
            f"{clase:<14}"
            f"{cantidades['total']:>10}"
            f"{cantidades['train']:>12}"
            f"{cantidades['validation']:>15}"
            f"{cantidades['test']:>10}"
        )

        total_general += cantidades["total"]

    print("-" * 66)
    print(f"Total general de imágenes: {total_general}")
    print(f"Ubicación: {DESTINO_DATASET}")
    print("=" * 66)


def main() -> None:
    random.seed(SEMILLA)

    print("Preparando el dataset de ReciBot...")
    print("Este proceso puede tardar algunos minutos.\n")

    limpiar_dataset_destino()
    crear_carpetas_clases()

    resultados = {}

    for clase, carpeta_fuente in FUENTES.items():
        print(f"Procesando {clase}...")

        resultados[clase] = preparar_clase(
            clase,
            carpeta_fuente,
        )

    mostrar_informe(resultados)


if __name__ == "__main__":
    try:
        main()

    except (FileNotFoundError, ValueError, OSError) as error:
        print("\nERROR AL PREPARAR EL DATASET")
        print("-" * 50)
        print(error)
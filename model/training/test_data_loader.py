from model.training.data_loader import cargar_datasets


def main() -> None:
    train_dataset, validation_dataset, test_dataset = (
        cargar_datasets()
    )

    print("\nDatasets cargados correctamente.")

    for nombre, dataset in (
        ("Train", train_dataset),
        ("Validation", validation_dataset),
        ("Test", test_dataset),
    ):
        imagenes, etiquetas = next(iter(dataset))

        print(f"\n{nombre}")
        print(f"Forma de imágenes: {imagenes.shape}")
        print(f"Forma de etiquetas: {etiquetas.shape}")
        print(f"Primeras etiquetas: {etiquetas[:10].numpy()}")


if __name__ == "__main__":
    main()
from pathlib import Path
from uuid import uuid4

from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.utils import secure_filename

from app.ai.predictor import clasificar_imagen


main = Blueprint("main", __name__)

EXTENSIONES_PERMITIDAS = {"jpg", "jpeg", "png"}


def extension_permitida(nombre_archivo: str) -> bool:
    """Comprueba si el archivo tiene una extensión admitida."""

    return (
        "." in nombre_archivo
        and nombre_archivo.rsplit(".", 1)[1].lower()
        in EXTENSIONES_PERMITIDAS
    )


@main.route("/", methods=["GET", "POST"])
def inicio():
    if request.method == "GET":
        imagen_subida = session.pop(
            "imagen_subida",
            None,
        )

        resultado = session.pop(
            "resultado_clasificacion",
            None,
        )

        return render_template(
            "index.html",
            imagen_subida=imagen_subida,
            resultado=resultado,
            desplazarse_clasificador=bool(
                imagen_subida or resultado
            ),
        )

    if "imagen_residuo" not in request.files:
        flash(
            "No se recibió ningún archivo.",
            "error",
        )

        return redirect(
            url_for(
                "main.inicio",
                _anchor="clasificador",
            )
        )

    archivo = request.files["imagen_residuo"]

    if archivo.filename == "":
        flash(
            "Selecciona una imagen antes de continuar.",
            "error",
        )

        return redirect(
            url_for(
                "main.inicio",
                _anchor="clasificador",
            )
        )

    if not extension_permitida(archivo.filename):
        flash(
            "Formato no permitido. "
            "Utiliza una imagen JPG, JPEG o PNG.",
            "error",
        )

        return redirect(
            url_for(
                "main.inicio",
                _anchor="clasificador",
            )
        )

    nombre_seguro = secure_filename(
        archivo.filename
    )

    extension = Path(
        nombre_seguro
    ).suffix.lower()

    nombre_unico = (
        f"{uuid4().hex}{extension}"
    )

    carpeta_uploads = Path(
        current_app.config["UPLOAD_FOLDER"]
    )

    carpeta_uploads.mkdir(
        parents=True,
        exist_ok=True,
    )

    ruta_destino = (
        carpeta_uploads / nombre_unico
    )

    try:
        archivo.save(ruta_destino)

        resultado = clasificar_imagen(
            ruta_destino
        )

        session["imagen_subida"] = nombre_unico
        session["resultado_clasificacion"] = resultado

        flash(
            "La imagen fue analizada correctamente.",
            "exito",
        )

    except (
        FileNotFoundError,
        ValueError,
        OSError,
        RuntimeError,
    ) as error:
        current_app.logger.exception(
            "Error al clasificar la imagen: %s",
            error,
        )

        flash(
            "La imagen se cargó, pero no pudo ser analizada. "
            "Intenta nuevamente con otra fotografía.",
            "error",
        )

    return redirect(
        url_for(
            "main.inicio",
            _anchor="clasificador",
        )
    )
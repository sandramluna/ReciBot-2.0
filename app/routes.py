from pathlib import Path
from uuid import uuid4

from flask import (
    Blueprint,
    current_app,
    flash,
    render_template,
    request,
)
from werkzeug.utils import secure_filename


main = Blueprint("main", __name__)

EXTENSIONES_PERMITIDAS = {"jpg", "jpeg", "png"}


def extension_permitida(nombre_archivo):
    """Comprueba si el archivo tiene una extensión admitida."""

    return (
        "." in nombre_archivo
        and nombre_archivo.rsplit(".", 1)[1].lower()
        in EXTENSIONES_PERMITIDAS
    )


@main.route("/", methods=["GET", "POST"])
def inicio():
    imagen_subida = None

    if request.method == "POST":
        if "imagen_residuo" not in request.files:
            flash("No se recibió ningún archivo.", "error")
            return render_template(
                "index.html",
                desplazarse_clasificador=True,
            )

        archivo = request.files["imagen_residuo"]

        if archivo.filename == "":
            flash(
                "Selecciona una imagen antes de continuar.",
                "error",
            )
            return render_template(
                "index.html",
                desplazarse_clasificador=True,
            )

        if not extension_permitida(archivo.filename):
            flash(
                "Formato no permitido. Utiliza una imagen JPG, JPEG o PNG.",
                "error",
            )
            return render_template(
                "index.html",
                desplazarse_clasificador=True,
            )

        nombre_seguro = secure_filename(archivo.filename)
        extension = Path(nombre_seguro).suffix.lower()
        nombre_unico = f"{uuid4().hex}{extension}"

        ruta_destino = (
            Path(current_app.config["UPLOAD_FOLDER"]) / nombre_unico
        )

        archivo.save(ruta_destino)
        imagen_subida = nombre_unico

        flash(
            "La imagen fue cargada correctamente y está lista para analizar.",
            "exito",
        )

    return render_template(
        "index.html",
        imagen_subida=imagen_subida,
        desplazarse_clasificador=request.method == "POST",
    )
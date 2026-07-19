from pathlib import Path

from flask import Flask, render_template


def create_app():
    app = Flask(__name__)

    # Carpeta principal del proyecto.
    project_root = Path(__file__).resolve().parent.parent

    # Carpeta donde se guardarán las imágenes recibidas.
    upload_folder = project_root / "app" / "static" / "uploads"
    upload_folder.mkdir(parents=True, exist_ok=True)

    # Configuración de la aplicación.
    app.config["UPLOAD_FOLDER"] = str(upload_folder)
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024
    app.config["SECRET_KEY"] = "recibot-desarrollo-local-2026"

    from app.routes import main
    app.register_blueprint(main)

    @app.errorhandler(413)
    def archivo_demasiado_grande(error):
        return render_template(
            "index.html",
            error_mensaje="La imagen supera el tamaño máximo permitido de 5 MB.",
        ), 413

    return app
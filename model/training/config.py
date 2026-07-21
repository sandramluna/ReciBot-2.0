from pathlib import Path


# ==========================================================
# RUTAS DEL PROYECTO
# ==========================================================

RAIZ_PROYECTO = Path(__file__).resolve().parents[2]

DATASET_DIR = RAIZ_PROYECTO / "dataset"

TRAIN_DIR = DATASET_DIR / "train"
VALIDATION_DIR = DATASET_DIR / "validation"
TEST_DIR = DATASET_DIR / "test"

TRAINING_DIR = RAIZ_PROYECTO / "model" / "training"

MODELO_PATH = TRAINING_DIR / "modelo.keras"
LABELS_PATH = TRAINING_DIR / "labels.txt"
HISTORY_PATH = TRAINING_DIR / "history.json"
METRICS_PATH = TRAINING_DIR / "metrics.json"

CONFUSION_MATRIX_PATH = TRAINING_DIR / "confusion_matrix.png"
ACCURACY_GRAPH_PATH = TRAINING_DIR / "training_accuracy.png"
LOSS_GRAPH_PATH = TRAINING_DIR / "training_loss.png"
CLASSIFICATION_REPORT_PATH = (
    TRAINING_DIR / "classification_report.txt"
)


# ==========================================================
# CONFIGURACIÓN DEL MODELO
# ==========================================================

IMAGE_HEIGHT = 224
IMAGE_WIDTH = 224
IMAGE_SIZE = (IMAGE_HEIGHT, IMAGE_WIDTH)

BATCH_SIZE = 32
EPOCHS = 15

LEARNING_RATE = 0.001
DROPOUT_RATE = 0.30

EARLY_STOPPING_PATIENCE = 4
REDUCE_LR_PATIENCE = 2
REDUCE_LR_FACTOR = 0.5
MIN_LEARNING_RATE = 0.000001

SEED = 42

CLASS_NAMES = [
    "cardboard",
    "glass",
    "metal",
    "organic",
    "plastic",
]

NUM_CLASSES = len(CLASS_NAMES)


# ==========================================================
# RENDIMIENTO
# ==========================================================

AUTOTUNE = -1
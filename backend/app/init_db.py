# backend/app/init_db.py
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))      # /workspace/backend/app
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))  # /workspace/backend
sys.path.append(BACKEND_DIR)

from app.database import engine
from app import models

if __name__ == "__main__":
    print("Création des tables si elles n'existent pas...")
    models.Base.metadata.create_all(bind=engine)
    print("✅ Tables créées / déjà existantes.")

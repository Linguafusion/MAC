# backend/app/init_root.py

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# ==================================================================
# AJOUT DU CHEMIN DU BACKEND AU PYTHONPATH
# ==================================================================
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))      # /workspace/backend/app
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))  # /workspace/backend
sys.path.append(BACKEND_DIR)

# Maintenant que app est un package grâce à __init__.py
from app.database import SessionLocal
from app.models import User, Role
from app.security import get_password_hash


def init_root():
    db = SessionLocal()

    ROOT_EMAIL = os.getenv("ROOT_EMAIL")
    ROOT_PASSWORD = os.getenv("ROOT_PASSWORD")

    if not ROOT_EMAIL or not ROOT_PASSWORD:
        raise ValueError("ROOT_EMAIL ou ROOT_PASSWORD non défini ! Vérifie ton fichier .env")

    user = db.query(User).filter(User.email == ROOT_EMAIL).first()

    if user:
        print("✔ ROOT déjà existant.")
        return

    root_user = User(
        email=ROOT_EMAIL,
        hashed_password=get_password_hash(ROOT_PASSWORD),
        role=Role.ROOT,
        is_active=True
    )

    db.add(root_user)
    db.commit()
    print("🎉 ROOT créé :", ROOT_EMAIL)


if __name__ == "__main__":
    init_root()

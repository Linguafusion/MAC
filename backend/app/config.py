# backend/app/config.py

import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

# Clé secrète pour signer les JWT : lue depuis l'environnement, jamais écrite dans le code.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY non défini. Générez une valeur (python -c \"import secrets; print(secrets.token_hex(32))\") "
        "et ajoutez-la à votre fichier .env."
    )
ALGORITHM = "HS256"

# Durée de vie du token d'accès (ex: 30 minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 30
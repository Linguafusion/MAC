# backend/app/config.py

from datetime import timedelta

# Clé secrète pour signer les JWT. À CHANGER dans un vrai déploiement !
SECRET_KEY = "82f0d56a0ddb51f9800ee7688dde6e543a403b302d44597889da38c95aac41b7" 
ALGORITHM = "HS256"

# Durée de vie du token d'accès (ex: 30 minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 30
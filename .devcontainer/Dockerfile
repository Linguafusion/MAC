# Image Dev Container basée sur Python 3.11
FROM mcr.microsoft.com/devcontainers/python:3.11

# Installer Node.js pour le frontend
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Définir le dossier de travail
WORKDIR /workspace

# Installer les dépendances backend
COPY ../backend/requirements.txt /workspace/backend/requirements.txt
RUN pip install -r /workspace/backend/requirements.txt

# Exposer les ports du backend et frontend
EXPOSE 8000 3000
# Utilise une image de base fournie par Microsoft contenant des outils de dev
FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Installe Python, Node.js (v18) et le client postgresql (pour les tests)
USER root
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    python3.10 python3-pip python3.10-venv \
    postgresql-client \
    build-essential libffi-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Installe Node.js via nvm pour une gestion facile
ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=24.11.0
RUN mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    . $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && nvm use default

# Ajoute node au PATH
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Met à jour pip
RUN python3.10 -m pip install --upgrade pip

# Retourne à un utilisateur non-root pour la sécurité
USER $USER_UID
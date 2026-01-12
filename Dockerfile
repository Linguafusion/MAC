FROM python:3.11-slim

WORKDIR /app

# Copier et installer les dépendances
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY backend/ ./backend


# Exposer le port (Railway injecte PORT)
EXPOSE 8000

# Lancer FastAPI
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]


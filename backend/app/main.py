from fastapi import FastAPI
from .database import Base, engine
from .models import Enquete

app = FastAPI(title="Plateforme d'Enquêtes")

# Créer les tables à la première exécution
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Bienvenue sur la plateforme d’enquêtes statistiques !"}
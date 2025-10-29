# backend/app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator
from sqlalchemy.orm import Session # Importer Session ici est facultatif mais bonne pratique

# L'URL de la base de données doit correspondre à votre docker-compose.yml
# Utilisez l'URL que vous avez fournie :
SQLALCHEMY_DATABASE_URL = "postgresql://mac_root:Tipo1978@db:5432/mac_db"

# Création du moteur
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Création de la classe Session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# C'est la Base déclarative dont vos modèles héritent
Base = declarative_base()


# Dépendance pour FastAPI
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# backend/app/models.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base # Importe la Base déclarative

# --- Modèle User (F4) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relation : Un utilisateur peut posséder plusieurs enquêtes
    enquetes = relationship("Enquete", back_populates="owner", cascade="all, delete-orphan")


# --- Modèle Enquete (F1) ---
class Enquete(Base):
    __tablename__ = "enquetes"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, index=True, unique=True)
    description = Column(String)
    
    # Paramètres de la méthode de représentation sociale
    taille_liste = Column(Integer, default=5)
    rang_ponderation = Column(Boolean, default=True)
    
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relation à l'utilisateur
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="enquetes")
    
    # Relations aux composantes de l'enquête
    questions = relationship("Question", back_populates="enquete", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="enquete", cascade="all, delete-orphan")


# --- Modèle Question (F1 Composant) ---
class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    texte = Column(String)
    type_question = Column(String, default="text")
    is_required = Column(Boolean, default=False)
    
    enquete_id = Column(Integer, ForeignKey("enquetes.id"))
    enquete = relationship("Enquete", back_populates="questions")


# --- Modèle Item (F1 Composant) ---
class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    stimulus = Column(String)
    sequence = Column(Integer, default=1) 
    
    enquete_id = Column(Integer, ForeignKey("enquetes.id"))
    enquete = relationship("Enquete", back_populates="items")
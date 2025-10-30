# backend/app/crud.py

from sqlalchemy.orm import Session # <<< CORRECTION: Import de Session
from . import models, schemas, security 

# --- CRUD Utilisateur (F4) ---

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CRUD Enquete (F1) ---

def get_enquete(db: Session, enquete_id: int):
    return db.query(models.Enquete).filter(models.Enquete.id == enquete_id).first()

def create_user_enquete(db: Session, enquete: schemas.EnqueteCreate, user_id: int):
    
    # 1. Création de l'objet Enquête principale
    db_enquete = models.Enquete(
        **enquete.model_dump(exclude={"questions", "items"}),
        owner_id=user_id
    )
    db.add(db_enquete)
    db.flush() 

    # 2. Ajout des Questions
    for q_schema in enquete.questions:
        db_question = models.Question(**q_schema.model_dump(), enquete_id=db_enquete.id)
        db.add(db_question)

    # 3. Ajout des Items (Stimuli)
    for i_schema in enquete.items:
        db_item = models.Item(**i_schema.model_dump(), enquete_id=db_enquete.id)
        db.add(db_item)

    db.commit()
    db.refresh(db_enquete)
    return db_enquete
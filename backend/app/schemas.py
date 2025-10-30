# backend/app/schemas.py

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Schémas Utilisateur (F4) ---

class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Schémas JWT (F4) ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Schémas Composants Enquête (F1) ---

class QuestionBase(BaseModel):
    texte: str = Field(..., max_length=500)
    type_question: str = Field("text")
    is_required: bool = False
    
    class Config:
        from_attributes = True

class ItemBase(BaseModel):
    stimulus: str = Field(..., max_length=100)
    sequence: int = Field(1, ge=1)

    class Config:
        from_attributes = True

# --- Schémas Enquête Complète (F1) ---

class EnqueteCreate(BaseModel):
    titre: str = Field(..., max_length=255)
    description: Optional[str] = None
    taille_liste: int = Field(5, ge=1, le=10)
    rang_ponderation: bool = Field(True)
    
    questions: List[QuestionBase] = Field(...)
    items: List[ItemBase] = Field(...)


class EnqueteRead(EnqueteCreate):
    id: int
    date_creation: datetime
    is_active: bool
    owner_id: int
    
    class Config:
        from_attributes = True
        # Ajout de json_encoders pour gérer le format de la date à la sortie
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
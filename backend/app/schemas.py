# backend/app/schemas.py

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

from .models import Role  # Enum Role défini dans models.py


# --- Schémas Utilisateur (F4) ---

class UserBase(BaseModel):
    email: EmailStr
    role: Role
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: Optional[Role] = Role.CREATOR


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: int
    email: EmailStr
    role: Role
    is_active: bool

    class Config:
        from_attributes = True


# --- Schémas JWT (F4) ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# --- Enquete + Question ---

class QuestionPart(str, Enum):
    OPTIONAL = "OPTIONAL"
    MANDATORY = "MANDATORY"


class QuestionType(str, Enum):
    TEXT = "text"
    BOOLEAN = "boolean"
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    LIKERT = "likert"


class ChoiceIn(BaseModel):
    label: str
    value: Optional[int] = None  # pour certaines questions optionnelles


class ChoiceOut(ChoiceIn):
    id: int

    class Config:
        from_attributes = True


class QuestionIn(BaseModel):
    texte: str
    type_question: QuestionType = QuestionType.TEXT
    is_required: bool = False
    part: QuestionPart = QuestionPart.OPTIONAL
    choices: Optional[List[ChoiceIn]] = None  # pour les questions à choix


class QuestionOut(QuestionIn):
    id: int
    choices: Optional[List[ChoiceOut]] = None

    class Config:
        from_attributes = True


class EnqueteBase(BaseModel):
    titre: str
    description: Optional[str] = None
    taille_liste: int = 5
    rang_ponderation: bool = True


class EnqueteCreate(EnqueteBase):
    questions: List[QuestionIn] = []


class EnqueteUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    taille_liste: Optional[int] = None
    rang_ponderation: Optional[bool] = None
    questions: List[QuestionIn] = []


class EnqueteOut(EnqueteBase):
    id: int
    owner_id: int
    date_creation: datetime
    public_token: Optional[str] = None
    # IMPORTANT : ici on expose bien QuestionOut (avec id et ChoiceOut)
    questions: List[QuestionOut] = []

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


# --- Réponses ---

class AnswerIn(BaseModel):
    question_id: int
    text_value: Optional[str] = None          # pour les questions texte
    choice_id: Optional[int] = None           # pour single_choice / boolean / multi_choice
    value: Optional[int] = None              # pour Likert : -2..2


class ResponseIn(BaseModel):
    answers: List[AnswerIn]


class ResponseOut(BaseModel):
    id: int
    enquete_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class ShareLinkOut(BaseModel):
    token: str


class AnswerDetailOut(BaseModel):
    id: int
    question_id: int
    question_texte: str
    type_question: QuestionType
    text_value: Optional[str] = None
    choice_label: Optional[str] = None
    value: Optional[int] = None

    class Config:
        from_attributes = True


class ResponseDetailOut(BaseModel):
    id: int
    enquete_id: int
    created_at: datetime
    answers: List[AnswerDetailOut]

    class Config:
        from_attributes = True
        json_encoders = { datetime: lambda v: v.isoformat() }
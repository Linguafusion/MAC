# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum
import uuid

class Role(enum.Enum):
    ROOT = "ROOT"
    ADMIN = "ADMIN"
    CREATOR = "CREATOR"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.CREATOR, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    enquetes = relationship("Enquete", back_populates="owner", cascade="all, delete-orphan")

# Questionnaire part enum (OPTIONAL/MANDATORY)
class QuestionPart(enum.Enum):
    OPTIONAL = "OPTIONAL"
    MANDATORY = "MANDATORY"

class Enquete(Base):
    __tablename__ = "enquetes"
    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, index=True, unique=True)
    description = Column(Text, nullable=True)
    taille_liste = Column(Integer, default=5)
    rang_ponderation = Column(Boolean, default=True)
    date_creation = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="enquetes")
    # questions contains both optional + mandatory, distinguished by 'part'
    questions = relationship("Question", back_populates="enquete", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="enquete", cascade="all, delete-orphan")
    share_links = relationship("ShareLink", back_populates="enquete", cascade="all, delete-orphan")
    public_token = Column(String, unique=True, index=True, default=lambda: uuid.uuid4().hex)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    texte = Column(Text, nullable=False)
    type_question = Column(String, default="text")  # text, boolean, single_choice, multi_choice, likert
    is_required = Column(Boolean, default=False)
    part = Column(Enum(QuestionPart), default=QuestionPart.OPTIONAL)  # OPTIONAL or MANDATORY
    enquete_id = Column(Integer, ForeignKey("enquetes.id"))
    enquete = relationship("Enquete", back_populates="questions")
    choices = relationship("Choice", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Choice(Base):
    __tablename__ = "choices"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="choices")
    label = Column(String, nullable=False)
    value = Column(Integer, nullable=True)  # null for non-numeric choices; for likert: -2..2

class Response(Base):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True, index=True)
    enquete_id = Column(Integer, ForeignKey("enquetes.id"))
    enquete = relationship("Enquete", back_populates="responses")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id"))
    response = relationship("Response", back_populates="answers")
    question_id = Column(Integer, ForeignKey("questions.id"))
    question = relationship("Question", back_populates="answers")
    text_value = Column(Text, nullable=True)
    choice_id = Column(Integer, ForeignKey("choices.id"), nullable=True)
    # optionally store numeric value for convenience:
    value = Column(Integer, nullable=True)

class ShareLink(Base):
    __tablename__ = "share_links"
    id = Column(Integer, primary_key=True, index=True)
    enquete_id = Column(Integer, ForeignKey("enquetes.id"))
    enquete = relationship("Enquete", back_populates="share_links")
    token = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

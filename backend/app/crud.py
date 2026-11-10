# backend/app/crud.py

from sqlalchemy.orm import Session # <<< CORRECTION: Import de Session
from . import models, schemas, security, protocole_mac
import uuid
from fastapi import HTTPException
from enum import Enum

# --- CRUD Utilisateur (F4) ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def list_users(db: Session):
    return db.query(models.User).order_by(models.User.id.desc()).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: models.User, data: schemas.UserUpdate):
    if data.email:
        db_user.email = data.email
    if data.password:
        db_user.hashed_password = security.get_password_hash(data.password)
    if data.role:
        db_user.role = data.role
    if data.is_active is not None:
        db_user.is_active = data.is_active

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, db_user: models.User):
    db.delete(db_user)
    db.commit()

# --- CRUD Enquete (F1) ---

LIKERT_CHOICES = [(protocole_mac.libelle_valeur(v), v) for v in protocole_mac.VALEURS]

def create_enquete_full(db: Session, enquete_in: schemas.EnqueteCreate, owner_id: int):
    # Validate mandatory part counts
    mandatory_questions = [q for q in enquete_in.questions if q.part == schemas.QuestionPart.MANDATORY]
    if len(mandatory_questions) not in (0,10,15,20):
        # allow 0 if creator wants no mandatory? but spec requires mandatory part present; enforce >0
        raise HTTPException(status_code=400, detail="La partie obligatoire doit contenir 10, 15 ou 20 questions.")

    # Create enquete
    db_enquete = models.Enquete(
        titre=enquete_in.titre,
        description=enquete_in.description,
        taille_liste=enquete_in.taille_liste,
        rang_ponderation=enquete_in.rang_ponderation,
        owner_id=owner_id
    )
    db.add(db_enquete)
    db.flush()

    # Add questions
    for q in enquete_in.questions:
        db_q = models.Question(
            texte=q.texte,
            type_question=q.type_question.value if isinstance(q.type_question, Enum) else q.type_question,
            is_required=q.is_required,
            part=models.QuestionPart(q.part) if isinstance(q.part, Enum) else q.part,
            enquete_id=db_enquete.id
        )
        db.add(db_q)
        db.flush()
        # choices auto-create for mandatory/likert
        if db_q.part == models.QuestionPart.MANDATORY:
            pass
            # ensure type is likert
            # db_q.type_question = "likert"
            # for label, val in LIKERT_CHOICES:
            #     c = models.Choice(question_id=db_q.id, label=label, value=val)
            #     db.add(c)
        else:
            if q.choices:
                for ch in q.choices:
                    c = models.Choice(question_id=db_q.id, label=ch.label, value=ch.value)
                    db.add(c)
    db.commit()
    db.refresh(db_enquete)
    return db_enquete

def update_enquete(db: Session, enquete: models.Enquete, enquete_in: schemas.EnqueteUpdate):
    # Update basic fields
    for field in ["titre", "description", "taille_liste", "rang_ponderation"]:
        value = getattr(enquete_in, field, None)
        if value is not None:
            setattr(enquete, field, value)
    # --- Traiter 'questions' de manière spéciale ---
    if enquete_in.questions is not None:
        # Supprime toutes les anciennes questions
        for q in list(enquete.questions):
            db.delete(q)
        db.flush()
        # Ajoute les nouvelles depuis enquete_in.questions
        for q_data in enquete_in.questions:
            db_q = models.Question(
                texte=q_data.texte,
                type_question=q_data.type_question,
                is_required=q_data.is_required,
                part=models.QuestionPart(q_data.part),
                enquete_id=enquete.id,
            )
            db.add(db_q)
            db.flush()
            if db_q.type_question in ("single_choice", "multi_choice", "likert", "boolean"):
                for ch in getattr(q_data, "choices", []) or []:
                    c = models.Choice(question_id=db_q.id, label=ch.label, value=ch.value)
                    db.add(c)
    db.commit()
    db.refresh(enquete)
    return enquete

def delete_enquete(db: Session, enquete: models.Enquete):
    db.delete(enquete)
    db.commit()

def get_enquete_with_questions(db: Session, enquete_id: int):
    return db.query(models.Enquete).filter(models.Enquete.id == enquete_id).first()

def create_share_link(db: Session, enquete: models.Enquete):
    token = uuid.uuid4().hex
    link = models.ShareLink(enquete_id=enquete.id, token=token)
    db.add(link)
    db.commit()
    db.refresh(link)
    # also set public_token on enquete for convenience
    enquete.public_token = token
    db.commit()
    return link

def get_enquete_by_token(db: Session, token: str):
    link = db.query(models.ShareLink).filter(models.ShareLink.token == token).first()
    if not link:
        return None
    return link.enquete

def submit_response(db: Session, enquete: models.Enquete, response_in: schemas.ResponseIn):
    mandatory_questions = [q for q in enquete.questions if q.part == models.QuestionPart.MANDATORY]
    if mandatory_questions:
        qcount = len(mandatory_questions)
        if qcount not in protocole_mac.TAILLES_VALIDES:
            raise HTTPException(status_code=400, detail="Questionnaire obligatoire mal configuré.")

        mand_q_ids = {q.id for q in mandatory_questions}
        provided_mandatory = [a for a in response_in.answers if a.question_id in mand_q_ids]
        if len(provided_mandatory) != qcount:
            raise HTTPException(status_code=400, detail="Vous devez répondre à toutes les questions obligatoires.")

        chosen_values = []
        for a in provided_mandatory:
            # Ici on attend value pour les Likert
            if a.value is None:
                raise HTTPException(status_code=400, detail="Chaque question obligatoire doit avoir une valeur.")
            chosen_values.append(a.value)

        # Protocole en quatre temps : chaque valeur exactement N/5 fois
        try:
            protocole_mac.verifier_distribution(chosen_values)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    # Persistance de la réponse
    resp = models.Response(enquete_id=enquete.id)
    db.add(resp)
    db.flush()

    for a in response_in.answers:
        val = a.value  # pour Likert, on reçoit value
        if a.choice_id:
            c = db.query(models.Choice).filter(models.Choice.id == a.choice_id).first()
            if c:
                val = c.value  # pour les questions optionnelles avec choices
        ans = models.Answer(
            response_id=resp.id,
            question_id=a.question_id,
            text_value=a.text_value,
            choice_id=a.choice_id,
            value=val,
        )
        db.add(ans)

    db.commit()
    db.refresh(resp)
    return resp

def get_enquete_responses(db: Session, enquete_id: int) -> list[schemas.ResponseDetailOut]:
    # Récupère toutes les réponses pour une enquête
    responses = (
        db.query(models.Response)
        .filter(models.Response.enquete_id == enquete_id)
        .all()
    )
    result: list[schemas.ResponseDetailOut] = []
    for r in responses:
        answers_out: list[schemas.AnswerDetailOut] = []
        for a in r.answers:
            q = a.question
            choice_label = None
            if a.choice_id:
                ch = next((c for c in q.choices if c.id == a.choice_id), None)
                if ch:
                    choice_label = ch.label
            answers_out.append(
                schemas.AnswerDetailOut(
                    id=a.id,
                    question_id=q.id,
                    question_texte=q.texte,
                    type_question=q.type_question,
                    text_value=a.text_value,
                    choice_label=choice_label,
                    value=a.value,
                )
            )
        result.append(
            schemas.ResponseDetailOut(
                id=r.id,
                enquete_id=r.enquete_id,
                created_at=r.created_at,
                answers=answers_out,
            )
        )
    return result

# backend/app/routes_surveys.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from . import schemas, crud, models
from .security import get_current_user
from typing import List

router = APIRouter(prefix="/enquetes", tags=["Enquetes"])

@router.post("/", response_model=schemas.EnqueteOut)
def create_enquete(enquete_in: schemas.EnqueteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    enquete = crud.create_enquete_full(db, enquete_in, owner_id=current_user.id)
    return enquete

@router.get("/", response_model=List[schemas.EnqueteOut])
def list_enquetes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role.name in ("ROOT","ADMIN"):
        enqs = db.query(models.Enquete).all()
    else:
        enqs = db.query(models.Enquete).filter(models.Enquete.owner_id == current_user.id).all()
    return enqs

@router.get("/{enquete_id}", response_model=schemas.EnqueteOut)
def get_enquete(enquete_id: int, db: Session = Depends(get_db)):
    enquete = crud.get_enquete_with_questions(db, enquete_id)
    if not enquete:
        raise HTTPException(404, "Enquête non trouvée")
    return enquete

# Modifier une enquête
@router.put("/{enquete_id}", response_model=schemas.EnqueteOut)
def update_enquete(
    enquete_id: int,
    enquete_in: schemas.EnqueteUpdate,  # Nouveau schema pour la MAJ
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    enquete = crud.get_enquete_with_questions(db, enquete_id)
    if not enquete:
        raise HTTPException(404, "Enquête non trouvée")

    # Vérification des droits
    if not (current_user.role.name in ("ROOT","ADMIN") or enquete.owner_id == current_user.id):
        raise HTTPException(403, "Non autorisé")

    # Mise à jour via CRUD
    updated_enquete = crud.update_enquete(db, enquete, enquete_in)
    return updated_enquete

@router.delete("/{enquete_id}")
def delete_enquete(enquete_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    enquete = crud.get_enquete_with_questions(db, enquete_id)
    if not enquete:
        raise HTTPException(404, "Enquête non trouvée")
    if not (current_user.role.name in ("ROOT","ADMIN") or enquete.owner_id == current_user.id):
        raise HTTPException(403, "Non autorisé")
    crud.delete_enquete(db, enquete)
    return {"message": "Enquête supprimée"}

@router.post("/{enquete_id}/share", response_model=schemas.ShareLinkOut)
def create_share(enquete_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    enquete = crud.get_enquete_with_questions(db, enquete_id)
    if not enquete:
        raise HTTPException(404, "Enquête non trouvée")
    if not (current_user.role.name in ("ROOT","ADMIN") or enquete.owner_id == current_user.id):
        raise HTTPException(403, "Non autorisé")
    link = crud.create_share_link(db, enquete)
    return {"token": link.token}

# Public endpoints by token
@router.get("/public/{token}", response_model=schemas.EnqueteOut)
def public_get(token: str, db: Session = Depends(get_db)):
    enquete = crud.get_enquete_by_token(db, token)
    if not enquete:
        raise HTTPException(404, "Lien invalide")
    return enquete

@router.post("/public/{token}/submit", response_model=schemas.ResponseOut)
def public_submit(token: str, response_in: schemas.ResponseIn, db: Session = Depends(get_db)):
    enquete = crud.get_enquete_by_token(db, token)
    if not enquete:
        raise HTTPException(404, "Lien invalide")
    resp = crud.submit_response(db, enquete, response_in)
    return resp

@router.get("/{enquete_id}/responses", response_model=List[schemas.ResponseDetailOut])
def list_responses(
    enquete_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    enquete = crud.get_enquete_with_questions(db, enquete_id)
    if not enquete:
        raise HTTPException(404, "Enquête non trouvée")
    if not (current_user.role.name in ("ROOT", "ADMIN") or enquete.owner_id == current_user.id):
        raise HTTPException(403, "Non autorisé")
    return crud.get_enquete_responses(db, enquete_id)

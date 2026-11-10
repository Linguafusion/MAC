# backend/app/routes_import.py
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from . import importer, models
from .database import get_db
from .security import get_current_user

router = APIRouter(prefix="/enquetes", tags=["Import"])


@router.post("/import")
def importer_enquete_fichier(
    titre: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role.name not in ("ROOT", "ADMIN", "CREATOR"):
        raise HTTPException(403, "Non autorisé")
    contenu = file.file.read()
    return importer.importer_enquete(
        db=db,
        titre=titre,
        description=description,
        nom_fichier=file.filename or "",
        contenu=contenu,
        owner=current_user,
    )

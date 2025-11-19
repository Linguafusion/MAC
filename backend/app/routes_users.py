# backend/app/routes_users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from . import schemas, models, crud
from .permissions import require_role
from .models import Role

router = APIRouter(prefix="/users", tags=["Users"])

# ------------------------------
# LIST USERS (ROOT + ADMIN)
# ------------------------------
@router.get("/", response_model=list[schemas.User])
def list_all_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Role.ROOT, Role.ADMIN]))
):
    return crud.list_users(db)


# ------------------------------
# GET ONE USER (ROOT + ADMIN)
# ------------------------------
@router.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Role.ROOT, Role.ADMIN]))
):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(404, "Utilisateur introuvable")
    return db_user


# ------------------------------
# CREATE USER (root/admin rules)
# ------------------------------
@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Role.ROOT, Role.ADMIN]))
):
    # Seul le ROOT peut créer un ADMIN
    if user.role == Role.ADMIN and current_user.role != Role.ROOT:
        raise HTTPException(403, "Seul le ROOT peut créer un ADMIN")

    if crud.get_user_by_email(db, user.email):
        raise HTTPException(400, "Email déjà utilisé")

    return crud.create_user(db, user)


# ------------------------------
# UPDATE USER
# ------------------------------
@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Role.ROOT, Role.ADMIN]))
):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(404, "Utilisateur introuvable")

    # ----- Cas ROOT -----
    if db_user.role == Role.ROOT:
        # seul le ROOT lui-même peut toucher au compte ROOT
        if current_user.role != Role.ROOT:
            raise HTTPException(403, "Seul le ROOT peut modifier le compte ROOT")

        # ROOT ne peut changer QUE son mot de passe
        if data.email is not None or data.role is not None or data.is_active is not None:
            raise HTTPException(403, "On ne peut modifier que le mot de passe du ROOT")

        # On garde uniquement le mot de passe dans le payload
        safe_data = schemas.UserUpdate(
            password=data.password
        )
        return crud.update_user(db, db_user, safe_data)

    # ----- Cas ADMIN -----
    if db_user.role == Role.ADMIN:
        # Seul le ROOT peut modifier un ADMIN
        if current_user.role != Role.ROOT:
            raise HTTPException(403, "Seul le ROOT peut modifier un ADMIN")

    # ----- Cas CREATOR -----
    # Si on est ici, c'est soit ADMIN soit CREATOR
    # ROOT et ADMIN sont déjà filtrés par require_role

    return crud.update_user(db, db_user, data)


# ------------------------------
# DELETE USER (ROOT + ADMIN)
# ------------------------------
@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role([Role.ROOT, Role.ADMIN]))
):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(404, "Utilisateur introuvable")

    # ROOT jamais supprimé
    if db_user.role == Role.ROOT:
        raise HTTPException(403, "On ne supprime jamais le ROOT")

    # ADMIN uniquement supprimable par ROOT
    if db_user.role == Role.ADMIN and current_user.role != Role.ROOT:
        raise HTTPException(403, "Seul le ROOT peut supprimer un ADMIN")

    # CREATOR : ROOT + ADMIN autorisés (déjà garanti par require_role)
    crud.delete_user(db, db_user)
    return {"message": "Utilisateur supprimé"}

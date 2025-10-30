# backend/app/security.py

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session # <<< CORRECTION: Import de Session

from . import config, schemas, crud # Note: crud sera utilisé par get_current_user
from .database import get_db # <<< CORRECTION: Import de get_db

# Contexte pour le hachage des mots de passe
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Schéma de sécurité
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") 


# --- Fonctions de Hachage et Vérification ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)


# --- Fonctions de JWT ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Décodage du token
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
        
    except JWTError:
        raise credentials_exception
        
    # Récupération de l'utilisateur
    # Note: crud doit être importé dans ce fichier pour cette ligne
    user = crud.get_user_by_email(db, email=token_data.email) 
    if user is None:
        raise credentials_exception
    return user
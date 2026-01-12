# backend/app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session # Import de Session nécessaire
from datetime import timedelta 
from . import crud, schemas, models, security
from .database import engine, get_db
from .config import ACCESS_TOKEN_EXPIRE_MINUTES # Import nécessaire
from fastapi.middleware.cors import CORSMiddleware
from .routes_users import router as users_router
from .routes_surveys import router as surveys_router
from fastapi.staticfiles import StaticFiles


# --- INITIALISATION ---

# Création des tables dans la base de données (s'assurer qu'elles existent)
models.Base.metadata.create_all(bind=engine) 

# Instanciation de l'application FastAPI (CORRECTION: app=FastAPI())
app = FastAPI() 

# 🛑 CONFIGURATION CORS
origins = [
    # C'est l'URL de votre Frontend React en développement
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://poor-glad-mac-org-15270138.koyeb.app",
    # Si vous ajoutez des domaines de production plus tard, ils vont ici
    # "https://mon-domaine-production.com",
    "https://react-frontend-production-9fb3.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              # Liste des origines autorisées
    allow_credentials=True,             # Autorise les cookies et les en-têtes d'autorisation
    allow_methods=["*"],                # Autorise toutes les méthodes (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],                # Autorise tous les en-têtes, y compris 'Authorization'
)
# --- ROUTES D'AUTHENTIFICATION (F4) ---

# Route pour l'inscription
@app.post("/users/", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    return crud.create_user(db=db, user=user)

# Route pour la connexion (récupération du token)
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username) 
    # --- DÉBOGAGE AJOUTÉ ---
    print(f"DEBUG: Tentative de connexion pour l'email: {form_data.username}")
    if user:
        is_valid = security.verify_password(form_data.password, user.hashed_password)
        print(f"DEBUG: Mot de passe haché en base: {user.hashed_password[:30]}...")
        print(f"DEBUG: Résultat de la vérification (verify_password): {is_valid}")
    else:
        print("DEBUG: Utilisateur non trouvé.")
        is_valid = False
    # --- FIN DÉBOGAGE ---
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Route de Test Protégée (pour vérifier le token)
@app.get("/users/me/", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(security.get_current_user)):
    return current_user

# --- ROUTES USERS ---
app.include_router(users_router)
app.include_router(surveys_router)
if os.getenv("ENV") == "production":  # ou juste pour tout environnement
    try:
        init_root()
    except Exception as e:
        print("⚠️ ROOT init failed:", e)







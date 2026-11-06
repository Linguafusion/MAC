# MAC — Méthode d'analyse combinatoire

Application web de gestion et d'analyse d'enquêtes (Likert) : création d'enquêtes, collecte de réponses via un lien public, statistiques et graphiques.

## Structure

- `backend/` : API FastAPI + SQLAlchemy (PostgreSQL)
- `frontend/` : interface React + Vite
- `.devcontainer/` : environnement de développement Docker (VS Code Dev Containers)

## Prérequis

- Docker démarré
- Visual Studio Code avec l'extension **Dev Containers**

## Configuration

Créez un fichier `.env` à la racine du projet à partir de l'exemple :

```bash
cp .env.example .env
```

Puis remplacez `POSTGRES_PASSWORD` par un mot de passe de votre choix. Le fichier `.env` n'est pas versionné.

## Démarrage avec le Dev Container

1. Clonez le projet :

   ```bash
   git clone https://github.com/Linguafusion/MAC.git
   cd MAC
   ```

2. Ouvrez le dossier dans VS Code puis choisissez **Dev Containers: Reopen in Container**.

3. Dans le terminal du conteneur, lancez le backend :

   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Dans un second terminal, lancez le frontend :

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Accès

- Application web : http://localhost:3000
- Documentation de l'API : http://localhost:8000/docs

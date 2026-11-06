# Déploiement de test sur Koyeb

Ce guide prépare une phase de test. Ne mettez aucune donnée réelle sur ce déploiement, et utilisez des mots de passe forts.

## 1. Pré-requis

- Un compte Koyeb (vous vous connectez vous-même sur https://app.koyeb.com/).
- Le code poussé sur GitHub dans une branche dédiée (par exemple `koyeb-test`).

## 2. Base de données PostgreSQL

Créez une base PostgreSQL dans Koyeb (ou une base externe). Notez son URL de connexion au format :

```
postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_BASE
```

Elle sera saisie comme secret `DATABASE_URL` (étape 3). Ne la partagez pas.

## 3. Service backend

- Type : service web, construit à partir du **Dockerfile** `Dockerfile.backend` à la racine du dépôt.
- Port : `8000`.
- Variables d'environnement (valeurs à saisir comme **secrets**) :

| Nom | Valeur |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL de l'étape 2 |
| `SECRET_KEY` | une valeur générée : `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ROOT_EMAIL` | votre adresse e-mail (compte administrateur initial) |
| `ROOT_PASSWORD` | un mot de passe fort que vous choisissez |
| `CORS_ORIGINS` | l'URL du frontend de l'étape 4 (ajoutée après création du frontend) |

Au démarrage, le compte ROOT est créé s'il n'existe pas, et les tables sont créées automatiquement.

## 4. Service frontend

- Type : service web, construit à partir du **Dockerfile** `Dockerfile.frontend` à la racine du dépôt.
- Port : `8080`.
- Argument de build `VITE_API_URL` : l'URL publique du backend de l'étape 3 (par exemple `https://mac-test-backend-xxxx.koyeb.app`). Elle est figée dans le site à la construction : si l'URL change, reconstruisez le frontend.

## 5. Finalisation

1. Une fois le frontend déployé, copiez son URL publique dans la variable `CORS_ORIGINS` du backend (sans barre oblique finale), puis redéployez le backend.
2. Vérifiez :
   - `https://<backend>/docs` affiche la documentation de l'API ;
   - `https://<frontend>/login` affiche la page de connexion ;
   - la connexion avec le compte ROOT fonctionne.

## 6. Ce qui n'est pas inclus

- Aucune donnée de test (les fichiers `backend/data/` et les scripts de jeu de test ne sont pas copiés dans l'image).
- Aucun compte de test à mot de passe connu.
- Le déploiement Railway existant n'est pas modifié.

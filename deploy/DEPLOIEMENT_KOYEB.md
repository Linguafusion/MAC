# Déploiement de test sur Koyeb

Ce guide prépare une phase de test. Ne mettez aucune donnée réelle sur ce déploiement, et utilisez des mots de passe forts.

Koyeb construit chaque service à partir du dépôt GitHub (branche `koyeb-test`) et du Dockerfile indiqué. Vous n'avez pas besoin de Docker sur votre Mac pour déployer.

## 0. Ordre des opérations

1. Base de données PostgreSQL (étape 2).
2. Backend (étape 3). Notez son URL publique.
3. Frontend (étape 4), en lui donnant l'URL du backend.
4. Retour sur le backend pour renseigner `CORS_ORIGINS` avec l'URL du frontend (étape 5).

## 1. Pré-requis

- Un compte Koyeb. Vous vous connectez vous-même sur https://app.koyeb.com/.
- Le dépôt `Linguafusion/MAC` connecté à Koyeb : lors de la première création, Koyeb vous demande d'autoriser son application GitHub. Choisissez ce dépôt uniquement.
- La branche `koyeb-test` à jour sur GitHub.

## 2. Base de données PostgreSQL

Créez une base PostgreSQL (Koyeb ou base externe). Son URL de connexion a cette forme :

```
postgresql://UTILISATEUR:MOT_DE_PASSE@HOTE:5432/NOM_BASE
```

Elle sera saisie comme secret `DATABASE_URL`. Ne la partagez pas.

## 3. Service backend

- Nom suggéré : `mac-test-backend`.
- Source : dépôt `Linguafusion/MAC`, branche `koyeb-test`.
- Construction : **Dockerfile**, chemin `Dockerfile.backend`, racine du dépôt.
- Port : `8000`.
- Variables d'environnement, à saisir comme **secrets** :

| Nom | Valeur |
| --- | --- |
| `DATABASE_URL` | URL PostgreSQL de l'étape 2 |
| `SECRET_KEY` | une valeur générée : `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `ROOT_EMAIL` | votre adresse e-mail. Utilisez un domaine réel : les domaines réservés comme `.local` ou `.test` sont refusés |
| `ROOT_PASSWORD` | un mot de passe fort que vous choisissez et saisissez vous-même |
| `CORS_ORIGINS` | à renseigner à l'étape 5 (laisser vide au début) |

Au démarrage, le compte ROOT est créé s'il n'existe pas, et les tables sont créées automatiquement.

## 4. Service frontend

- Nom suggéré : `mac-test-frontend`.
- Source : dépôt `Linguafusion/MAC`, branche `koyeb-test`.
- Construction : **Dockerfile**, chemin `Dockerfile.frontend`, racine du dépôt.
- Port : `8080`.
- Argument de construction `VITE_API_URL` : l'URL publique du backend (par exemple `https://mac-test-backend-xxxx.koyeb.app`). Elle est figée dans le site à la construction : si l'URL du backend change, reconstruisez le frontend.

## 5. Finalisation

1. Copiez l'URL publique du frontend dans `CORS_ORIGINS` du backend, sans barre oblique finale, puis redéployez le backend.
2. Vérifiez :
   - `https://<backend>/docs` affiche la documentation de l'API ;
   - `https://<frontend>/login` affiche la page de connexion ;
   - la connexion avec le compte ROOT fonctionne.

## 6. Ce qui n'est pas inclus

- Aucune donnée de test : les fichiers `backend/data/` et les scripts de jeu de test (`backend/scripts/`) ne sont pas copiés dans l'image.
- Aucun compte de test à mot de passe connu.
- Le déploiement Railway existant n'est pas modifié.

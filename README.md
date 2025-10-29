# MAC
Méthode d'analyse combinatoires

Prérequis

    1-Docker doit être démarré et fonctionnel sur votre machine.

    2-Visual Studio Code doit être installé.

    3-L'extension Dev Containers (ou Remote - Containers) doit être installée dans VS Code.

1.Ouvrez votre terminal local ou le terminal de VS Code (Terminal > New Terminal) et clonez le projet.
2.git clone https://github.com/Linguafusion/MAC.git
3.cd MAC

Étape 1 : Ouvrir le Projet dans VS Code
Mon erreur. L'environnement Dev Container (ou Conteneur de Développement) est la façon la plus robuste d'utiliser Docker avec VS Code, car il gère l'environnement d'exécution de votre code, le terminal, et les extensions, tout en étant complètement isolé.

Puisque vous avez déjà configuré Docker Compose, le démarrage dans un Dev Container est très simple.

Voici le guide étape par étape pour ouvrir votre projet dans un Dev Container sur VS Code :

🚀 Démarrage du Projet dans le Dev Container

Cette méthode utilise le docker-compose.yml et le fichier de configuration .devcontainer/devcontainer.json (s'il existe) pour lancer l'environnement de développement.

Prérequis

    Docker doit être démarré et fonctionnel sur votre machine.

    Visual Studio Code doit être installé.

    L'extension Dev Containers (ou Remote - Containers) doit être installée dans VS Code.

Étape 1 : Ouvrir le Projet dans VS Code

Ouvrez le dossier racine de votre projet dans VS Code comme vous le feriez normalement :
Bash: code .

Étape 2 : Lancer le Dev Container

VS Code détectera automatiquement la configuration Dev Container (basée sur votre docker-compose.yml ou un fichier .devcontainer si vous en avez un) et vous proposera de le réouvrir dans le conteneur.

    Une notification pop-up devrait apparaître en bas à droite :

        "Folder contains Dev Container configuration files. Reopen in Container?"

    Cliquez sur le bouton bleu "Reopen in Container".

Si la notification n'apparaît pas :

    Appuyez sur F1 (ou Ctrl+Shift+P / Cmd+Shift+P).

    Tapez "Dev Containers: Reopen in Container" et sélectionnez l'option.

VS Code va alors :

    Construire les images Docker si nécessaire.

    Lancer les services définis dans le docker-compose.yml (votre db, backend, et frontend).

    Attacher le terminal et l'interface au conteneur.

Étape 3 : Lancer les Services de Développement

Une fois que VS Code est attaché au conteneur (le terminal par défaut est maintenant à l'intérieur du conteneur), vous avez généralement besoin de lancer le serveur de développement React manuellement pour bénéficier du Hot Reloading :

      3.1 : Démarrer le Serveur Backend (FastAPI)
      
      Dans le terminal, naviguez vers le dossier backend. L'environnement Python y est déjà actif:
      . .venv/bin/activate
      cd backend
      uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
      Votre backend démarre et crée les tables dans la base de données PostgreSQL. Laissez ce terminal ouvert.

      3.2 : Démarrer le Serveur Frontend (React)
      
      Ouvrez un nouveau terminal dans VS Code (Terminal > New Terminal). Naviguez vers le dossier frontend et lancez le serveur de développement :
      . .venv/bin/activate
      cd frontend
      npm install
      npm run dev

Étape 4. Accès à l'Application:

Application Web	http://localhost:3000
Documentation API	http://localhost:8000/docs


# backend/scripts/seed_local_test.py
"""
Jeu de test LOCAL pour la passation MAC et la saisie papier (données fictives).

Usage, depuis le dossier backend/ avec le venv activé :

    DATABASE_URL="sqlite:////chemin/absolu/test.db" python scripts/seed_local_test.py
        -> crée le compte de test, l'enquête fictive et un lien public

    DATABASE_URL="sqlite:////chemin/absolu/test.db" python scripts/seed_local_test.py --check
        -> envoie des réponses fictives valides et invalides, puis affiche les statistiques
           (chaque exécution ajoute des réponses à la base de test)

Garde-fou : le script refuse toute base qui n'est ni SQLite, ni un hôte local.
Ne jamais le lancer avec l'URL de production.
"""
import os
import random
import sys
from urllib.parse import urlparse

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BACKEND_DIR)

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    sys.exit("DATABASE_URL non défini. Exemple : sqlite:////chemin/absolu/test.db")

if not DB_URL.startswith("sqlite"):
    host = urlparse(DB_URL).hostname
    if host not in {"localhost", "127.0.0.1", "db"}:
        sys.exit(f"Refus : l'hôte '{host}' n'est pas local. Ce script n'écrit que dans une base locale.")

from fastapi import HTTPException  # noqa: E402

from app import crud, models, schemas, stats_likert  # noqa: E402
from app.database import SessionLocal, engine  # noqa: E402

TEST_EMAIL = "enqueteur.test@example.com"
# Mot de passe du compte de test : jamais écrit dans le dépôt, à fournir dans l'environnement
TEST_PASSWORD = os.getenv("SEED_PASSWORD")
if not TEST_PASSWORD:
    sys.exit("SEED_PASSWORD non défini. Choisissez un mot de passe de test et exportez-le avant de lancer le script.")
TITRE = "MAC test local (données fictives)"
ITEMS = [f"Proposition de test {i:02d}" for i in range(1, 11)]
# Distribution exigée pour 10 items : 2 fois chaque valeur de -2 à 2
VALUES = [2, 2, -2, -2, 1, 1, -1, -1, 0, 0]
FRONT_URL = os.getenv("FRONT_URL", "http://localhost:3000")


def get_or_create_user(db):
    user = db.query(models.User).filter(models.User.email == TEST_EMAIL).first()
    if user:
        return user
    return crud.create_user(
        db, schemas.UserCreate(email=TEST_EMAIL, password=TEST_PASSWORD)
    )


def get_or_create_enquete(db, owner):
    existing = db.query(models.Enquete).filter(models.Enquete.titre == TITRE).first()
    if existing:
        return existing
    questions = [
        schemas.QuestionIn(
            texte=t, type_question="likert", part=schemas.QuestionPart.MANDATORY
        )
        for t in ITEMS
    ]
    questions.append(
        schemas.QuestionIn(
            texte="Sexe",
            type_question="single_choice",
            part=schemas.QuestionPart.OPTIONAL,
            choices=[schemas.ChoiceIn(label="Homme"), schemas.ChoiceIn(label="Femme")],
        )
    )
    questions.append(
        schemas.QuestionIn(
            texte="Commentaire libre",
            type_question="text",
            part=schemas.QuestionPart.OPTIONAL,
        )
    )
    enquete_in = schemas.EnqueteCreate(
        titre=TITRE,
        taille_liste=len(ITEMS),
        description="Enquête fictive pour tester la passation et la saisie papier. Aucune donnée réelle.",
        questions=questions,
    )
    return crud.create_enquete_full(db, enquete_in, owner_id=owner.id)


def run_check(db, enquete):
    mandatory = sorted(
        (q for q in enquete.questions if q.part == models.QuestionPart.MANDATORY),
        key=lambda q: q.id,
    )
    ids = [q.id for q in mandatory]

    def payload(values):
        return schemas.ResponseIn(
            answers=[
                schemas.AnswerIn(question_id=qid, value=v) for qid, v in zip(ids, values)
            ]
        )

    def attempt(values):
        try:
            crud.submit_response(db, enquete, payload(values))
            return True, "acceptée"
        except HTTPException as e:
            return False, e.detail

    rnd = random.Random(42)
    accepted = 0
    for _ in range(20):
        vals = VALUES[:]
        rnd.shuffle(vals)
        ok, _ = attempt(vals)
        accepted += ok
    print(f"[{'OK' if accepted == 20 else 'ÉCHEC'}] 20 réponses valides acceptées : {accepted}/20")

    cases = [
        ("distribution fausse (3x +2, 2x -2, 2x +1, 2x -1, 1x 0)",
         [2, 2, 2, -2, -2, 1, 1, -1, -1, 0], False),
        ("item manquant (9 réponses sur 10)", VALUES[:9], False),
        ("valeur hors échelle (3)", [3] + VALUES[1:], False),
    ]
    for label, vals, expect_ok in cases:
        ok, detail = attempt(vals)
        status = "OK" if ok == expect_ok else "ÉCHEC"
        print(f"[{status}] refusée attendue — {label} : {detail}")

    db.expire_all()
    stats = stats_likert.compute_likert_stats(enquete)
    print(f"\nStatistiques : {stats['n_responses']} réponses, {stats['k_items']} items")
    for item, score, cons, cls in zip(
        stats["items"], stats["scores"], stats["consensus"], stats["consensus_classes"]
    ):
        print(f"  {item['texte']:<28} score={score:+.2f}  consensus={cons:.3f}  classe={cls}")


def main():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        owner = get_or_create_user(db)
        enquete = get_or_create_enquete(db, owner)
        if "--check" in sys.argv:
            run_check(db, enquete)
        else:
            link = crud.create_share_link(db, enquete)
            print(f"Compte de test : {TEST_EMAIL}")
            print(f"Enquête        : {enquete.titre} (id {enquete.id})")
            print(f"Saisie papier  : {FRONT_URL}/public/{link.token}?mode=papier")
    finally:
        db.close()


if __name__ == "__main__":
    main()

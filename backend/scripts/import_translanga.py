# backend/scripts/import_translanga.py
import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Enquete, Question, Choice, Response, Answer, QuestionPart

EXCEL_FILE = "data/Fichier général Translanga tous pays.xlsx"
SHEET_INDEX = 0
OWNER_ID = 1  # à adapter

def main():
    df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_INDEX)

    # Ligne 0 : noms techniques (LIKERT, Unnamed:1, ..., OPTIONNEL, Unnamed:16, ...)
    # Ligne 1 : libellés (modernité, ..., école, Pays, Ville, Commune, Sexe, Age, Profession, Niveau études)
    # Lignes 2+ : répondants

    # 1) Items Likert : 15 colonnes de notes
    item_labels = [
        "modernité",
        "compliquée",
        "réussite",
        "colonisateur",
        "riche",
        "travail administration",
        "véhiculaire",
        "France",
        "affaires",
        "littérature",
        "intellectuels",
        "pays francophones",
        "variation",
        "recul",
        "école",
    ]
    item_cols = list(df.columns[0:15])  # colonnes de notes -2..2

    # 2) Questions optionnelles : colonnes 15..21 (7 colonnes)
    # On force les libellés attendus, mais on réutilise bien les colonnes 15..21 du fichier
    optional_labels = [
        "Pays",
        "Ville",
        "Commune",
        "Sexe",
        "Age",
        "Profession",
        "Niveau études",
    ]
    optional_cols = list(df.columns[15:22])

    # Données répondants
    data_df = df.iloc[2:].reset_index(drop=True)

    db: Session = SessionLocal()

    # --- créer l'enquête ---
    enquete = Enquete(
        titre="Translanga – Tous pays – Français",
        description="Import auto depuis Fichier général Translanga tous pays.xlsx",
        taille_liste=len(item_labels),
        owner_id=OWNER_ID,
    )
    db.add(enquete)
    db.flush()

    # --- créer les questions MANDATORY (Likert) + choices -2..2 ---
    likert_questions: list[Question] = []
    for label in item_labels:
        q = Question(
            texte=str(label),
            type_question="likert",
            is_required=True,
            part=QuestionPart.MANDATORY,
            enquete_id=enquete.id,
        )
        db.add(q)
        db.flush()

        for v in [-2, -1, 0, 1, 2]:
            c = Choice(
                question_id=q.id,
                label=str(v),
                value=v,
            )
            db.add(c)

        likert_questions.append(q)

    # --- créer les questions OPTIONAL (Pays, Ville, ...) ---
    optional_questions: dict[str, Question] = {}
    for label_str in optional_labels:
        q_type = "text"
        if label_str.strip().lower().startswith("age"):
            q_type = "text"  # on stockera l'âge comme texte ou on le convertira plus tard

        q = Question(
            texte=label_str,           # IMPORTANT : libellé fixe (Pays, Ville, ...)
            type_question=q_type,
            is_required=False,
            part=QuestionPart.OPTIONAL,
            enquete_id=enquete.id,
        )
        db.add(q)
        db.flush()
        optional_questions[label_str] = q

    print("OPTIONAL QUESTIONS EN BASE :")
    for lbl, q in optional_questions.items():
        print(" -", repr(lbl), "=>", q.id, repr(q.texte))

    db.commit()
    db.refresh(enquete)

    # --- importer les réponses ---
    for _, row in data_df.iterrows():
        # ignorer si toutes les notes likert sont vides
        if all(pd.isna(row[col]) for col in item_cols):
            continue

        resp = Response(enquete_id=enquete.id)
        db.add(resp)
        db.flush()

        # réponses Likert (MANDATORY)
        for idx, q in enumerate(likert_questions):
            col = item_cols[idx]
            score = row[col]
            if pd.isna(score):
                continue
            try:
                v = int(score)
            except Exception:
                continue

            ans = Answer(
                response_id=resp.id,
                question_id=q.id,
                value=v,
                text_value=None,
                choice_id=None,
            )
            db.add(ans)

        # réponses OPTIONAL (Pays, Ville, ...)
        for label_str, col in zip(optional_labels, optional_cols):
            q_opt = optional_questions.get(label_str)
            if not q_opt:
                continue

            val = row[col]
            if pd.isna(val):
                continue

            txt = str(val).strip()
            if not txt:
                continue

            ans_opt = Answer(
                response_id=resp.id,
                question_id=q_opt.id,
                text_value=txt,
                value=None,
                choice_id=None,
            )
            db.add(ans_opt)

    db.commit()
    db.close()
    print("Import Translanga terminé.")

if __name__ == "__main__":
    main()

# backend/scripts/import_translanga.py
import csv
import os
from collections import Counter
from urllib.parse import urlparse

import pandas as pd
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Enquete, Question, Choice, Response, Answer, QuestionPart

EXCEL_FILE = "data/Fichier général Translanga tous pays.xlsx"
SHEET_INDEX = 0
OWNER_ID = 1  # à adapter
# Liste des numéros de lignes rejetées : hors du dépôt Git, sans données personnelles
REJETS_CSV = os.path.expanduser("~/Downloads/MAC_donnees_locales/rejets_translanga.csv")


def verifier_pas_de_production():
    """N'autorise que les bases locales (SQLite ou hôte local)."""
    url = os.getenv("DATABASE_URL", "")
    if not url:
        raise SystemExit("DATABASE_URL non défini : indiquez une base locale (sqlite:///... ou localhost).")
    if not url.startswith("sqlite"):
        host = urlparse(url).hostname
        if host not in {"localhost", "127.0.0.1", "db"}:
            raise SystemExit(f"Refus : l'hôte '{host}' n'est pas local. Import réservé à une base locale.")


def verifier_ligne(row, item_cols):
    """Retourne le motif de rejet, ou None si la ligne est conforme.
    Règles : 15 notes complètes, entières, entre -2 et +2, et 3 fois chaque valeur."""
    for col in item_cols:
        v = row[col]
        if pd.isna(v) or str(v).strip() == "":
            return "note manquante"
    vals = []
    for col in item_cols:
        try:
            f = float(row[col])
        except (TypeError, ValueError):
            return "valeur non numérique"
        if f != int(f) or not -2 <= f <= 2:
            return "valeur hors -2..2"
        vals.append(int(f))
    c = Counter(vals)
    if any(c.get(x, 0) != 3 for x in (-2, -1, 0, 1, 2)):
        return "quotas 3/3/3/3/3 non respectés"
    return None


def main():
    verifier_pas_de_production()
    df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_INDEX)

    # Ligne 1 du fichier : en-têtes (noms des items et des variables)
    # Lignes 2 et suivantes : répondants (numéro de ligne Excel = index + 2)

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
    data_df = df.reset_index(drop=True)  # toutes les lignes sont des répondants

    # Validation : seules les lignes conformes sont importées
    lignes_valides, rejets = [], []
    for idx, row in data_df.iterrows():
        motif = verifier_ligne(row, item_cols)
        if motif:
            rejets.append((idx + 2, motif))  # numéro de ligne Excel
        else:
            lignes_valides.append(row)
    print(f"Lignes lues : {len(data_df)} | conformes : {len(lignes_valides)} | rejetées : {len(rejets)}")
    os.makedirs(os.path.dirname(REJETS_CSV), exist_ok=True)
    with open(REJETS_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["ligne_excel", "motif"])
        w.writerows(rejets)
    print("Liste des lignes rejetées (numéros uniquement) :", REJETS_CSV)

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
    for row in lignes_valides:
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

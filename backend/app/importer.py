# backend/app/importer.py
"""
Import d'enquêtes papier déjà réalisées, depuis un fichier CSV ou Excel.

Format attendu (voir le modèle téléchargeable dans l'application) :
- première ligne = en-têtes ;
- colonne facultative « id_sujet » : code anonyme (jamais un nom) ;
- une colonne par proposition (10, 15 ou 20) : valeurs entières de −2 à +2 ;
- colonnes facultatives « info_… » (ex. info_pays) : texte libre ;
- chaque valeur doit apparaître exactement N/5 fois par ligne (2, 3 ou 4).

Seules les lignes complètes et conformes sont importées. Les autres sont
listées par numéro de ligne Excel, avec le motif du rejet, sans leur contenu.
"""
import io
from collections import Counter

import pandas as pd
from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import models
from .protocole_mac import TAILLES_VALIDES, VALEURS

TAILLE_MAX_OCTETS = 50 * 1024 * 1024


def lire_fichier(nom: str, contenu: bytes) -> pd.DataFrame:
    """Lit un CSV (séparateur ; ou ,) ou un Excel. Toutes les cellules sont lues en texte."""
    minuscule = nom.lower()
    if minuscule.endswith(".csv"):
        try:
            texte = contenu.decode("utf-8-sig")
        except UnicodeDecodeError:
            texte = contenu.decode("latin-1")
        sep = ";" if texte.count(";") >= texte.count(",") else ","
        return pd.read_csv(io.StringIO(texte), sep=sep, dtype=str, keep_default_na=False)
    if minuscule.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(contenu), sheet_name=0, dtype=str, keep_default_na=False)
    raise HTTPException(400, "Format non pris en charge : utilisez un fichier .csv, .xlsx ou .xls.")


def _entier(texte: str):
    """Convertit une cellule en entier de −2 à +2. Retourne None si ce n'est pas possible."""
    t = str(texte).strip().replace("−", "-").replace("+", "")
    if t == "":
        return None
    try:
        f = float(t)
    except ValueError:
        return None
    if f != int(f):
        return None
    return int(f)


def analyser(df: pd.DataFrame):
    """Valide le fichier. Retourne (colonnes_items, colonnes_info, lignes_valides, rejets)."""
    colonnes = [str(c).strip() for c in df.columns]
    df.columns = colonnes
    colonnes_info = [c for c in colonnes if c.lower().startswith("info_")]
    colonnes_items = [c for c in colonnes if c != "id_sujet" and c not in colonnes_info]

    n = len(colonnes_items)
    if n not in TAILLES_VALIDES:
        raise HTTPException(
            400,
            f"Le fichier contient {n} propositions. Il doit en contenir 10, 15 ou 20.",
        )
    if len(set(colonnes_items)) != n:
        raise HTTPException(400, "Deux propositions portent le même nom de colonne.")

    par_valeur = n // 5
    valides, rejets = [], []
    for index, ligne in df.iterrows():
        numero_excel = index + 2  # la ligne 1 contient les en-têtes
        valeurs_brutes = [ligne[c] for c in colonnes_items]

        if any(str(v).strip() == "" for v in valeurs_brutes):
            rejets.append((numero_excel, "réponse incomplète"))
            continue

        valeurs = [_entier(v) for v in valeurs_brutes]
        if any(v is None for v in valeurs):
            rejets.append((numero_excel, "valeur non entière"))
            continue
        if any(v not in VALEURS for v in valeurs):
            rejets.append((numero_excel, "valeur hors de −2 à +2"))
            continue

        compte = Counter(valeurs)
        if any(compte.get(v, 0) != par_valeur for v in VALEURS):
            rejets.append((numero_excel, f"quotas non respectés ({par_valeur} fois chaque valeur)"))
            continue

        info = {c: str(ligne[c]).strip() for c in colonnes_info if str(ligne[c]).strip()}
        valides.append({"valeurs": valeurs, "info": info})

    return colonnes_items, colonnes_info, valides, rejets


def importer_enquete(db: Session, titre: str, description: str, nom_fichier: str, contenu: bytes, owner: models.User):
    """Crée l'enquête et ses réponses valides. Retourne un résumé sans données personnelles."""
    if len(contenu) > TAILLE_MAX_OCTETS:
        raise HTTPException(413, "Fichier trop volumineux (50 Mo maximum).")
    if not titre.strip():
        raise HTTPException(400, "Le titre de l'enquête est obligatoire.")
    if db.query(models.Enquete).filter(models.Enquete.titre == titre.strip()).first():
        raise HTTPException(400, "Une enquête porte déjà ce titre. Choisissez un autre titre.")

    df = lire_fichier(nom_fichier, contenu)
    if df.empty:
        raise HTTPException(400, "Le fichier ne contient aucune ligne de réponses.")

    colonnes_items, colonnes_info, valides, rejets = analyser(df)
    if not valides:
        raise HTTPException(400, "Aucune ligne conforme : rien n'a été importé.")

    try:
        enquete = models.Enquete(
            titre=titre.strip(),
            description=description.strip() or f"Import de {nom_fichier}",
            taille_liste=len(colonnes_items),
            owner_id=owner.id,
        )
        db.add(enquete)
        db.flush()

        questions_items = []
        for texte in colonnes_items:
            q = models.Question(
                texte=texte,
                type_question="likert",
                is_required=True,
                part=models.QuestionPart.MANDATORY,
                enquete_id=enquete.id,
            )
            db.add(q)
            db.flush()
            questions_items.append(q)

        questions_info = {}
        for col in colonnes_info:
            q = models.Question(
                texte=col[len("info_"):].replace("_", " ").capitalize(),
                type_question="text",
                is_required=False,
                part=models.QuestionPart.OPTIONAL,
                enquete_id=enquete.id,
            )
            db.add(q)
            db.flush()
            questions_info[col] = q

        for ligne in valides:
            reponse = models.Response(enquete_id=enquete.id)
            db.add(reponse)
            db.flush()
            for q, valeur in zip(questions_items, ligne["valeurs"]):
                db.add(models.Answer(response_id=reponse.id, question_id=q.id, value=valeur))
            for col, texte in ligne["info"].items():
                db.add(models.Answer(response_id=reponse.id, question_id=questions_info[col].id, text_value=texte))

        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "enquete_id": enquete.id,
        "title": enquete.titre,
        "items_imported": len(colonnes_items),
        "responses_imported": len(valides),
        "rejected_count": len(rejets),
        "rejected": [{"ligne": n, "motif": m} for n, m in rejets],
        "message": f"Import terminé : {len(valides)} réponses importées, {len(rejets)} lignes rejetées.",
    }

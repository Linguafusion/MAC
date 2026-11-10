# backend/app/protocole_mac.py
"""
Protocole MAC en quatre temps (méthode de Bruno Maurer).

Ce module est la source unique, côté serveur, des règles de passation :
- contrôle des réponses reçues (en ligne, en saisie papier, ou par import) ;
- libellés et ordre des temps, repris dans le questionnaire papier (Word).

Le miroir côté interface se trouve dans frontend/src/services/protocoleMac.js
et doit rester identique.

Déroulement pour N propositions (N = 10, 15 ou 20, k = N / 5) :
  Temps 1 (+2) : choisir k « Les plus importantes pour moi » ;
  Temps 2 (−2) : parmi les restantes, choisir k « Les moins importantes pour moi » ;
  Temps 3 (+1) : parmi les restantes, choisir k « Assez importantes pour moi » ;
  Temps 4 (−1) : parmi les restantes, choisir k « Assez peu importantes pour moi » ;
  Les k propositions restantes reçoivent automatiquement la médiane 0.
Chaque valeur −2 … +2 apparaît donc exactement k fois.
"""
from collections import Counter

TAILLES_VALIDES = (10, 15, 20)
VALEURS = (-2, -1, 0, 1, 2)

# Les quatre temps de sélection, dans l'ordre de passation
ETAPES = (
    {"valeur": 2, "libelle": "Les plus importantes pour moi"},
    {"valeur": -2, "libelle": "Les moins importantes pour moi"},
    {"valeur": 1, "libelle": "Assez importantes pour moi"},
    {"valeur": -1, "libelle": "Assez peu importantes pour moi"},
)

VALEUR_MEDIANE = 0
LIBELLE_MEDIANE = "Médiane (0) : non retenues"

LIBELLES_VALEUR = {
    2: "Les plus importantes pour moi",
    -2: "Les moins importantes pour moi",
    1: "Assez importantes pour moi",
    -1: "Assez peu importantes pour moi",
    0: LIBELLE_MEDIANE,
}


def libelle_valeur(valeur: int) -> str:
    return LIBELLES_VALEUR.get(valeur, "N/A")


def nombre_par_etape(taille: int) -> int:
    """Nombre de propositions à choisir à chaque temps : 2, 3 ou 4."""
    if taille not in TAILLES_VALIDES:
        raise ValueError("Le questionnaire doit comporter 10, 15 ou 20 propositions.")
    return taille // 5


def verifier_distribution(valeurs: list[int]) -> None:
    """
    Contrôle qu'un ensemble de valeurs respecte le protocole.
    Lève ValueError avec un message en français si ce n'est pas le cas.
    """
    taille = len(valeurs)
    k = nombre_par_etape(taille)
    if any(v not in VALEURS for v in valeurs):
        raise ValueError("Valeur Likert invalide : les valeurs vont de −2 à +2.")
    compte = Counter(valeurs)
    for valeur in VALEURS:
        if compte.get(valeur, 0) != k:
            raise ValueError(
                f"Distribution invalide : chaque valeur doit apparaître exactement {k} fois "
                f"(quatre temps de {k} choix, les {k} propositions restantes recevant 0)."
            )

# backend/app/stats_likert.py

from typing import List, Dict
from math import sqrt
from . import models
from itertools import combinations
from typing import Tuple

# On suit strictement le cadre de l'annexe :
# - valuations entre -2 et 2
# - score = moyenne par item
# - écart-type classique
# - consensus cj = (Mab)/((b-a)*σj + Ma) avec M=2 par défaut

def build_likert_matrix(
    enquete: models.Enquete,
    responses: List[models.Response],
) -> tuple[List[models.Question], List[List[int]]]:
    # Questions obligatoires Likert, triées par id pour un ordre stable
    questions_likert = sorted(
        [q for q in enquete.questions if q.part.name == "MANDATORY" and q.type_question == "likert"],
        key=lambda q: q.id,
    )

    if not questions_likert or not responses:
        return [], []

    col_index: Dict[int, int] = {q.id: idx for idx, q in enumerate(questions_likert)}
    k = len(questions_likert)

    matrix: List[List[int]] = []

    for resp in responses:
        row = [0] * k
        for ans in resp.answers:
            qid = ans.question_id
            if qid in col_index and ans.value is not None:
                col = col_index[qid]
                row[col] = ans.value
        matrix.append(row)

    return questions_likert, matrix

def compute_scores(matrix: List[List[int]]) -> List[float]:
    """
    Score d'un item = moyenne des valuations pour chaque colonne j.
    matrix : N x k
    retourne : liste de scores x_j de taille k
    """
    if not matrix:
        return []

    N = len(matrix)
    k = len(matrix[0])
    scores: List[float] = []

    for j in range(k):
        s = sum(matrix[i][j] for i in range(N))
        scores.append(s / N)
    return scores


def compute_stddevs(matrix: List[List[int]], scores: List[float]) -> List[float]:
    """
    Écart-type σ_j pour chaque item j.
    σ_j = sqrt( 1/N * sum_i (x_{i,j} - x_j)^2 )
    """
    if not matrix:
        return []

    N = len(matrix)
    k = len(matrix[0])
    stds: List[float] = []

    for j in range(k):
        mean = scores[j]
        var = sum((matrix[i][j] - mean) ** 2 for i in range(N)) / N
        stds.append(sqrt(var))
    return stds


def compute_consensus(
    stds: List[float],
    M: float = 2.0,
    a: float = 0.05,
    b: float = 0.5,
) -> List[float]:
    """
    Consensus cj = (Mab) / ((b-a) * σ_j + M*a)
    avec σ_j ∈ [0, M].
    On renvoie une liste de consensus de taille k.
    """
    consensus: List[float] = []
    for sigma in stds:
        cj = (M * a * b) / ((b - a) * sigma + M * a)
        consensus.append(cj)
    return consensus

def filter_responses_by_raw_filters(
    enquete: models.Enquete,
    raw_filters: Dict[str, str] | None = None,
) -> list[models.Response]:
    """
    raw_filters vient des query params du type:
      filters[123] = "Côte d'Ivoire"
      filters[145_min] = "18"
      filters[145_max] = "25"
    où 123 et 145 sont des id de Question OPTIONAL.

    On retourne la liste des Response qui respectent tous les filtres.
    """
    if not raw_filters:
        return list(enquete.responses)

    # construire un index question_id -> {type, values/min/max}
    optional_questions = {q.id: q for q in enquete.questions if q.part.name == "OPTIONAL"}

    # parser raw_filters en structure exploitable
    text_filters: Dict[int, str] = {}
    num_min: Dict[int, float] = {}
    num_max: Dict[int, float] = {}

    for key, val in raw_filters.items():
        # key ressemble à "123" ou "145_min"/"145_max"
        if key.endswith("_min"):
            qid = int(key[:-4])
            try:
                num_min[qid] = float(val)
            except Exception:
                continue
        elif key.endswith("_max"):
            qid = int(key[:-4])
            try:
                num_max[qid] = float(val)
            except Exception:
                continue
        else:
            # filtre texte exact sur question_id
            try:
                qid = int(key)
            except Exception:
                continue
            text_filters[qid] = str(val).strip()

    filtered: list[models.Response] = []

    for resp in enquete.responses:
        # indexer les answers de cette response par question_id
        ans_by_qid: Dict[int, models.Answer] = {a.question_id: a for a in resp.answers}

        ok = True

        # filtres texte
        for qid, expected in text_filters.items():
            ans = ans_by_qid.get(qid)
            if not ans or not ans.text_value:
                ok = False
                break
            if ans.text_value.strip() != expected:
                ok = False
                break
        if not ok:
            continue

        # filtres numériques
        for qid, min_v in num_min.items():
            ans = ans_by_qid.get(qid)
            if not ans:
                ok = False
                break
            val_num = None
            if ans.value is not None:
                val_num = ans.value
            else:
                try:
                    val_num = float(ans.text_value) if ans.text_value else None
                except Exception:
                    val_num = None
            if val_num is None or val_num < min_v:
                ok = False
                break
        if not ok:
            continue

        for qid, max_v in num_max.items():
            ans = ans_by_qid.get(qid)
            if not ans:
                ok = False
                break
            val_num = None
            if ans.value is not None:
                val_num = ans.value
            else:
                try:
                    val_num = float(ans.text_value) if ans.text_value else None
                except Exception:
                    val_num = None
            if val_num is None or val_num > max_v:
                ok = False
                break
        if not ok:
            continue

        filtered.append(resp)

    return filtered

def compute_likert_stats(
    enquete: models.Enquete,
    cutoff: float | None = 1.4,
    max_pairs: int | None = None,  # None = toutes les paires sous le seuil (le guide construit le graphe avec toutes)
    raw_filters: Dict[str, str] | None = None,
) -> dict:
    # 1) filtrer les responses à partir des questions OPTIONAL
    filtered_responses = filter_responses_by_raw_filters(enquete, raw_filters=raw_filters)

    # 2) construire la matrice uniquement sur ces responses
    questions_likert, matrix = build_likert_matrix(enquete, filtered_responses)

    if not questions_likert or not matrix:
        return {
            "items": [],
            "scores": [],
            "stddevs": [],
            "consensus": [],
            "consensus_classes": [],
            "distances": [],
            "polarisations": [],
            "crowns": [],
            "n_responses": 0,
            "k_items": len(questions_likert),
            "filters": build_optional_filters(enquete),
        }

    scores = compute_scores(matrix)
    stds = compute_stddevs(matrix, scores)
    consensus = compute_consensus(stds)
    consensus_classes = [classify_consensus(c) for c in consensus]

    items = [{"id": q.id, "texte": q.texte} for q in questions_likert]

    distance_matrix = compute_distance_matrix(matrix)
    polarisations = select_polarisations(
        distance_matrix,
        items,
        cutoff=cutoff,
        max_pairs=max_pairs,
    )

    optional_filters = build_optional_filters(enquete)

    crowns = build_crowns_structure(scores, distance_matrix)

    return {
        "items": items,
        "scores": scores,
        "stddevs": stds,
        "consensus": consensus,
        "consensus_classes": consensus_classes,
        "distances": distance_matrix,
        "polarisations": polarisations,
        "crowns": crowns,
        "n_responses": len(filtered_responses),
        "k_items": len(questions_likert),
        "filters": optional_filters,
    }

CONSENSUS_THRESHOLD = 0.07  # seuil du guide MAC séparant les deux classes de consensus

def classify_consensus(c: float, seuil: float = CONSENSUS_THRESHOLD) -> int:
    """1 = consensus retenu (c >= seuil), 2 = consensus faible (c < seuil)."""
    return 1 if c >= seuil else 2

def classify_adhesion(score: float) -> int | None:
    # Une moyenne de exactement +2 (tous les répondants ont choisi +2) appartient à la classe 1
    if 1 <= score <= 2:
        return 1
    if 0 <= score < 1:
        return 2
    if -1 <= score < 0:
        return 3
    if -2 <= score < -1:
        return 4
    return None

def build_crowns_structure(scores: list[float],
                           distances: list[list[float]]) -> list[dict]:
    k = len(scores)
    if k == 0 or not distances:
        return []

    # distance moyenne par item
    avg_dists: list[float] = []
    for j in range(k):
        vals = [distances[j][h] for h in range(k) if h != j]
        avg_dists.append(sum(vals) / len(vals))

    # médiane
    sorted_vals = sorted(avg_dists)
    mid = len(sorted_vals) // 2
    if len(sorted_vals) % 2 == 1:
        median = sorted_vals[mid]
    else:
        median = 0.5 * (sorted_vals[mid - 1] + sorted_vals[mid])

    items_info: list[dict] = []
    for j, score in enumerate(scores):
        adh_class = classify_adhesion(score)
        if adh_class is None:
            continue
        prox = "proximity" if avg_dists[j] < median else "distance"

        # cadre 1..8
        cadre = None
        if adh_class == 1 and prox == "proximity":
            cadre = 1
        elif adh_class == 1 and prox == "distance":
            cadre = 2
        elif adh_class == 2 and prox == "proximity":
            cadre = 3
        elif adh_class == 2 and prox == "distance":
            cadre = 4
        elif adh_class == 3 and prox == "proximity":
            cadre = 5
        elif adh_class == 3 and prox == "distance":
            cadre = 6
        elif adh_class == 4 and prox == "proximity":
            cadre = 7
        elif adh_class == 4 and prox == "distance":
            cadre = 8

        # zone 1..4 d’après le doc
        if cadre == 1:
            zone = 1
        elif cadre in (2, 3):
            zone = 2
        elif cadre in (4, 5):
            zone = 3
        else:  # 6,7,8
            zone = 4

        items_info.append(
            {
                "index": j,
                "adh_class": adh_class,
                "distance_class": prox,
                "avg_distance": avg_dists[j],
                "cadre": cadre,
                "zone": zone,
            }
        )

    return items_info


def compute_distance_matrix(matrix: List[List[int]]) -> List[List[float]]:
  """
  Calcule la matrice des distances DjAjB entre colonnes (items) de la matrice X.
  D(jA,jB) = sqrt(1/N * sum_i (x_{i,jA} - x_{i,jB})^2)
  Retourne une matrice k x k (symétrique, diagonale = 0).
  """
  if not matrix:
      return []

  N = len(matrix)
  k = len(matrix[0])
  # transpose pour accéder facilement par colonne
  cols = [[matrix[i][j] for i in range(N)] for j in range(k)]

  distances: List[List[float]] = [[0.0] * k for _ in range(k)]

  for a in range(k):
      for b in range(a + 1, k):
          s = 0.0
          for i in range(N):
              diff = cols[a][i] - cols[b][i]
              s += diff * diff
          d = sqrt(s / N)
          distances[a][b] = d
          distances[b][a] = d

  return distances


def select_polarisations(
  distances: List[List[float]],
  items: List[dict],
  cutoff: float | None = None,
  max_pairs: int | None = 10,
) -> List[dict]:
  """
  Sélectionne les paires d'items les plus proches (polarisations).
  - distances : matrice k x k
  - items : liste [{id, texte}] dans le même ordre que les colonnes
  - cutoff : distance de coupure (si donnée, on garde uniquement d <= cutoff)
  - max_pairs : nombre max de paires à retourner (les plus petites distances)

  Retourne une liste de dicts:
  {
    "item_a_id": ...,
    "item_b_id": ...,
    "item_a_index": ...,
    "item_b_index": ...,
    "distance": ...
  }
  """
  k = len(distances)
  pairs: List[Tuple[int, int, float]] = []

  for a, b in combinations(range(k), 2):
      d = distances[a][b]
      if cutoff is not None and d > cutoff:
          continue
      pairs.append((a, b, d))

  # tri par distance croissante
  pairs.sort(key=lambda t: t[2])

  if max_pairs is not None:
      pairs = pairs[:max_pairs]

  result: List[dict] = []
  for a, b, d in pairs:
      result.append(
          {
              "item_a_index": a,
              "item_b_index": b,
              "item_a_id": items[a]["id"],
              "item_b_id": items[b]["id"],
              "distance": d,
          }
      )
  return result

def build_optional_filters(enquete: models.Enquete) -> dict:
    results = []

    # on parcourt toutes les questions optionnelles
    for q in enquete.questions:
        if q.part.name != "OPTIONAL":
            continue

        # récupère toutes les réponses à cette question
        vals = []
        for resp in enquete.responses:
            for ans in resp.answers:
                if ans.question_id != q.id:
                    continue
                # priorité à value numérique si présent, sinon text_value
                if ans.value is not None:
                    vals.append(ans.value)
                elif ans.text_value:
                    vals.append(ans.text_value.strip())
                break  # une answer par response / question

        if not vals:
            continue

        # si toutes les valeurs sont numériques -> filtre numérique min/max
        if all(isinstance(v, (int, float)) for v in vals):
            vmin = min(vals)
            vmax = max(vals)
            results.append(
                {
                    "id": q.id,
                    "texte": q.texte,
                    "type": "number",
                    "min": vmin,
                    "max": vmax,
                }
            )
        else:
            # sinon filtre par valeurs distinctes (texte)
            uniques = sorted({str(v) for v in vals if str(v).strip() != ""})
            results.append(
                {
                    "id": q.id,
                    "texte": q.texte,
                    "type": "text",
                    "values": uniques,
                }
            )
    return {"questions": results}

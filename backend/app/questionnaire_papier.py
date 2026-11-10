# backend/app/questionnaire_papier.py
"""
Questionnaire papier au format Word (.docx), pour les terrains sans connexion
ni ordinateur. Il reprend la structure du protocole MAC en quatre temps :
les mêmes libellés, le même nombre de choix à chaque temps.

Le sujet coche, à chaque temps, parmi les propositions non encore cochées.
Les propositions non cochées à la fin reçoivent la médiane 0.
La version imprimable (PDF) est produite par le navigateur depuis la page
« Questionnaire papier » de l'application.
"""
import io

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

from . import protocole_mac

CASE = "☐"  # ☐
NOMBRE_EN_LETTRES = {2: "deux", 3: "trois", 4: "quatre"}
LARGEURS_CM = {"numero": 0.9, "proposition": 8.4, "temps": 3.5, "finale": 2.6}


def _valeur(v):
    """Accepte aussi bien un Enum SQLAlchemy qu'une chaîne."""
    return getattr(v, "value", v)


def _est_proposition_mac(question) -> bool:
    return _valeur(question.part) == "MANDATORY" and _valeur(question.type_question) == "likert"


def _signe(valeur: int) -> str:
    if valeur > 0:
        return f"+{valeur}"
    if valeur < 0:
        return f"−{abs(valeur)}"
    return "0"


def _ombrer(cellule, couleur: str = "D9D9D9") -> None:
    tc_pr = cellule._tc.get_or_add_tcPr()
    ombre = OxmlElement("w:shd")
    ombre.set(qn("w:val"), "clear")
    ombre.set(qn("w:color"), "auto")
    ombre.set(qn("w:fill"), couleur)
    tc_pr.append(ombre)


def _ecrire(cellule, texte: str, taille: float = 9, gras: bool = False, centre: bool = False) -> None:
    cellule.text = ""
    paragraphe = cellule.paragraphs[0]
    if centre:
        paragraphe.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraphe.add_run(texte)
    run.bold = gras
    run.font.size = Pt(taille)


def _entete_repete(ligne) -> None:
    tr_pr = ligne._tr.get_or_add_trPr()
    marque = OxmlElement("w:tblHeader")
    marque.set(qn("w:val"), "true")
    tr_pr.append(marque)


def _ligne_question_libre(doc, question) -> None:
    type_q = _valeur(question.type_question)
    if type_q == "text":
        doc.add_paragraph(f"{question.texte} : " + "_" * 60)
        return
    doc.add_paragraph(question.texte + (" (plusieurs réponses possibles)" if type_q == "multi_choice" else ""))
    choix = list(getattr(question, "choices", None) or [])
    if choix:
        for c in choix:
            doc.add_paragraph(f"{CASE} {c.label}")
    elif type_q == "boolean":
        doc.add_paragraph(f"{CASE} Oui     {CASE} Non")
    else:
        doc.add_paragraph("   ".join(f"{CASE} {_signe(v)}" for v in protocole_mac.VALEURS))


def generer_docx(enquete) -> bytes:
    """
    Construit le questionnaire papier de l'enquête et renvoie le fichier .docx.
    Lève ValueError si le nombre de propositions n'est pas 10, 15 ou 20.
    """
    propositions = [q for q in enquete.questions if _est_proposition_mac(q)]
    libres = [q for q in enquete.questions if not _est_proposition_mac(q)]
    k = protocole_mac.nombre_par_etape(len(propositions))
    mot = NOMBRE_EN_LETTRES[k]

    doc = Document()
    section = doc.sections[0]
    section.orientation = WD_ORIENT.LANDSCAPE
    section.page_width, section.page_height = Cm(29.7), Cm(21.0)
    for marge in ("left_margin", "right_margin", "top_margin", "bottom_margin"):
        setattr(section, marge, Cm(1.5))
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(10)

    doc.add_heading(enquete.titre, level=1)
    if enquete.description:
        doc.add_paragraph(enquete.description)
    doc.add_paragraph("N° de sujet : ______________        Date : ______________        Enquêteur : ______________")

    # Identification avant le questionnaire, comme dans la passation en ligne
    if libres:
        doc.add_heading("Question d'identification des personnes enquêtées", level=2)
        for question in libres:
            _ligne_question_libre(doc, question)

    doc.add_heading("Consigne", level=2)
    doc.add_paragraph(
        f"Voici {len(propositions)} propositions sur « {enquete.titre} ». "
        f"Lis-les plusieurs fois, attentivement."
    )
    doc.add_paragraph(
        f"Lisez l'ensemble des propositions. Vous allez les classer en quatre temps. "
        f"À chaque temps, cochez exactement {mot} propositions ({k}), parmi celles qui "
        f"n'ont pas encore été cochées."
    )
    for numero, etape in enumerate(protocole_mac.ETAPES, start=1):
        paragraphe = doc.add_paragraph()
        paragraphe.add_run(f"Temps {numero} — « {etape['libelle']} » ({_signe(etape['valeur'])}) : ").bold = True
        paragraphe.add_run(f"cochez {mot} propositions.")
    doc.add_paragraph(
        f"Les {k} propositions qui ne sont cochées à aucun temps reçoivent automatiquement "
        f"la médiane 0 (« ni les plus, ni les moins importantes »)."
    )

    entetes = ["N°", "Proposition"]
    entetes += [
        f"Temps {numero} : {etape['libelle']} ({_signe(etape['valeur'])}) — {k} à cocher"
        for numero, etape in enumerate(protocole_mac.ETAPES, start=1)
    ]
    entetes.append("Valeur finale")

    tableau = doc.add_table(rows=1, cols=len(entetes))
    tableau.style = "Table Grid"
    tableau.alignment = WD_TABLE_ALIGNMENT.CENTER
    tableau.autofit = False
    largeurs = [LARGEURS_CM["numero"], LARGEURS_CM["proposition"]]
    largeurs += [LARGEURS_CM["temps"]] * len(protocole_mac.ETAPES)
    largeurs.append(LARGEURS_CM["finale"])

    for cellule, titre in zip(tableau.rows[0].cells, entetes):
        _ecrire(cellule, titre, taille=8.5, gras=True, centre=True)
        _ombrer(cellule)
    _entete_repete(tableau.rows[0])

    for numero, question in enumerate(propositions, start=1):
        cellules = tableau.add_row().cells
        _ecrire(cellules[0], str(numero), centre=True)
        _ecrire(cellules[1], question.texte)
        for indice in range(len(protocole_mac.ETAPES)):
            _ecrire(cellules[2 + indice], CASE, taille=12, centre=True)
        _ecrire(cellules[-1], "")

    for ligne in tableau.rows:
        for cellule, largeur in zip(ligne.cells, largeurs):
            cellule.width = Cm(largeur)

    doc.add_paragraph()
    doc.add_paragraph(
        f"Contrôle : chaque colonne de temps doit porter exactement {k} coches. "
        f"Reportez dans « Valeur finale » : +2 pour le temps 1, −2 pour le temps 2, "
        f"+1 pour le temps 3, −1 pour le temps 4, 0 pour une proposition jamais cochée."
    )

    tampon = io.BytesIO()
    doc.save(tampon)
    return tampon.getvalue()

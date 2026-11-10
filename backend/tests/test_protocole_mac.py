# backend/tests/test_protocole_mac.py
"""
Tests du protocole MAC en quatre temps et du questionnaire papier Word.
Lancer depuis le dossier backend :  python -m unittest tests.test_protocole_mac
"""
import io
import random
import unittest
from types import SimpleNamespace

from docx import Document

from app import protocole_mac, questionnaire_papier


def _question(texte, part="MANDATORY", type_question="likert", choices=None):
    return SimpleNamespace(texte=texte, part=part, type_question=type_question, choices=choices or [])


def _enquete(nb_propositions, questions_libres=()):
    propositions = [_question(f"Proposition {i:02d}") for i in range(1, nb_propositions + 1)]
    return SimpleNamespace(
        titre="Enquête de test",
        description="Description de test",
        questions=propositions + list(questions_libres),
    )


def _passation_en_quatre_temps(nb_propositions, rng):
    """Simule les quatre temps et renvoie les valeurs attribuées à chaque proposition."""
    k = protocole_mac.nombre_par_etape(nb_propositions)
    restantes = list(range(nb_propositions))
    attribution = {}
    for etape in protocole_mac.ETAPES:
        choisies = rng.sample(restantes, k)
        for i in choisies:
            attribution[i] = etape["valeur"]
        restantes = [i for i in restantes if i not in choisies]
    for i in restantes:
        attribution[i] = protocole_mac.VALEUR_MEDIANE
    return [attribution[i] for i in range(nb_propositions)]


class ProtocoleTemps(unittest.TestCase):
    def test_nombre_par_etape(self):
        self.assertEqual(protocole_mac.nombre_par_etape(10), 2)
        self.assertEqual(protocole_mac.nombre_par_etape(15), 3)
        self.assertEqual(protocole_mac.nombre_par_etape(20), 4)
        with self.assertRaises(ValueError):
            protocole_mac.nombre_par_etape(12)

    def test_quatre_temps_dans_l_ordre_du_protocole(self):
        valeurs = [etape["valeur"] for etape in protocole_mac.ETAPES]
        self.assertEqual(valeurs, [2, -2, 1, -1])
        self.assertEqual(protocole_mac.VALEUR_MEDIANE, 0)

    def test_passation_simulee_respecte_le_protocole(self):
        rng = random.Random(42)
        for taille in (10, 15, 20):
            for _ in range(200):
                valeurs = _passation_en_quatre_temps(taille, rng)
                protocole_mac.verifier_distribution(valeurs)  # ne doit pas lever

    def test_distribution_exacte_acceptee(self):
        protocole_mac.verifier_distribution([2, 2, -2, -2, 1, 1, -1, -1, 0, 0])

    def test_distribution_avec_une_valeur_manquante_refusee(self):
        with self.assertRaises(ValueError):
            protocole_mac.verifier_distribution([2, 2, -2, -2, 1, 1, -1, -1, 0, 2])

    def test_valeur_hors_echelle_refusee(self):
        with self.assertRaises(ValueError):
            protocole_mac.verifier_distribution([3, 2, -2, -2, 1, 1, -1, -1, 0, 0])

    def test_taille_invalide_refusee(self):
        with self.assertRaises(ValueError):
            protocole_mac.verifier_distribution([0] * 12)


class QuestionnairePapierWord(unittest.TestCase):
    def test_document_contient_quatre_temps_et_une_ligne_par_proposition(self):
        contenu = questionnaire_papier.generer_docx(_enquete(10))
        self.assertTrue(contenu.startswith(b"PK"))  # un .docx est une archive zip
        document = Document(io.BytesIO(contenu))
        tableau = document.tables[0]
        self.assertEqual(len(tableau.rows), 11)  # en-tête + 10 propositions
        self.assertEqual(len(tableau.columns), 7)  # N°, proposition, 4 temps, valeur finale
        texte = "\n".join(p.text for p in document.paragraphs)
        for etape in protocole_mac.ETAPES:
            self.assertIn(etape["libelle"], texte)
        self.assertIn("deux propositions", texte)

    def test_taille_15_et_20(self):
        for taille, mot in ((15, "trois propositions"), (20, "quatre propositions")):
            document = Document(io.BytesIO(questionnaire_papier.generer_docx(_enquete(taille))))
            self.assertEqual(len(document.tables[0].rows), taille + 1)
            self.assertIn(mot, "\n".join(p.text for p in document.paragraphs))

    def test_questions_libres_en_fin_de_document(self):
        libres = [
            _question("Pays", part="OPTIONAL", type_question="text"),
            _question(
                "Sexe",
                part="OPTIONAL",
                type_question="single_choice",
                choices=[SimpleNamespace(label="Femme"), SimpleNamespace(label="Homme")],
            ),
        ]
        document = Document(io.BytesIO(questionnaire_papier.generer_docx(_enquete(10, libres))))
        texte = "\n".join(p.text for p in document.paragraphs)
        self.assertIn("Informations complémentaires", texte)
        self.assertIn("Pays :", texte)
        self.assertIn("Femme", texte)

    def test_taille_invalide_refusee(self):
        with self.assertRaises(ValueError):
            questionnaire_papier.generer_docx(_enquete(12))


if __name__ == "__main__":
    unittest.main()

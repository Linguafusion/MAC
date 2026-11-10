// frontend/src/pages/QuestionnairePapier.jsx
// Questionnaire papier imprimable (pour les terrains sans connexion ni ordinateur).
// Même structure que la passation en ligne : quatre temps, même libellés.
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import {
  ETAPES_MAC,
  LIBELLE_MEDIANE,
  NOMBRE_EN_LETTRES,
  nombreParEtape,
} from "../services/protocoleMac";

const CASE = "☐"; // ☐
const VALEURS_LIBRES = [-2, -1, 0, 1, 2];

const estProposition = (q) => q.part === "MANDATORY" && q.type_question === "likert";
const signe = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0");

export default function QuestionnairePapier() {
  const { id } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [erreur, setErreur] = useState("");
  const [telechargement, setTelechargement] = useState(false);

  useEffect(() => {
    let actif = true;
    api
      .get(`/enquetes/${id}`)
      .then((res) => {
        if (actif) setEnquete(res.data);
      })
      .catch(() => {
        if (actif) setErreur("Enquête introuvable.");
      });
    return () => {
      actif = false;
    };
  }, [id]);

  const telechargerWord = async () => {
    setTelechargement(true);
    setErreur("");
    try {
      const res = await api.get(`/enquetes/${id}/questionnaire-papier.docx`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `questionnaire_papier_${id}.docx`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErreur("Impossible de générer le fichier Word pour cette enquête.");
    } finally {
      setTelechargement(false);
    }
  };

  if (!enquete && erreur)
    return <div className="p-10 text-center text-red-600 dark:text-red-400">{erreur}</div>;

  if (!enquete)
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );

  const propositions = enquete.questions.filter(estProposition);
  const libres = enquete.questions.filter((q) => !estProposition(q));
  const k = nombreParEtape(propositions.length);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 print:max-w-none print:p-0 text-gray-900 dark:text-gray-100">
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <Link
          to="/enquetes"
          className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        >
          ← Retour aux enquêtes
        </Link>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={k === null}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            Imprimer / PDF
          </button>
          <button
            type="button"
            onClick={telechargerWord}
            disabled={k === null || telechargement}
            className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
          >
            {telechargement ? "Génération…" : "Télécharger en Word (.docx)"}
          </button>
        </div>
      </div>

      <p className="print:hidden mb-6 text-sm text-gray-600 dark:text-gray-300">
        Pour un PDF, choisissez « Enregistrer au format PDF » comme destination dans la fenêtre
        d'impression.
      </p>

      {k === null && (
        <div className="print:hidden mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 text-sm">
          Ce questionnaire doit comporter 10, 15 ou 20 propositions obligatoires : le questionnaire
          papier ne peut pas être généré.
        </div>
      )}

      {erreur && (
        <div className="print:hidden mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 text-sm">
          {erreur}
        </div>
      )}

      {k !== null && (
        <article className="bg-white text-gray-900 rounded-2xl border border-gray-200 shadow-sm p-8 print:shadow-none print:border-0 print:rounded-none print:p-0 print:text-black">
          <header>
            <h1 className="text-2xl font-bold">{enquete.titre}</h1>
            {enquete.description && (
              <p className="mt-2 text-sm text-gray-700">{enquete.description}</p>
            )}
            <p className="mt-4 text-sm">
              N° de sujet : ____________________ &nbsp;&nbsp; Date : ______________ &nbsp;&nbsp;
              Enquêteur : ____________________
            </p>
          </header>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">Consigne</h2>
            <p className="mt-2 text-sm">
              Lisez l'ensemble des propositions. Vous allez les classer en quatre temps. À chaque
              temps, cochez exactement{" "}
              <strong>
                {NOMBRE_EN_LETTRES[k]} propositions ({k})
              </strong>
              , parmi celles qui n'ont pas encore été cochées.
            </p>
            <ol className="mt-3 space-y-1 text-sm">
              {ETAPES_MAC.map((etape, i) => (
                <li key={etape.valeur}>
                  <strong>
                    Temps {i + 1} — « {etape.libelle} » ({etape.signe})
                  </strong>{" "}
                  : cochez {NOMBRE_EN_LETTRES[k]} propositions.
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm">
              Les {k} propositions qui ne sont cochées à aucun temps reçoivent automatiquement la
              médiane 0 ({LIBELLE_MEDIANE}).
            </p>
          </section>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-2 w-12">N°</th>
                  <th className="border border-gray-400 px-3 py-2 text-left">Proposition</th>
                  {ETAPES_MAC.map((etape, i) => (
                    <th key={etape.valeur} className="border border-gray-400 px-2 py-2 min-w-[9rem] text-center">
                      <div className="font-semibold">
                        Temps {i + 1} · {etape.signe}
                      </div>
                      <div className="font-normal text-xs">{etape.libelle}</div>
                      <div className="font-normal text-xs">{k} à cocher</div>
                    </th>
                  ))}
                  <th className="border border-gray-400 px-2 py-2 w-28 text-center">Valeur finale</th>
                </tr>
              </thead>
              <tbody>
                {propositions.map((q, index) => (
                  <tr key={q.id} className="break-inside-avoid">
                    <td className="border border-gray-400 px-2 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-400 px-3 py-2">{q.texte}</td>
                    {ETAPES_MAC.map((etape) => (
                      <td key={etape.valeur} className="border border-gray-400 px-2 py-2 text-center text-lg">
                        {CASE}
                      </td>
                    ))}
                    <td className="border border-gray-400 px-2 py-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm">
            Contrôle : chaque colonne de temps doit porter exactement {k} coches. Reportez dans «
            Valeur finale » : +2 pour le temps 1, −2 pour le temps 2, +1 pour le temps 3, −1 pour le
            temps 4, 0 pour une proposition jamais cochée.
          </p>

          {libres.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Informations complémentaires</h2>
              {libres.map((q) => (
                <div key={q.id} className="mt-4 text-sm break-inside-avoid">
                  {q.type_question === "text" && (
                    <p>
                      {q.texte} : ______________________________________________
                    </p>
                  )}
                  {q.type_question !== "text" && (
                    <>
                      <p className="font-medium">
                        {q.texte}
                        {q.type_question === "multi_choice" && " (plusieurs réponses possibles)"}
                      </p>
                      {(q.choices || []).length > 0 ? (
                        (q.choices || []).map((c) => (
                          <p key={c.id} className="ml-4">
                            {CASE} {c.label}
                          </p>
                        ))
                      ) : q.type_question === "boolean" ? (
                        <p className="ml-4">
                          {CASE} Oui &nbsp;&nbsp;&nbsp; {CASE} Non
                        </p>
                      ) : (
                        <p className="ml-4">
                          {VALEURS_LIBRES.map((v) => `${CASE} ${signe(v)}`).join("   ")}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </section>
          )}
        </article>
      )}
    </div>
  );
}

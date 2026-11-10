// frontend/src/pages/PublicSurvey.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ETAPES_MAC,
  LIBELLE_MEDIANE,
  NOMBRE_EN_LETTRES,
  VALEUR_MEDIANE,
  nombreParEtape,
} from "../services/protocoleMac";

// Valeurs proposées pour une question Likert complémentaire (hors protocole MAC)
const VALEURS_LIBRES = [-2, -1, 0, 1, 2];

const formaterErreur = (err) => {
  const detail = err?.response?.data?.detail;
  return typeof detail === "string" ? detail : err?.message || "Erreur lors de l'envoi.";
};

export default function PublicSurvey() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Mode saisie papier (ouvert depuis la liste des enquêtes par un enquêteur)
  const modePapier = searchParams.get("mode") === "papier";

  const [enquete, setEnquete] = useState(null);
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  // Temps en cours : 0 à 3 pour les quatre temps, 4 pour le récapitulatif
  const [temps, setTemps] = useState(0);
  // Propositions cochées pendant le temps en cours (indices dans enquete.questions)
  const [selection, setSelection] = useState([]);
  // Valeur attribuée à chaque proposition, une fois son temps validé (indice -> valeur)
  const [classement, setClassement] = useState({});
  // Réponses aux questions complémentaires (texte, oui/non, choix)
  const [reponsesLibres, setReponsesLibres] = useState({});
  // Identification (questions complémentaires) remplie avant le classement
  const [identificationOk, setIdentificationOk] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/enquetes/public/${token}`);
        setEnquete(res.data);
      } catch {
        setMessage("Ce lien d'enquête est invalide ou a expiré.");
      }
    };
    load();
  }, [token]);

  if (!enquete)
    return (
      <div className="flex items-center justify-center p-20 transition-colors">
        {message ? (
          <div className="text-red-500 font-medium text-lg">{message}</div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            <span className="text-gray-500 dark:text-gray-400">
              Chargement de l'enquête...
            </span>
          </div>
        )}
      </div>
    );

  // Propositions obligatoires : ce sont elles qui font l'objet du classement en quatre temps
  const questions = enquete.questions;
  const indicesMac = questions.reduce((acc, q, i) => {
    if (q.part === "MANDATORY" && q.type_question === "likert") acc.push(i);
    return acc;
  }, []);
  const indicesLibres = questions.map((_, i) => i).filter((i) => !indicesMac.includes(i));
  const nbPropositions = indicesMac.length;
  const k = nbPropositions > 0 ? nombreParEtape(nbPropositions) : null;
  const protocoleOk = nbPropositions === 0 || k !== null;
  // Propositions qui n'ont pas encore reçu de valeur
  const restantes = indicesMac.filter((i) => classement[i] === undefined);
  const toutClasse = restantes.length === 0;
  const enRecapitulatif = nbPropositions === 0 || temps >= ETAPES_MAC.length;
  const etapeCourante = !enRecapitulatif ? ETAPES_MAC[temps] : null;
  // Identification d'abord, puis le classement (procédure MAC, étape 2)
  const enIdentification = protocoleOk && nbPropositions > 0 && indicesLibres.length > 0 && !identificationOk;

  const libresObligatoiresOk = indicesLibres.every((i) => {
    const q = questions[i];
    if (q.part !== "MANDATORY") return true;
    const ans = reponsesLibres[i];
    if (q.type_question === "multi_choice") return Array.isArray(ans) && ans.length > 0;
    return ans !== undefined && ans !== null && ans !== "";
  });

  const peutEnvoyer =
    protocoleOk && enRecapitulatif && toutClasse && libresObligatoiresOk && !envoi;

  // --- Temps du protocole -------------------------------------------------

  // Cocher ou décocher une proposition ; impossible d'en cocher plus que le nombre exact
  const basculerProposition = (i) => {
    setSelection((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= k) return prev;
      return [...prev, i];
    });
  };

  const validerTemps = () => {
    if (!etapeCourante || selection.length !== k) return;
    const dernierTemps = temps === ETAPES_MAC.length - 1;
    setClassement((prev) => {
      const suivant = { ...prev };
      selection.forEach((i) => {
        suivant[i] = etapeCourante.valeur;
      });
      // Après le quatrième temps, les propositions restantes reçoivent la médiane 0
      if (dernierTemps) {
        restantes.forEach((i) => {
          if (!selection.includes(i)) suivant[i] = VALEUR_MEDIANE;
        });
      }
      return suivant;
    });
    setSelection([]);
    setMessage("");
    setTemps((t) => t + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const recommencer = () => {
    setClassement({});
    setSelection([]);
    setTemps(0);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Questions complémentaires -----------------------------------------

  const modifierLibre = (i, valeur) => {
    setReponsesLibres((prev) => ({ ...prev, [i]: valeur }));
  };

  const basculerChoixMultiple = (i, choiceId, coche) => {
    setReponsesLibres((prev) => {
      const actuel = prev[i] || [];
      return {
        ...prev,
        [i]: coche ? [...actuel, choiceId] : actuel.filter((id) => id !== choiceId),
      };
    });
  };

  // --- Envoi --------------------------------------------------------------

  const envoyer = async () => {
    if (!peutEnvoyer) {
      setMessage(
        "Veuillez terminer les quatre temps et répondre aux questions obligatoires avant d'envoyer."
      );
      return;
    }
    setMessage("");
    setEnvoi(true);

    const payload = [];
    questions.forEach((q, index) => {
      if (indicesMac.includes(index)) {
        payload.push({ question_id: q.id, value: classement[index] });
        return;
      }
      const ans = reponsesLibres[index];
      if (q.type_question === "text") {
        if (ans) payload.push({ question_id: q.id, text_value: ans });
      } else if (q.type_question === "likert") {
        if (ans !== undefined && ans !== null) payload.push({ question_id: q.id, value: ans });
      } else if (q.type_question === "single_choice" || q.type_question === "boolean") {
        if (ans !== undefined && ans !== null) payload.push({ question_id: q.id, choice_id: ans });
      } else if (q.type_question === "multi_choice") {
        if (Array.isArray(ans)) {
          ans.forEach((choiceId) => payload.push({ question_id: q.id, choice_id: choiceId }));
        }
      }
    });

    try {
      await api.post(`/enquetes/public/${token}/submit`, { answers: payload });
      // En saisie papier, on revient à la liste pour enchaîner avec le sujet suivant
      navigate(modePapier ? "/enquetes" : "/merci");
    } catch (err) {
      setMessage(formaterErreur(err));
      setEnvoi(false);
    }
  };

  // --- Affichage ----------------------------------------------------------

  const renderParcours = () => (
    <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-8" aria-label="Déroulement du classement">
      {ETAPES_MAC.map((etape, i) => {
        const etat = i < temps ? "fait" : i === temps ? "courant" : "attente";
        const classes = {
          fait: "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-200",
          courant: "bg-indigo-600 border-indigo-600 text-white shadow-md",
          attente: "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400",
        }[etat];
        return (
          <li key={etape.valeur} className={`rounded-lg border px-3 py-2 text-sm font-medium ${classes}`}>
            <span className="block text-xs opacity-80">
              Temps {i + 1} · {etape.signe}
              {etat === "fait" && " ✓"}
            </span>
            {etape.libelle}
          </li>
        );
      })}
      <li
        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
          enRecapitulatif
            ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
            : "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
        }`}
      >
        <span className="block text-xs opacity-80">Fin</span>
        Récapitulatif
      </li>
    </ol>
  );

  const renderConsigne = () => (
    <div className="mb-8 rounded-2xl bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 shadow-xl text-white">
      <h4 className="text-xl font-bold mb-2 text-white tracking-wide drop-shadow-sm">
        Classement en quatre temps
      </h4>
      <div className="text-indigo-50 text-base space-y-3 font-medium">
        <p>
          Lisez les propositions, puis, à chaque temps, cochez le nombre exact de propositions
          demandé parmi celles qui n'ont pas encore été choisies. Un temps validé ne peut plus
          être modifié : pour corriger, utilisez « Recommencer ».
        </p>
        <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
          À chaque temps, vous choisissez
          <strong className="text-white mx-1.5 text-lg underline decoration-pink-400 decoration-2 underline-offset-2">
            {NOMBRE_EN_LETTRES[k]} ({k})
          </strong>
          propositions. Les propositions qui restent à la fin reçoivent automatiquement la médiane
          0, « ni les plus, ni les moins importantes ».
        </div>
      </div>
    </div>
  );

  const renderEtape = () => {
    const complet = selection.length === k;
    return (
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Temps {temps + 1} sur {ETAPES_MAC.length} · valeur {etapeCourante.signe}
          </p>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {etapeCourante.libelle}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Cochez exactement <strong>{NOMBRE_EN_LETTRES[k]} propositions</strong> parmi les{" "}
            {restantes.length} encore disponibles.
          </p>
        </header>

        <ul className="p-6 space-y-2">
          {restantes.map((i) => {
            const coche = selection.includes(i);
            const bloquee = !coche && selection.length >= k;
            return (
              <li key={questions[i].id}>
                <button
                  type="button"
                  onClick={() => basculerProposition(i)}
                  disabled={bloquee}
                  aria-pressed={coche}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-all ${
                    coche
                      ? "bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-600"
                      : bloquee
                      ? "opacity-50 cursor-not-allowed border-gray-100 dark:border-gray-700"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                      coche
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-400 dark:border-gray-500"
                    }`}
                  >
                    {coche && "✓"}
                  </span>
                  <span className="text-gray-800 dark:text-gray-100">{questions[i].texte}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="px-6 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span
            className={`text-sm font-semibold ${
              complet
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            Sélectionnées : {selection.length} / {k}
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={recommencer}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Recommencer
            </button>
            <button
              type="button"
              onClick={validerTemps}
              disabled={!complet}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                complet
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              Valider ce temps
            </button>
          </div>
        </footer>
      </section>
    );
  };

  const renderRecapitulatif = () => (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Récapitulatif de vos choix</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Vérifiez votre classement. Pour le modifier, utilisez « Recommencer ».
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...ETAPES_MAC, { valeur: VALEUR_MEDIANE, libelle: LIBELLE_MEDIANE, signe: "0" }].map(
          (groupe) => {
            const items = indicesMac.filter((i) => classement[i] === groupe.valeur);
            return (
              <div
                key={groupe.valeur}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex justify-between items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">{groupe.libelle}</h4>
                  <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 whitespace-nowrap">
                    {groupe.signe} · {items.length}
                  </span>
                </div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                  {items.map((i) => (
                    <li key={questions[i].id}>{questions[i].texte}</li>
                  ))}
                </ul>
              </div>
            );
          }
        )}
      </div>
    </section>
  );

  const renderQuestionLibre = (index) => {
    const q = questions[index];
    const ans = reponsesLibres[index];
    const obligatoire = q.part === "MANDATORY";
    return (
      <div
        key={q.id}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex justify-between items-start gap-4">
          <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">{q.texte}</h4>
          {obligatoire && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 whitespace-nowrap">
              Obligatoire
            </span>
          )}
        </div>

        <div className="p-6">
          {q.type_question === "text" && (
            <textarea
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y min-h-[100px]"
              placeholder="Votre réponse ici..."
              value={ans || ""}
              onChange={(e) => modifierLibre(index, e.target.value)}
            />
          )}

          {q.type_question === "likert" && (
            <div className="space-y-2">
              {VALEURS_LIBRES.map((v) => (
                <label
                  key={v}
                  className="flex items-center p-3 rounded-lg cursor-pointer border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <input
                    type="radio"
                    name={`q${index}`}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600"
                    checked={ans === v}
                    onChange={() => modifierLibre(index, v)}
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">
                    {v > 0 ? `+${v}` : v}
                  </span>
                </label>
              ))}
            </div>
          )}

          {(q.type_question === "single_choice" || q.type_question === "boolean") && (
            <div className="space-y-2">
              {(q.choices || []).map((c) => (
                <label
                  key={c.id}
                  className="flex items-center p-3 rounded-lg cursor-pointer border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <input
                    type="radio"
                    name={`q${index}`}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600"
                    checked={ans === c.id}
                    onChange={() => modifierLibre(index, c.id)}
                  />
                  <span className="ml-3 text-gray-700 dark:text-gray-300">{c.label}</span>
                </label>
              ))}
            </div>
          )}

          {q.type_question === "multi_choice" && (
            <div className="space-y-2">
              {(q.choices || []).map((c) => {
                const coche = (ans || []).includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center p-3 rounded-lg cursor-pointer border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-600"
                      checked={coche}
                      onChange={(e) => basculerChoixMultiple(index, c.id, e.target.checked)}
                    />
                    <span className="ml-3 text-gray-700 dark:text-gray-300">{c.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const commencerClassement = () => {
    if (!libresObligatoiresOk) return;
    setIdentificationOk(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderIdentification = () => (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Identification</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Ces informations sont demandées avant le classement. Elles servent aux tris de l'analyse.
        </p>
      </div>
      {indicesLibres.map((i) => renderQuestionLibre(i))}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={commencerClassement}
          disabled={!libresObligatoiresOk}
          className={`w-full md:w-auto px-10 py-3 rounded-xl text-base font-bold shadow transition-all ${
            libresObligatoiresOk
              ? "bg-linear-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          Commencer le classement
        </button>
      </div>
    </section>
  );

  return (
    <div className="w-full text-gray-900 dark:text-gray-100 font-sans py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 mb-4">
            {enquete.titre}
          </h1>
          <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            {enquete.description}
          </p>
        </div>

        {modePapier && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200 text-sm">
            <strong>Mode saisie papier.</strong> Reportez ici, temps par temps, les choix de la
            feuille papier du sujet, puis envoyez. Chaque envoi crée une réponse distincte,
            traitée comme une réponse en ligne.
          </div>
        )}

        {!protocoleOk && (
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            Ce questionnaire doit comporter 10, 15 ou 20 propositions obligatoires.
          </div>
        )}

        {protocoleOk && enIdentification && renderIdentification()}

        {protocoleOk && nbPropositions > 0 && !enIdentification && renderParcours()}

        {protocoleOk && !enRecapitulatif && !enIdentification && (
          <>
            {renderConsigne()}
            {renderEtape()}
          </>
        )}

        {protocoleOk && enRecapitulatif && (
          <div className="space-y-8">
            {nbPropositions > 0 && renderRecapitulatif()}

            {nbPropositions === 0 && indicesLibres.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Informations complémentaires
                </h3>
                {indicesLibres.map((i) => renderQuestionLibre(i))}
              </section>
            )}
          </div>
        )}

        {/* Envoi */}
        {protocoleOk && enRecapitulatif && (
          <div className="mt-10 pb-20 text-center">
            {message && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg">
                {message}
              </div>
            )}

            {nbPropositions > 0 && (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={recommencer}
                  className="text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 underline underline-offset-2"
                >
                  Recommencer le classement
                </button>
              </div>
            )}

            <button
              onClick={envoyer}
              disabled={!peutEnvoyer}
              className={`w-full md:w-auto px-10 py-4 rounded-xl text-lg font-bold shadow-lg transition-all transform ${
                peutEnvoyer
                  ? "bg-linear-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-blue-700"
                  : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              {envoi ? "Envoi en cours…" : "Envoyer mes réponses"}
            </button>
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
              L'envoi n'est possible qu'une fois les quatre temps validés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

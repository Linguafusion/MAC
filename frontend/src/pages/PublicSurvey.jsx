// frontend/src/pages/PublicSurvey.jsx
import React, { useEffect, useState, Fragment } from "react";
import api from "../services/api";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

// Valeurs métier Likert : -2, -1, 0, 1, 2
const LIKERT_CHOICES = [
  { label: "Pas du tout d'accord", value: -2 },
  { label: "Pas d'accord", value: -1 },
  { label: "Neutre", value: 0 },
  { label: "D'accord", value: 1 },
  { label: "Tout à fait d'accord", value: 2 },
];

export default function PublicSurvey() {
  const { token } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [rankHistory, setRankHistory] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Mode saisie papier (ouvert depuis la liste des enquêtes par un enquêteur)
  const modePapier = searchParams.get("mode") === "papier";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/enquetes/public/${token}`);
        setEnquete(res.data);
      } catch (err) {
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

  // Nombre de questions Likert obligatoires
  const mandatoryLikertCount = enquete.questions.filter(
    (q) => q.part === "MANDATORY" && q.type_question === "likert"
  ).length;

  const perValueMap = { 10: 2, 15: 3, 20: 4 };
  const perValue = perValueMap[mandatoryLikertCount] || null;

  const perValueWordMap = { 2: "DEUX", 3: "TROIS", 4: "QUATRE" };
  const perValueWord = perValue ? perValueWordMap[perValue] : null;

  // Classement MAC : 5 étapes successives (+2, -2, +1, -1, 0).
  // Actif seulement si le nombre d'items obligatoires vaut 10, 15 ou 20.
  const RANK_STEPS = [2, -2, 1, -1, 0];
  const RANK_LABELS = {
    2: { title: "les plus importants", text: "Tout à fait d'accord" },
    "-2": { title: "les moins importants", text: "Pas du tout d'accord" },
    1: { title: "les plus importants parmi les restants", text: "D'accord" },
    "-1": { title: "les moins importants parmi les restants", text: "Pas d'accord" },
    0: { title: "les propositions restantes", text: "Neutre" },
  };
  const rankingEnabled = perValue !== null;
  const rankingIndices = enquete.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => q.part === "MANDATORY" && q.type_question === "likert")
    .map(({ i }) => i);
  const countFor = (value) =>
    rankingIndices.filter((i) => answers[i] === value).length;
  const currentRankValue =
    rankingEnabled ? RANK_STEPS.find((v) => countFor(v) < perValue) ?? null : null;

  // Helpers
  const handleTextChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleRadioChange = (qIndex, choiceIdOrValue) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIdOrValue }));
  };

  // Assigne la valeur de l'étape courante à un item (classement MAC)
  const assignRank = (qIndex) => {
    if (currentRankValue === null || answers[qIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: currentRankValue }));
    setRankHistory((h) => [...h, qIndex]);
  };

  // Annule la dernière affectation
  const undoRank = () => {
    if (rankHistory.length === 0) return;
    const last = rankHistory[rankHistory.length - 1];
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[last];
      return next;
    });
    setRankHistory((h) => h.slice(0, -1));
  };

  const handleCheckboxChange = (qIndex, choiceId, checked) => {
    setAnswers((prev) => {
      const current = prev[qIndex] || [];
      return {
        ...prev,
        [qIndex]: checked
          ? [...current, choiceId]
          : current.filter((id) => id !== choiceId),
      };
    });
  };

  const canSubmit = () => {
    const mandatoryMeta = enquete.questions
      .map((q, i) => ({ q, index: i }))
      .filter((item) => item.q.part === "MANDATORY");

    return mandatoryMeta.every(({ q, index }) => {
      const ans = answers[index];
      if (q.type_question === "multi_choice") {
        return ans && ans.length > 0;
      }
      return ans !== undefined && ans !== null && ans !== "";
    });
  };

  const submit = async () => {
    setMessage("");

    if (!canSubmit()) {
      setMessage("Veuillez répondre à toutes les questions obligatoires !");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }

    try {
      const answerPayload = [];

      enquete.questions.forEach((q, index) => {
        const ans = answers[index];

        if (q.type_question === "text") {
          if (ans !== undefined && ans !== null && ans !== "") {
            answerPayload.push({
              question_id: q.id,
              text_value: ans,
            });
          }
        } else if (q.type_question === "likert") {
          if (ans !== undefined && ans !== null) {
            answerPayload.push({
              question_id: q.id,
              value: ans,
            });
          }
        } else if (
          q.type_question === "single_choice" ||
          q.type_question === "boolean"
        ) {
          if (ans !== undefined && ans !== null) {
            answerPayload.push({
              question_id: q.id,
              choice_id: ans,
            });
          }
        } else if (q.type_question === "multi_choice") {
          if (Array.isArray(ans) && ans.length > 0) {
            ans.forEach((choiceId) => {
              answerPayload.push({
                question_id: q.id,
                choice_id: choiceId,
              });
            });
          }
        }
      });

      await api.post(`/enquetes/public/${token}/submit`, {
        answers: answerPayload,
      });
      // En saisie papier, on revient à la liste pour enchaîner avec le sujet suivant
      navigate(modePapier ? "/enquetes" : "/merci");
    } catch (err) {
      setMessage(err.response?.data?.detail || err.message);
    }
  };

  // --- UPDATED CONSIGNE COMPONENT ---
  const LikertNotice = () =>
    perValue && perValueWord ? (
      <div className="mb-8 rounded-2xl bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 shadow-xl text-white transform transition-all hover:scale-[1.01]">
        <div className="flex items-start gap-5">
          {/* Icon Box */}
          <div className="shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-xl shadow-inner">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="leading-relaxed grow">
            <h4 className="text-xl font-bold mb-2 text-white tracking-wide drop-shadow-sm">
              Consigne Importante
            </h4>
            <div className="text-indigo-50 text-base space-y-3 font-medium">
              <p>
                Classez les propositions en cinq étapes successives : d’abord
                celles qui vous semblent les plus importantes, puis les moins
                importantes, et ainsi de suite jusqu’aux propositions
                médianes.
              </p>
              <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                Au total, chaque colonne (de <em>"Pas du tout d’accord"</em> à{" "}
                <em>"Tout à fait d’accord"</em>) doit être choisie
                <strong className="text-white mx-1.5 text-lg underline decoration-pink-400 decoration-2 underline-offset-2">
                  {perValueWord} ({perValue})
                </strong>
                fois, sans exception.
              </div>
              <p className="text-sm text-indigo-200 italic flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Astuce : Commencez par les items où votre avis est le plus
                tranché.
              </p>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  // Flag local pour afficher la notice une seule fois
  let likertNoticeRendered = false;
  let rankingRendered = false;

  // Bloc de classement MAC (remplace les items Likert obligatoires)
  const renderRanking = () => (
    <Fragment key="ranking-block">
      <LikertNotice />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {currentRankValue !== null ? (
          <div className="mb-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">
              Étape {RANK_STEPS.indexOf(currentRankValue) + 1} sur 5 :
              choisissez {perValueWord} ({perValue}){" "}
              {RANK_LABELS[currentRankValue].title} (« {RANK_LABELS[currentRankValue].text} »).
            </p>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              Sélectionnés : {countFor(currentRankValue)} / {perValue}
            </p>
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300 font-medium">
            Toutes les propositions sont classées. Vous pouvez envoyer vos réponses.
          </div>
        )}

        <ul className="space-y-2">
          {rankingIndices.map((i) => {
            const q = enquete.questions[i];
            const v = answers[i];
            const assigned = v !== undefined;
            const choice = LIKERT_CHOICES.find((c) => c.value === v);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => assignRank(i)}
                  disabled={assigned || currentRankValue === null}
                  className={`w-full flex items-center justify-between gap-4 text-left p-3 rounded-lg border transition-all ${
                    assigned
                      ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700 cursor-default"
                      : currentRankValue === null
                      ? "border-gray-100 dark:border-gray-700 text-gray-500 cursor-not-allowed"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  }`}
                >
                  <span className="text-gray-800 dark:text-gray-100">{q.texte}</span>
                  {assigned && (
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-600 text-white">
                      {choice?.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={undoRank}
            disabled={rankHistory.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Annuler la dernière sélection
          </button>
        </div>
      </div>
    </Fragment>
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
            <strong>Mode saisie papier.</strong> Reportez ici les choix de la
            feuille papier du sujet, puis envoyez. Chaque envoi crée une
            réponse distincte, traitée comme une réponse en ligne.
          </div>
        )}

        <div className="space-y-6">
          {enquete.questions.map((q, index) => {
            const currentAnswer = answers[index];

            if (
              rankingEnabled &&
              q.part === "MANDATORY" &&
              q.type_question === "likert"
            ) {
              if (rankingRendered) return null;
              rankingRendered = true;
              return renderRanking();
            }

            const isFirstMandatoryLikert =
              q.part === "MANDATORY" &&
              q.type_question === "likert" &&
              !likertNoticeRendered;

            if (isFirstMandatoryLikert) {
              likertNoticeRendered = true;
            }

            return (
              <Fragment key={q.id}>
                {isFirstMandatoryLikert && <LikertNotice />}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  {/* Question Header */}
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex justify-between items-start gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {q.texte}
                    </h3>
                    {q.part === "MANDATORY" && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 whitespace-nowrap">
                        Obligatoire
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    {/* TEXTE */}
                    {q.type_question === "text" && (
                      <textarea
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y min-h-[100px]"
                        placeholder="Votre réponse ici..."
                        value={currentAnswer || ""}
                        onChange={(e) =>
                          handleTextChange(index, e.target.value)
                        }
                      />
                    )}

                    {/* LIKERT */}
                    {q.type_question === "likert" && (
                      <div className="space-y-2">
                        {LIKERT_CHOICES.map((c) => {
                          const isSelected = currentAnswer === c.value;
                          return (
                            <label
                              key={c.value}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                                isSelected
                                  ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700"
                                  : "bg-transparent border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q${index}`}
                                className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-600"
                                checked={isSelected}
                                onChange={() =>
                                  handleRadioChange(index, c.value)
                                }
                              />
                              <span
                                className={`ml-3 text-sm md:text-base ${
                                  isSelected
                                    ? "font-medium text-indigo-900 dark:text-indigo-200"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {c.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* SINGLE CHOICE & BOOLEAN */}
                    {(q.type_question === "single_choice" ||
                      q.type_question === "boolean") && (
                      <div className="space-y-2">
                        {(q.choices || []).map((c) => {
                          const isSelected = currentAnswer === c.id;
                          return (
                            <label
                              key={c.id}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                                isSelected
                                  ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700"
                                  : "bg-transparent border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q${index}`}
                                className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600"
                                checked={isSelected}
                                onChange={() => handleRadioChange(index, c.id)}
                              />
                              <span
                                className={`ml-3 text-sm md:text-base ${
                                  isSelected
                                    ? "font-medium text-blue-900 dark:text-blue-200"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {c.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* MULTI-CHOIX */}
                    {q.type_question === "multi_choice" && (
                      <div className="space-y-2">
                        {(q.choices || []).map((c) => {
                          const isChecked = (currentAnswer || []).includes(
                            c.id
                          );
                          return (
                            <label
                              key={c.id}
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all border ${
                                isChecked
                                  ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700"
                                  : "bg-transparent border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-900 dark:border-gray-600"
                                checked={isChecked}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    index,
                                    c.id,
                                    e.target.checked
                                  )
                                }
                              />
                              <span
                                className={`ml-3 text-sm md:text-base ${
                                  isChecked
                                    ? "font-medium text-purple-900 dark:text-purple-200"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {c.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        {/* Footer / Submit */}
        <div className="mt-10 pb-20 text-center">
          {message && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg animate-bounce-in">
              {message}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!canSubmit()}
            className={`
                w-full md:w-auto px-10 py-4 rounded-xl text-lg font-bold shadow-lg transition-all transform
                ${
                  canSubmit()
                    ? "bg-linear-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-blue-700"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                }
            `}
          >
            Envoyer mes réponses
          </button>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
            Assurez-vous d'avoir répondu à toutes les questions obligatoires
            avant d'envoyer.
          </p>
        </div>
      </div>
    </div>
  );
}

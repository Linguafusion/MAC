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

// Nombre de propositions attendu pour chaque option, selon la taille de la liste MAC
const PER_VALUE_MAP = { 10: 2, 15: 3, 20: 4 };
const PER_VALUE_WORD = { 2: "DEUX", 3: "TROIS", 4: "QUATRE" };

export default function PublicSurvey() {
  const { token } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
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

  // Propositions obligatoires de type Likert (ce sont elles qui font l'objet des quotas)
  const mandatoryLikertIndices = enquete.questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => q.part === "MANDATORY" && q.type_question === "likert")
    .map(({ i }) => i);
  const mandatoryLikertCount = mandatoryLikertIndices.length;
  const perValue = PER_VALUE_MAP[mandatoryLikertCount] ?? null;
  const perValueWord = perValue ? PER_VALUE_WORD[perValue] : null;

  // Nombre de propositions affectées à une option, hors la proposition excluse
  const countFor = (value, excludeIndex = -1) =>
    mandatoryLikertIndices.filter(
      (i) => i !== excludeIndex && answers[i] === value
    ).length;

  // Une option est désactivée quand son quota est atteint par d'autres propositions.
  // La valeur déjà choisie pour la proposition reste toujours sélectionnable.
  const isOptionDisabled = (qIndex, value) =>
    perValue !== null && countFor(value, qIndex) >= perValue;

  const quotasComplete =
    perValue !== null &&
    mandatoryLikertIndices.every((i) => answers[i] !== undefined) &&
    LIKERT_CHOICES.every((c) => countFor(c.value) === perValue);

  // Helpers
  const handleTextChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleRadioChange = (qIndex, choiceIdOrValue) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIdOrValue }));
  };

  const handleLikertChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
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

    const requiredOk = mandatoryMeta.every(({ q, index }) => {
      const ans = answers[index];
      if (q.type_question === "multi_choice") {
        return ans && ans.length > 0;
      }
      return ans !== undefined && ans !== null && ans !== "";
    });

    if (!requiredOk) return false;
    return mandatoryLikertCount === 0 || quotasComplete;
  };

  const submit = async () => {
    setMessage("");

    if (!canSubmit()) {
      setMessage(
        perValue
          ? `Veuillez répondre à toutes les questions obligatoires : chaque option doit être choisie exactement ${perValue} fois.`
          : "Veuillez répondre à toutes les questions obligatoires !"
      );
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

  // Consigne affichée au-dessus du bloc des propositions
  const LikertNotice = () => (
    <div className="mb-8 rounded-2xl bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 p-6 shadow-xl text-white">
      <div className="flex items-start gap-5">
        <div className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-inner">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="leading-relaxed grow">
          <h4 className="text-xl font-bold mb-2 text-white tracking-wide drop-shadow-sm">
            Consigne importante
          </h4>
          <div className="text-indigo-50 text-base space-y-3 font-medium">
            <p>
              Pour chaque proposition, choisissez l'une des cinq options dans le
              menu. Vous pouvez modifier votre choix à tout moment, dans l'ordre
              que vous voulez.
            </p>
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
              Au total, chaque option (de <em>"Pas du tout d'accord"</em> à{" "}
              <em>"Tout à fait d'accord"</em>) doit être choisie
              {perValue && (
                <strong className="text-white mx-1.5 text-lg underline decoration-pink-400 decoration-2 underline-offset-2">
                  {perValueWord} ({perValue})
                </strong>
              )}
              fois, sans exception.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Bloc des propositions obligatoires : un menu par proposition
  const renderLikertBlock = () => (
    <Fragment key="likert-block">
      <LikertNotice />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Vos choix
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 whitespace-nowrap">
            Obligatoire
          </span>
        </div>

        {perValue === null ? (
          <div className="p-6 text-red-600 dark:text-red-300">
            Ce questionnaire doit comporter 10, 15 ou 20 propositions obligatoires.
          </div>
        ) : (
          <>
            <ul className="p-6 space-y-3">
              {mandatoryLikertIndices.map((i) => {
                const q = enquete.questions[i];
                const value = answers[i];
                return (
                  <li
                    key={q.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <span className="text-gray-800 dark:text-gray-100">{q.texte}</span>
                    <select
                      aria-label={q.texte}
                      value={value ?? ""}
                      onChange={(e) => handleLikertChange(i, Number(e.target.value))}
                      className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="" disabled>
                        Choisir…
                      </option>
                      {LIKERT_CHOICES.map((c) => (
                        <option
                          key={c.value}
                          value={c.value}
                          disabled={isOptionDisabled(i, c.value)}
                        >
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </li>
                );
              })}
            </ul>

            {/* Compteurs discrets : chaque option doit atteindre le quota */}
            <div className="px-6 pb-6 flex flex-wrap gap-2 text-xs">
              {LIKERT_CHOICES.map((c) => {
                const n = countFor(c.value);
                const complete = n === perValue;
                return (
                  <span
                    key={c.value}
                    className={`rounded-full px-2.5 py-1 font-medium ${
                      complete
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {c.label} {n}/{perValue}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Fragment>
  );

  let likertBlockRendered = false;

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

            if (q.part === "MANDATORY" && q.type_question === "likert") {
              if (likertBlockRendered) return null;
              likertBlockRendered = true;
              return renderLikertBlock();
            }

            return (
              <Fragment key={q.id}>
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
                        onChange={(e) => handleTextChange(index, e.target.value)}
                      />
                    )}

                    {/* LIKERT (questions optionnelles) */}
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
                                onChange={() => handleRadioChange(index, c.value)}
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
                          const isChecked = (currentAnswer || []).includes(c.id);
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
                                  handleCheckboxChange(index, c.id, e.target.checked)
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
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-lg">
              {message}
            </div>
          )}

          {mandatoryLikertCount > 0 && !quotasComplete && perValue !== null && (
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Il reste à répartir les propositions : chaque option doit être
              choisie exactement {perValue} fois.
            </p>
          )}

          <button
            onClick={submit}
            disabled={!canSubmit()}
            className={`w-full md:w-auto px-10 py-4 rounded-xl text-lg font-bold shadow-lg transition-all transform ${
              canSubmit()
                ? "bg-linear-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow-xl hover:from-indigo-700 hover:to-blue-700"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
            }`}
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

/* eslint-disable no-unused-vars */
// frontend/src/pages/PublicSurvey.jsx
import React, { useEffect, useState, Fragment } from "react";
import api from "../services/api";
import { useNavigate, useParams } from "react-router-dom";

// Valeurs métier Likert : -2, -1, 0, 1, 2
const LIKERT_CHOICES = [
  { label: "Pas du tout d'accord", value: -2 },
  { label: "Pas d'accord",         value: -1 },
  { label: "Neutre",               value: 0 },
  { label: "D'accord",             value: 1 },
  { label: "Tout à fait d'accord", value: 2 },
];

export default function PublicSurvey() {
  const { token } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/enquetes/public/${token}`);
        setEnquete(res.data);
      } catch (err) {
        setMessage("Lien invalide");
      }
    };
    load();
  }, [token]);

  if (!enquete) return <div className="p-6">{message || "Chargement..."}</div>;

  // Nombre de questions Likert obligatoires
  const mandatoryLikertCount = enquete.questions.filter(
    (q) => q.part === "MANDATORY" && q.type_question === "likert"
  ).length;

  const perValueMap = { 10: 2, 15: 3, 20: 4 };
  const perValue = perValueMap[mandatoryLikertCount] || null;

  const perValueWordMap = { 2: "DEUX", 3: "TROIS", 4: "QUATRE" };
  const perValueWord = perValue ? perValueWordMap[perValue] : null;

  // Helpers
  const handleTextChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleRadioChange = (qIndex, choiceIdOrValue) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIdOrValue }));
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

      console.log(
        "PAYLOAD ENVOYÉ =",
        JSON.stringify({ answers: answerPayload }, null, 2)
      );

      await api.post(`/enquetes/public/${token}/submit`, {
        answers: answerPayload,
      });
      navigate("/merci");
    } catch (err) {
      setMessage(err.response?.data?.detail || err.message);
    }
  };

  // Composant de notice réutilisable
  const LikertNotice = () =>
    perValue && perValueWord ? (
      <div className="mb-4 rounded-xl border-l-4 border-indigo-500 bg-indigo-50 px-4 py-3 shadow-sm">
        <div className="flex items-start">
          <div className="mr-3 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white text-sm font-bold">
            !
          </div>
          <div className="text-sm text-indigo-900">
            <p className="font-semibold mb-1">
              Consigne
            </p>
            <p>
              Veuillez choisir, pour chaque item, l’une des cinq options proposées,
              en cochant la case correspondante.
            </p>
            <p className="mt-1">
              Au total, chaque option / colonne (Pas du tout d’accord ; Peu d’accord ;
              Neutre ; Assez d’accord ; Tout à fait d’accord) doit être choisie{" "}
              {perValue} ({perValueWord}) fois, sans exception. Je vous suggère de commencer par choisir deux items par rapport
              {" "}auxquels vous êtes « tout à fait d’accord » et « pas du tout d’accord » pour ensuite sélectionner les autres options.
            </p>
          </div>
        </div>
      </div>
    ) : null;

  // Flag local pour afficher la notice une seule fois, juste avant la première question Likert obligatoire
  let likertNoticeRendered = false;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{enquete.titre}</h1>
      <p className="mb-4">{enquete.description}</p>

      <div className="space-y-4">
        {enquete.questions.map((q, index) => {
          const currentAnswer = answers[index];
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

              <div className="p-4 border rounded">
                <div className="font-medium mb-2">
                  {q.texte}{" "}
                  {q.part === "MANDATORY" && (
                    <span className="text-red-600">(Obligatoire)</span>
                  )}
                </div>

                {/* TEXTE */}
                {q.type_question === "text" && (
                  <textarea
                    className="form-input"
                    value={currentAnswer || ""}
                    onChange={(e) =>
                      handleTextChange(index, e.target.value)
                    }
                  />
                )}

                {/* LIKERT */}
                {q.type_question === "likert" && (
                  <div className="flex flex-col">
                    {LIKERT_CHOICES.map((c) => (
                      <label key={c.value} className="mb-1">
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={currentAnswer === c.value}
                          onChange={() =>
                            handleRadioChange(index, c.value)
                          }
                        />
                        <span className="ml-2">{c.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* SINGLE CHOICE */}
                {q.type_question === "single_choice" && (
                  <div className="flex flex-col">
                    {(q.choices || []).map((c) => (
                      <label key={c.id} className="mb-1">
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={currentAnswer === c.id}
                          onChange={() =>
                            handleRadioChange(index, c.id)
                          }
                        />
                        <span className="ml-2">{c.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* BOOLEAN */}
                {q.type_question === "boolean" && (
                  <div>
                    {(q.choices || []).map((c, i) => (
                      <label key={c.id} className={i === 1 ? "ml-3" : ""}>
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={currentAnswer === c.id}
                          onChange={() =>
                            handleRadioChange(index, c.id)
                          }
                        />{" "}
                        {c.label}
                      </label>
                    ))}
                  </div>
                )}

                {/* MULTI-CHOIX */}
                {q.type_question === "multi_choice" && (
                  <div>
                    {(q.choices || []).map((c) => (
                      <label key={c.id}>
                        <input
                          type="checkbox"
                          checked={(currentAnswer || []).includes(c.id)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              index,
                              c.id,
                              e.target.checked
                            )
                          }
                        />{" "}
                        <span className="ml-2">{c.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>

      <div className="mt-4">
        <button
          onClick={submit}
          className="btn-primary"
          disabled={!canSubmit()}
        >
          Envoyer
        </button>
      </div>

      {message && <div className="mt-4 text-center">{message}</div>}
    </div>
  );
}

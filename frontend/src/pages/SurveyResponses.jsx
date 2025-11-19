// frontend/src/pages/SurveyResponses.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function SurveyResponses() {
  const { id } = useParams(); // id de l'enquête
  const [enquete, setEnquete] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const getLikertLabel = (value) => {
    switch (value) {
      case -2:
        return "Pas du tout d'accord";
      case -1:
        return "Pas d'accord";
      case 0:
        return "Neutre";
      case 1:
        return "D'accord";
      case 2:
        return "Tout à fait d'accord";
      default:
        return "";
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [enqRes, respRes] = await Promise.all([
          api.get(`/enquetes/${id}`),
          api.get(`/enquetes/${id}/responses`),
        ]);
        setEnquete(enqRes.data);
        setResponses(respRes.data);
      } catch (err) {
        setMessage(
          err.response?.data?.detail || "Erreur de chargement des réponses."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Chargement...</div>
    );
  if (!enquete)
    return (
      <div className="p-6 text-center text-red-600">
        {message || "Enquête introuvable."}
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Réponses pour : {enquete.titre}
      </h1>
      <p className="mb-4 text-gray-600">{enquete.description}</p>

      <Link to="/enquetes" className="btn-secondary mb-4 inline-block">
        ← Retour à la liste
      </Link>

      {responses.length === 0 ? (
        <div className="mt-4 text-gray-600">
          Aucune réponse pour cette enquête.
        </div>
      ) : (
        <div className="space-y-6 mt-4">
          {responses.map((r) => {
            // Regrouper les answers par question_id
            const grouped = r.answers.reduce((acc, a) => {
              const key = a.question_id;
              if (!acc[key]) {
                acc[key] = {
                  question_id: a.question_id,
                  question_texte: a.question_texte,
                  type_question: a.type_question,
                  items: [],
                };
              }
              acc[key].items.push(a);
              return acc;
            }, {});
            const groups = Object.values(grouped);

            return (
              <div key={r.id} className="border rounded p-4">
                <div className="mb-2 text-sm text-gray-500">
                  Réponse #{r.id} –{" "}
                  {new Date(r.created_at).toLocaleString()}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-1/2">Question</th>
                      <th className="text-left p-2 w-1/2">Réponse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g) => (
                      <tr
                        key={g.question_id}
                        className="border-b align-top"
                      >
                        <td className="p-2">{g.question_texte}</td>
                        <td className="p-2">
                          {/* TEXTE */}
                          {g.type_question === "text" && (
                            <>{g.items[0].text_value || "—"}</>
                          )}

                          {/* LIKERT : une seule valeur, mais on la formate */}
                          {g.type_question === "likert" &&
                            g.items[0].value !== null &&
                            g.items[0].value !== undefined && (
                              <>
                                {getLikertLabel(g.items[0].value)} (score :{" "}
                                {g.items[0].value})
                              </>
                            )}

                          {/* SINGLE_CHOICE / BOOLEAN : un seul choix */}
                          {(g.type_question === "single_choice" ||
                            g.type_question === "boolean") &&
                            g.items[0].choice_label && (
                              <>{g.items[0].choice_label}</>
                            )}

                          {/* MULTI_CHOICE : plusieurs lignes dans la même cellule */}
                          {g.type_question === "multi_choice" &&
                            g.items.map((a) => (
                              <div key={a.id}>
                                -{" "}
                                {a.choice_label ||
                                  (a.value !== null &&
                                  a.value !== undefined
                                    ? a.value
                                    : "")}
                              </div>
                            ))}

                          {/* Fallback pour non texte sans choice_label mais avec value */}
                          {g.type_question !== "text" &&
                            g.type_question !== "likert" &&
                            g.type_question !== "multi_choice" &&
                            !g.items[0].choice_label &&
                            g.items[0].value !== null &&
                            g.items[0].value !== undefined && (
                              <>{g.items[0].value}</>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <div className="mt-4 text-center text-red-600">{message}</div>
      )}
    </div>
  );
}

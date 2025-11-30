// frontend/src/pages/SurveyResponses.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

// --- Helper Functions ---

// Slightly refined colors for the tags
const getLikertStyle = (value) => {
  switch (value) {
    case -2: return "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
    case -1: return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
    case 0:  return "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case 1:  return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
    case 2:  return "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
    default: return "text-gray-500 border-gray-200";
  }
};

const getLikertLabel = (value) => {
  switch (value) {
    case -2: return "Pas du tout d'accord";
    case -1: return "Pas d'accord";
    case 0:  return "Neutre";
    case 1:  return "D'accord";
    case 2:  return "Tout à fait d'accord";
    default: return "N/A";
  }
};

// --- Answer Display Component ---
const AnswerDisplay = ({ group }) => {
  const { type_question, items } = group;
  const firstItem = items[0];
  if (!firstItem) return <span className="italic text-gray-400 opacity-70">Sans réponse</span>;

  if (type_question === "text") {
    return <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">{firstItem.text_value || "—"}</p>;
  }

  if (type_question === "likert") {
    const val = firstItem.value;
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getLikertStyle(val)}`}
      >
        {getLikertLabel(val)} <span className="ml-1 opacity-70">({val})</span>
      </span>
    );
  }

  if (type_question === "single_choice" || type_question === "boolean") {
    return (
      <span className="font-medium text-indigo-600 dark:text-indigo-400">
        {firstItem.choice_label || firstItem.value || "—"}
      </span>
    );
  }

  if (type_question === "multi_choice") {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
          >
            {item.choice_label || item.value}
          </span>
        ))}
      </div>
    );
  }

  return <span className="text-gray-600 dark:text-gray-300">{firstItem.value}</span>;
};

// --- Main Component ---
export default function SurveyResponses() {
  const { id } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
        setMessage(err.response?.data?.detail || "Erreur de chargement des réponses.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center p-12">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!enquete) return (
    <div className="flex justify-center items-center p-12 text-red-500 font-medium">
      {message || "Enquête introuvable."}
    </div>
  );

  return (
    <div className="w-full p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">

        {/* Navigation Back */}
        <div className="mb-6">
            <Link
                to="/enquetes"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Retour à la liste
            </Link>
        </div>

        {/* Centered Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
            {/* Title: Gradient Blue/Purple */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 mb-6 leading-tight">
                {enquete.titre}
            </h1>

            {/* Description: Visible and readable */}
            <div className="max-w-3xl mx-auto">
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {enquete.description}
                </p>
            </div>

            {/* Stats Badge */}
            <div className="mt-6 flex justify-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Total des réponses : <strong className="text-gray-900 dark:text-white ml-1">{responses.length}</strong>
                    </span>
                </div>
            </div>
        </div>

        {/* Responses Content */}
        {responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune réponse n'a encore été enregistrée.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {responses.map((r, index) => {
              // Group answers by question
              const grouped = r.answers.reduce((acc, ans) => {
                if (!acc[ans.question_id]) acc[ans.question_id] = { ...ans, items: [] };
                acc[ans.question_id].items.push(ans);
                return acc;
              }, {});
              const groups = Object.values(grouped);

              return (
                <div
                  key={r.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Card Header */}
                  <div className="bg-gray-50/50 dark:bg-gray-700/30 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                         <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-md">
                            #{index + 1}
                         </span>
                         <span className="font-mono text-xs text-gray-400">
                            ID: {r.id.toString().slice(0, 8)}...
                         </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {new Date(r.created_at).toLocaleString("fr-FR", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>

                  {/* Card Body - Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold tracking-wider">
                        <tr>
                          <th className="px-6 py-3 w-2/5">Question</th>
                          <th className="px-6 py-3 w-3/5">Réponse donnée</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {groups.map((g) => (
                          <tr key={g.question_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 align-top">
                              {g.question_texte}
                            </td>
                            <td className="px-6 py-4 align-top">
                              <AnswerDisplay group={g} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {message && (
          <div className="fixed bottom-6 right-6 px-6 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/90 dark:border-red-800 dark:text-white shadow-2xl animate-bounce-in">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
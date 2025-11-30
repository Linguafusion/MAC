// frontend/src/pages/SurveyCreate.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

// --- Sub-component: Choices Editor ---
function ChoicesEditor({ choices = [], onChange }) {
  const add = () => onChange([...choices, { label: "", value: 0 }]);
  const update = (i, v) =>
    onChange(choices.map((c, idx) => (idx === i ? { ...c, ...v } : c)));
  const remove = (i) => onChange(choices.filter((_, idx) => idx !== i));

  return (
    <div className="mt-3 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50 space-y-2">
      <h4 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2">
        Options de réponse
      </h4>
      {choices.map((c, i) => (
        <div key={i} className="flex gap-2 items-center animate-fade-in">
          <div className="relative flex-grow">
             <span className="absolute left-3 top-2.5 text-gray-400 text-xs">Label</span>
             <input
                value={c.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Ex: Oui, Non..."
                className="w-full pl-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
            />
          </div>
          
          <div className="relative w-24">
             <span className="absolute left-2 top-2.5 text-gray-400 text-xs">Val</span>
             <input
                type="number"
                value={c.value}
                onChange={(e) =>
                update(i, { value: parseInt(e.target.value || 0, 10) })
                }
                className="w-full pl-8 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Supprimer l'option"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={add} 
        className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
        Ajouter un choix
      </button>
    </div>
  );
}

// --- Main Component ---
export default function SurveyCreate() {
  const navigate = useNavigate();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [optionalQs, setOptionalQs] = useState([
    { texte: "", type_question: "text", is_required: false, choices: [] },
  ]);
  
  // Partie obligatoire : par défaut 10 questions
  const [mandatoryQs, setMandatoryQs] = useState(
    Array.from({ length: 10 }, (_, i) => ({ texte: `Question ${i + 1}` }))
  );
  const [mandatoryCount, setMandatoryCount] = useState(10);
  const [error, setError] = useState("");

  const addOptional = () =>
    setOptionalQs((prev) => [
      ...prev,
      { texte: "", type_question: "text", is_required: false, choices: [] },
    ]);

  const updateOptional = (i, changes) =>
    setOptionalQs((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, ...changes } : q))
    );

  const removeOptional = (i) =>
    setOptionalQs((prev) => prev.filter((_, idx) => idx !== i));

  // Changement 10 / 15 / 20 questions obligatoires
  const handleMandatoryCount = (n) => {
    setMandatoryCount(n);
    setMandatoryQs(
      Array.from({ length: n }, (_, i) => ({ texte: `Question ${i + 1}` }))
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const questions = [
        // partie optionnelle
        ...optionalQs.map((q) => {
          let obj = {
            texte: q.texte,
            type_question: q.type_question,
            part: "OPTIONAL",
            is_required: q.is_required ?? false,
          };

          if (
            obj.type_question === "single_choice" ||
            obj.type_question === "multi_choice"
          ) {
            obj.choices = q.choices ?? [];
          }

          if (obj.type_question === "boolean") {
            obj.choices =
              q.choices && q.choices.length > 0
                ? q.choices
                : [
                    { label: "Vrai", value: 1 },
                    { label: "Faux", value: 0 },
                  ];
          }

          return obj;
        }),

        // partie obligatoire
        ...mandatoryQs.map((q) => ({
          ...q,
          part: "MANDATORY",
          type_question: "likert",
          is_required: true,
        })),
      ];

      const payload = {
        titre,
        description,
        taille_liste: mandatoryCount,
        rang_ponderation: true,
        questions,
      };

      await api.post("/enquetes/", payload);
      navigate("/enquetes");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="w-full p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
            <Link
                to="/enquetes"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors mb-4"
            >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Retour
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                Créer une enquête
            </h1>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded shadow-sm">
                {error}
            </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          
          {/* CARD 1: General Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Informations Générales
             </h2>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre de l'enquête</label>
                    <input
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        placeholder="Titre"
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description de l'objectif de l'enquête..."
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                    />
                </div>
             </div>
          </div>

          {/* CARD 2: Optional Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Questions Personnalisées
                </h2>
             </div>
             
             <div className="space-y-4">
                {optionalQs.map((q, i) => (
                    <div key={i} className="group bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                        <div className="flex flex-col md:flex-row gap-3 mb-3">
                            <div className="flex-grow">
                                <input
                                    value={q.texte}
                                    onChange={(e) => updateOptional(i, { texte: e.target.value })}
                                    placeholder={`Intitulé de la question ${i + 1}`}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select
                                    value={q.type_question}
                                    onChange={(e) => updateOptional(i, { type_question: e.target.value })}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white"
                                >
                                    <option value="text">Texte libre</option>
                                    <option value="boolean">Oui / Non</option>
                                    <option value="single_choice">Choix unique</option>
                                    <option value="multi_choice">Choix multiple</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeOptional(i)}
                                className="p-2 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:shadow-sm transition-all"
                                title="Supprimer la question"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                id={`req-${i}`}
                                checked={q.is_required}
                                onChange={(e) => updateOptional(i, { is_required: e.target.checked })}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                            />
                            <label htmlFor={`req-${i}`} className="select-none cursor-pointer">Réponse obligatoire</label>
                        </div>

                        {/* Conditional Choice Editor */}
                        {(q.type_question === "single_choice" || q.type_question === "multi_choice") && (
                            <ChoicesEditor
                                choices={q.choices}
                                onChange={(c) => updateOptional(i, { choices: c })}
                            />
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addOptional}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 font-medium hover:border-purple-500 hover:text-purple-500 dark:hover:border-purple-400 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Ajouter une question
                </button>
             </div>
          </div>

          {/* CARD 3: Mandatory Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                    Questions Standard (Likert)
                 </h2>

                 <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                    {[10, 15, 20].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => handleMandatoryCount(num)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                                mandatoryCount === num 
                                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                 </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
                {mandatoryQs.map((q, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400 w-6 text-right">{i + 1}.</span>
                        <input
                            value={q.texte}
                            onChange={(e) => {
                                const newArr = [...mandatoryQs];
                                newArr[i].texte = e.target.value;
                                setMandatoryQs(newArr);
                            }}
                            className="flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all"
                        />
                    </div>
                ))}
             </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 pb-10">
            <button 
                type="submit" 
                className="px-8 py-3 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
                Créer l'enquête
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
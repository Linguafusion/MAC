// frontend/src/pages/SurveyEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

// Editeur de choix réutilisable
function ChoicesEditor({ choices = [], onChange }) {
  const add = () => onChange([...choices, { label: "", value: 0 }]);
  const update = (i, v) =>
    onChange(choices.map((c, idx) => (idx === i ? { ...c, ...v } : c)));
  const remove = (i) => onChange(choices.filter((_, idx) => idx !== i));

  return (
    <div>
      {choices.map((c, i) => (
        <div key={i} className="flex gap-2 items-center mb-1">
          <input
            value={c.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Libellé"
            className="form-input"
          />
          <input
            type="number"
            value={c.value}
            onChange={(e) =>
              update(i, { value: parseInt(e.target.value || 0, 10) })
            }
            className="form-input w-20"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="btn-danger"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-secondary">
        Ajouter choix
      </button>
    </div>
  );
}

export default function SurveyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [rangPonderation, setRangPonderation] = useState(true);

  const [optionalQuestions, setOptionalQuestions] = useState([]);
  const [mandatoryQuestions, setMandatoryQuestions] = useState([]);
  const [mandatoryCount, setMandatoryCount] = useState(10);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/enquetes/${id}`);
        const e = res.data;
        setTitre(e.titre);
        setDescription(e.description);
        setRangPonderation(
          typeof e.rang_ponderation === "boolean" ? e.rang_ponderation : true
        );

        // Partie optionnelle
        setOptionalQuestions(
          e.questions
            .filter((q) => q.part === "OPTIONAL")
            .map((q) => ({
              ...q,
              choices:
                q.type_question === "single_choice" ||
                q.type_question === "multi_choice" ||
                q.type_question === "boolean"
                  ? q.choices || []
                  : [],
              is_required: q.is_required ?? false,
            }))
        );

        // Partie obligatoire (Likert)
        const mand = e.questions
          .filter((q) => q.part === "MANDATORY")
          .map((q) => ({
            texte: q.texte,
            is_required: true,
          }));
        setMandatoryQuestions(mand);
        setMandatoryCount(
          mand.length === 15 ? 15 : mand.length === 20 ? 20 : 10
        );
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l'enquête");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Gestion des questions optionnelles
  const addOptional = () => {
    setOptionalQuestions((prev) => [
      ...prev,
      { texte: "", type_question: "text", is_required: false, choices: [] },
    ]);
  };

  const updateOptional = (i, changes) => {
    setOptionalQuestions((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, ...changes } : q))
    );
  };

  const removeOptional = (i) =>
    setOptionalQuestions((prev) => prev.filter((_, idx) => idx !== i));

  // Changement 10/15/20 questions obligatoires
  const handleMandatoryCount = (n) => {
    setMandatoryCount(n);
    setMandatoryQuestions((prev) => {
      const arr = [...prev];
      if (arr.length < n) {
        return arr.concat(
          Array.from({ length: n - arr.length }, (_, i) => ({
            texte: `Question ${arr.length + i + 1}`,
            is_required: true,
          }))
        );
      }
      if (arr.length > n) {
        return arr.slice(0, n);
      }
      return arr;
    });
  };

  // Mise à jour du texte des questions obligatoires
  const updateMandatoryText = (i, value) =>
    setMandatoryQuestions((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, texte: value } : q))
    );

  const validateMandatory = () =>
    [10, 15, 20].includes(mandatoryQuestions.length);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateMandatory()) {
      setError("Les questions obligatoires doivent être 10, 15 ou 20.");
      return;
    }

    const payload = {
      titre,
      description,
      taille_liste: mandatoryCount, // taille_liste = 10/15/20
      rang_ponderation: rangPonderation,
      questions: [
        // Partie optionnelle
        ...optionalQuestions.map((q) => {
          let obj = {
            texte: q.texte,
            type_question:
              q.type_question === "choice"
                ? "single_choice"
                : q.type_question,
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
        // Partie obligatoire
        ...mandatoryQuestions.map((q) => ({
          texte: q.texte,
          type_question: "likert",
          part: "MANDATORY",
          is_required: true,
        })),
      ],
    };

    try {
      await api.put(`/enquetes/${id}`, payload);
      navigate("/enquetes");
    } catch (err) {
      console.error("Erreur détaillée:", err.response?.data);
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          err.message
      );
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Modifier l’enquête</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={submit} className="space-y-4">
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre"
          className="form-input"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="form-input"
        />

        {/* Partie optionnelle */}
        <section>
          <h3 className="font-semibold mb-2">Partie optionnelle</h3>
          {optionalQuestions.map((q, i) => (
            <div key={i} className="p-3 border rounded mb-2">
              <input
                value={q.texte}
                onChange={(e) =>
                  updateOptional(i, { texte: e.target.value })
                }
                placeholder={`Question optionnelle ${i + 1}`}
                className="form-input mb-2"
              />
              <div className="flex gap-2 items-center">
                <select
                  value={q.type_question}
                  onChange={(e) =>
                    updateOptional(i, { type_question: e.target.value })
                  }
                  className="form-input w-48"
                >
                  <option value="text">Texte</option>
                  <option value="boolean">Booleen</option>
                  <option value="single_choice">Choix unique</option>
                  <option value="multi_choice">Choix multiple</option>
                </select>
                <label className="ml-4">
                  <input
                    type="checkbox"
                    checked={q.is_required}
                    onChange={(e) =>
                      updateOptional(i, { is_required: e.target.checked })
                    }
                  />{" "}
                  Obligatoire
                </label>
              </div>
              {(q.type_question === "single_choice" ||
                q.type_question === "multi_choice") && (
                <ChoicesEditor
                  choices={q.choices}
                  onChange={(c) => updateOptional(i, { choices: c })}
                />
              )}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => removeOptional(i)}
                  className="btn-danger"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addOptional}
            className="btn-secondary"
          >
            Ajouter question optionnelle
          </button>
        </section>

        {/* Partie obligatoire */}
        <section>
          <h3 className="font-semibold mb-2 mt-4">
            Partie obligatoire (Likert)
          </h3>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleMandatoryCount(10)}
              className={`px-3 py-1 rounded ${
                mandatoryCount === 10
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              10
            </button>
            <button
              type="button"
              onClick={() => handleMandatoryCount(15)}
              className={`px-3 py-1 rounded ${
                mandatoryCount === 15
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              15
            </button>
            <button
              type="button"
              onClick={() => handleMandatoryCount(20)}
              className={`px-3 py-1 rounded ${
                mandatoryCount === 20
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              20
            </button>
          </div>
          {mandatoryQuestions.map((q, i) => (
            <div key={i} className="p-2">
              <input
                value={q.texte}
                onChange={(e) => updateMandatoryText(i, e.target.value)}
                className="form-input"
              />
            </div>
          ))}
        </section>

        <button className="btn-primary">Enregistrer les modifications</button>
      </form>
    </div>
  );
}

// frontend/src/pages/SurveyCreate.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

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

          // SINGLE / MULTI : on reprend les choices de l'UI
          if (
            obj.type_question === "single_choice" ||
            obj.type_question === "multi_choice"
          ) {
            obj.choices = q.choices ?? [];
          }

          // BOOLEAN : forcer Vrai/Faux si aucun choix défini
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

        // partie obligatoire : toujours likert, obligatoire
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
        taille_liste: mandatoryCount, // taille de liste = nombre de questions obligatoires
        rang_ponderation: true, // ou false selon ta spec
        questions,
      };

      await api.post("/enquetes/", payload);
      navigate("/enquetes");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Créer une enquête</h1>
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
          {optionalQs.map((q, i) => (
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

        {/* Partie obligatoire (Likert) */}
        <section>
          <h3 className="font-semibold mb-2 mt-4">Partie obligatoire (Likert)</h3>
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

          {mandatoryQs.map((q, i) => (
            <div key={i} className="p-2">
              <input
                value={q.texte}
                onChange={(e) =>
                  setMandatoryQs((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, texte: e.target.value } : x
                    )
                  )
                }
                className="form-input"
              />
            </div>
          ))}
        </section>

        <button className="btn-primary">Créer</button>
      </form>
    </div>
  );
}

// Éditeur de choix pour les questions optionnelles
function ChoicesEditor({ choices = [], onChange }) {
  const add = () => onChange([...choices, { label: "", value: 0 }]);
  const update = (i, v) =>
    onChange(choices.map((c, idx) => (idx === i ? { ...c, ...v } : c)));
  const remove = (i) =>
    onChange(choices.filter((_, idx) => idx !== i));

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

// frontend/src/pages/SurveyImport.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

/**
 * Import d'une enquête papier déjà réalisée, depuis un fichier CSV ou Excel.
 * Seules les lignes complètes et conformes sont importées ; les autres sont listées.
 */
export default function SurveyImport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      if (!titre) setTitre(f.name.replace(/\.(csv|xlsx|xls)$/i, ""));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Veuillez sélectionner un fichier CSV ou Excel.");
      return;
    }
    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("file", file);
    try {
      const res = await api.post("/enquetes/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Erreur lors de l'importation du fichier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Import d'enquête papier
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Importer une enquête réalisée (CSV ou Excel)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Chaque ligne du fichier correspond à un questionnaire complet. Les lignes incomplètes ou
            non conformes sont écartées et listées ci-dessous.
          </p>
          <a
            href="/modele_enquete_mac.csv"
            download
            className="inline-block mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Télécharger le modèle de fichier (CSV)
          </a>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm border ${
              result
                ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                : "bg-amber-50 dark:bg-amber-900/30 border-amber-300 text-amber-800 dark:text-amber-200"
            }`}
          >
            {message}
          </div>
        )}

        {result ? (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <strong>Titre :</strong> {result.title}
              </p>
              <p>
                <strong>Propositions :</strong> {result.items_imported}
              </p>
              <p>
                <strong>Réponses importées :</strong> {result.responses_imported}
              </p>
              <p>
                <strong>Lignes rejetées :</strong> {result.rejected_count}
              </p>
            </div>

            {result.rejected.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 text-left">Ligne du fichier</th>
                      <th className="px-4 py-2 text-left">Motif</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300">
                    {result.rejected.map((r) => (
                      <tr key={r.ligne} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-4 py-2">{r.ligne}</td>
                        <td className="px-4 py-2">{r.motif}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigate(`/enquetes/${result.enquete_id}/graphs`)}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors"
              >
                Voir les graphiques MAC
              </button>
              <Link
                to="/enquetes"
                className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-300 transition-colors"
              >
                Retour aux enquêtes
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Titre de l'enquête
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description (facultatif)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-900/50">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-3">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {file ? file.name : "Cliquez pour choisir un fichier CSV ou Excel"}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">.csv, .xlsx ou .xls (50 Mo maximum)</p>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                to="/enquetes"
                className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-300 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading || !file}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Importation en cours..." : "Lancer l'importation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// frontend/src/pages/SurveyStats.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

const formatNumber = (x, digits = 2) =>
  typeof x === "number" ? x.toFixed(digits) : x;

const SCORE_MIN = -2;
const SCORE_MAX = 2;

export default function SurveyStats() {
  const { id } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [enqRes, statsRes] = await Promise.all([
          api.get(`/enquetes/${id}`),
          api.get(`/enquetes/${id}/stats`),
        ]);
        setEnquete(enqRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setMessage(
          err.response?.data?.detail || "Erreur de chargement des statistiques."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading)
    return <div className="p-6 text-center text-gray-600">Chargement...</div>;
  if (!enquete || !stats)
    return (
      <div className="p-6 text-center text-red-600">
        {message || "Statistiques introuvables."}
      </div>
    );

  const { items, scores, consensus, polarisations, n_responses } = stats;

  const normalizeScore = (s) =>
    ((s - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;

  const CONS_MIN = 0.05;
  const CONS_MAX = 0.5;
  const minDiameter = 10;
  const maxDiameter = 40;
  const normalizeConsensus = (c) => {
    const ratio = (c - CONS_MIN) / (CONS_MAX - CONS_MIN || 1);
    return (
      minDiameter +
      Math.max(0, Math.min(1, ratio)) * (maxDiameter - minDiameter)
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">
        Statistiques : {enquete.titre}
      </h1>
      <p className="mb-2 text-gray-700">{enquete.description}</p>
      <p className="mb-4 text-sm text-gray-500">
        Nombre de réponses prises en compte : {n_responses}
      </p>

      <Link to={`/enquetes`} className="btn-secondary mb-4 inline-block">
        ← Retour aux enquêtes
      </Link>

      {items.length === 0 ? (
        <div className="mt-4 text-gray-600">
          Aucune question obligatoire Likert pour cette enquête.
        </div>
      ) : (
        <>
          {/* Tableau Item / Score / Consensus */}
          <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm mb-8">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border-b">Item</th>
                  <th className="px-4 py-2 border-b">Score</th>
                  <th className="px-4 py-2 border-b">Consensus</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 border-b align-top">
                      <div className="font-medium">Question {idx + 1}</div>
                      <div className="text-xs text-gray-600">{item.texte}</div>
                    </td>
                    <td className="px-4 py-2 border-b align-top">
                      {formatNumber(scores[idx])}
                    </td>
                    <td className="px-4 py-2 border-b align-top">
                      {formatNumber(consensus[idx], 3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Graphe 1 : barres (scores) + bulles (consensus) */}
          <h2 className="text-xl font-semibold mb-3">
            Scores et consensus par item
          </h2>
          <div className="space-y-3 mb-10">
            {items.map((item, idx) => {
              const score = scores[idx];
              const cons = consensus[idx];
              const widthPct = normalizeScore(score);
              const diameter = normalizeConsensus(cons);

              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-700">Q{idx + 1}</div>

                  <div className="flex-1">
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-indigo-500"
                        style={{ width: `${widthPct}%` }}
                        title={`Score: ${formatNumber(score)}`}
                      />
                    </div>
                  </div>

                  <div className="w-16 text-xs text-gray-700 text-right">
                    {formatNumber(score)}
                  </div>

                  <div
                    className="flex items-center justify-center rounded-full bg-blue-100 text-[10px] text-blue-900"
                    style={{
                      width: `${diameter}px`,
                      height: `${diameter}px`,
                    }}
                    title={`Consensus: ${formatNumber(cons, 3)}`}
                  >
                    {formatNumber(cons, 2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Liste simple des polarisations (distances les plus faibles) */}
          {polarisations && polarisations.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">
                Polarisations (items les plus proches)
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Couples d&apos;items présentant les plus petites distances
                moyennes (proximité de représentation).
              </p>
              <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border-b">Item A</th>
                      <th className="px-4 py-2 border-b">Item B</th>
                      <th className="px-4 py-2 border-b">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {polarisations.map((p, idx) => {
                      const itemA = items[p.item_a_index];
                      const itemB = items[p.item_b_index];
                      return (
                        <tr
                          key={`${p.item_a_id}-${p.item_b_id}-${idx}`}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-2 border-b align-top">
                            <div className="font-medium">
                              Q{p.item_a_index + 1} (id {p.item_a_id})
                            </div>
                            <div className="text-xs text-gray-600">
                              {itemA?.texte}
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b align-top">
                            <div className="font-medium">
                              Q{p.item_b_index + 1} (id {p.item_b_id})
                            </div>
                            <div className="text-xs text-gray-600">
                              {itemB?.texte}
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b align-top">
                            {formatNumber(p.distance, 3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      <div className="mt-8">
        <Link
          to={`/enquetes/${id}/graphs`}
          className="btn-primary inline-block"
        >
          Voir les graphiques avancés
        </Link>
      </div>
      <div className="mt-8">
        <Link
          to={`/enquetes/${id}/graphs3d`}
          className="btn-primary inline-block"
        >
          Voir les graphiques avancés 3D
        </Link>
      </div>
      {message && (
        <div className="mt-4 text-center text-red-600">{message}</div>
      )}
    </div>
  );
}

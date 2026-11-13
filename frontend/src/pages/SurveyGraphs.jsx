/* eslint-disable no-unused-vars */
// frontend/src/pages/SurveyGraphs.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import api from "../services/api";

const SCORE_MIN = -2;
const SCORE_MAX = 2;
const CONS_MIN = 0.05;
const CONS_MAX = 0.5;

// const formatNumber = (x, digits = 2) =>
//   typeof x === "number" ? x.toFixed(digits) : x;

export default function SurveyGraphs() {
  const { id } = useParams();
  const [enquete, setEnquete] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingStats, setPendingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  // Item focal choisi pour le graphe 4 (null = dernier item par défaut)
  const [focalChoisi, setFocalChoisi] = useState(null);
  const location = useLocation();

  // Refs pour chaque graphe (section)
  const graph1Ref = useRef(null);
  const graph2Ref = useRef(null);
  const graph3Ref = useRef(null);
  const graph4Ref = useRef(null);
  const graph5Ref = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const enqRes = await api.get(`/enquetes/${id}`);

        const params = {};
        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params[`filters[${key}]`] = value;
          }
        });

        const statsRes = await api.get(`/enquetes/${id}/stats`, { params });

        setEnquete(enqRes.data);
        setPendingStats(statsRes.data); // <-- ne pas toucher à stats tout de suite
      } catch (err) {
        setMessage(
          err.response?.data?.detail || "Erreur de chargement des graphiques."
        );
        setPendingStats(null);
      }
    };
    load();
  }, [id, appliedFilters]);

  useEffect(() => {
    if (!pendingStats) {
      setLoading(false);
      return;
    }
    // Laisser le temps à React d’afficher l’overlay avant de recalculer les SVG
    const idTimeout = setTimeout(() => {
      setStats(pendingStats);
      setLoading(false);
    }, 0);

    return () => clearTimeout(idTimeout);
  }, [pendingStats]);

  if (pendingStats && !enquete) {
    return (
      <div className="p-6 text-center text-red-600">
        {message || "Graphiques indisponibles."}
      </div>
    );
  }

  const items = stats?.items || [];
  const scores = stats?.scores || [];
  const consensus = stats?.consensus || [];
  const polarisations = stats?.polarisations || [];
  const n_responses = stats?.n_responses || 0;
  const optionalFilters = stats?.filters?.questions || [];
  const crowns = stats?.crowns || [];

  const normScoreToX = (score, width, paddingLeft, paddingRight) => {
    const innerWidth = width - paddingLeft - paddingRight;
    return (
      paddingLeft + ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * innerWidth
    );
  };

  const normConsensusToRadius = (c, rMin, rMax) => {
    const ratio = (c - CONS_MIN) / (CONS_MAX - CONS_MIN || 1);
    return rMin + Math.max(0, Math.min(1, ratio)) * (rMax - rMin);
  };

  // Placement vertical des bulles sans chevauchement important, en tenant compte des rayons

  const layoutBubbles = (nodes, baseY, margin = 4) => {
    // nodes: [{ x, r, ...meta }]
    const placed = [];

    const result = nodes
      .slice()
      .sort((a, b) => a.x - b.x) // ordre stable de gauche à droite
      .map((node) => {
        let cy = baseY;

        const maxIterations = 30;
        const step = node.r + margin; // dépend du rayon

        for (let k = 0; k < maxIterations; k++) {
          const dir = k % 2 === 0 ? 1 : -1;
          const offset = Math.ceil(k / 2) * step * dir;
          const testY = baseY + offset;

          let ok = true;
          for (const other of placed) {
            const dx = node.x - other.x;
            const dy = testY - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < node.r + other.r + margin) {
              ok = false;
              break;
            }
          }

          if (ok) {
            cy = testY;
            break;
          }
        }

        const placedNode = { ...node, y: cy };
        placed.push(placedNode);
        return placedNode;
      });

    return result;
  };

  // Item focal du graphe 4 : choisi par le chercheur, par défaut le dernier item
  const focalItemId =
    items.find((it) => it.id === focalChoisi)?.id ??
    (items.length > 0 ? items[items.length - 1].id : null);
  const focalIndex = focalItemId
    ? items.findIndex((it) => it.id === focalItemId)
    : -1;
  //   const focalDistances =
  //     focalIndex >= 0 && distances && distances.length
  //       ? distances[focalIndex]
  //       : [];

  // Export d'un graphe (section) en PNG
  // Export d'un graphe en fichier SVG
  const exportGraph = (ref, filename) => {
    try {
      if (!ref || !ref.current) {
        console.error("Ref vide ou null pour l’export:", ref);
        alert("Graphique introuvable pour l’export.");
        return;
      }

      const svgElement = ref.current.querySelector("svg");
      if (!svgElement) {
        console.error("Aucun <svg> trouvé dans le conteneur pour l’export.");
        alert("Aucun graphique SVG trouvé pour l’export.");
        return;
      }

      // Sérialiser le SVG
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      // Ajouter l’en-tête XML si absent
      if (!source.match(/^<\?xml/)) {
        source =
          '<?xml version="1.0" standalone="no"?>\n' +
          '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
          '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
          source;
      }

      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename.endsWith(".svg") ? filename : filename + ".svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur export SVG:", err);
      alert("Erreur export SVG: " + (err?.message || "voir console"));
    }
  };

  if (!pendingStats) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-10 relative">
        <div className="absolute inset-0 bg-white dark:bg-slate-800/70 flex flex-col items-center justify-center z-20">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3" />
          <div className="text-gray-700 dark:text-slate-300 text-sm">
            Mise à jour des graphiques...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 relative">
      {loading && (
        <div className="absolute inset-0 bg-white dark:bg-slate-800/70 flex flex-col items-center justify-center z-20">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3" />
          <div className="text-gray-700 dark:text-slate-300 text-sm">
            Mise à jour des graphiques...
          </div>
        </div>
      )}
      {stats && (
        <>
          {optionalFilters.length > 0 && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {optionalFilters.map((q) => (
                <div key={q.id}>
                  <label className="block mb-1 text-gray-700 dark:text-slate-300">{q.texte}</label>

                  {q.type === "text" ? (
                    <select
                      className="input"
                      value={selectedFilters[q.id] || ""}
                      onChange={(e) =>
                        setSelectedFilters((prev) => ({
                          ...prev,
                          [q.id]: e.target.value || undefined,
                        }))
                      }
                    >
                      <option value="">Tous</option>
                      {q.values.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="input"
                        placeholder={q.min}
                        value={selectedFilters[`${q.id}_min`] || ""}
                        onChange={(e) =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            [`${q.id}_min`]: e.target.value || undefined,
                          }))
                        }
                      />
                      <input
                        type="number"
                        className="input"
                        placeholder={q.max}
                        value={selectedFilters[`${q.id}_max`] || ""}
                        onChange={(e) =>
                          setSelectedFilters((prev) => ({
                            ...prev,
                            [`${q.id}_max`]: e.target.value || undefined,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {optionalFilters.length > 0 && (
            <div className="mb-4 flex gap-3 items-end">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setAppliedFilters(selectedFilters)}
              >
                Appliquer les filtres
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSelectedFilters({});
                  setAppliedFilters({});
                }}
              >
                Réinitialiser
              </button>
            </div>
          )}

          {location.state?.sans3d && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              Votre ordinateur ne permet pas l&apos;affichage 3D : la carte 2D interactive est proposée à la place.
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold mb-2">
              Graphiques avancés : {enquete.titre}
            </h1>
            <p className="mb-2 text-gray-700 dark:text-slate-300">{enquete.description}</p>
            <p className="mb-4 text-sm text-gray-500">
              Nombre de réponses prises en compte : {n_responses}
            </p>

            <div className="flex flex-wrap gap-3 mb-2">
              <Link to={`/enquetes/${id}/stats`} className="btn-secondary">
                ← Retour aux statistiques
              </Link>
            </div>

            {/* Boutons d'export globaux */}
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                className="btn-primary"
                onClick={() => exportGraph(graph1Ref, `scores-items-${id}`)}
              >
                Exporter Graphe 1
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  exportGraph(graph2Ref, `adhesion-consensus-${id}`)
                }
              >
                Exporter Graphe 2
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  exportGraph(
                    graph3Ref,
                    `saillance-consensus-polarisations-${id}`
                  )
                }
              >
                Exporter Graphe 3
              </button>
              {focalIndex >= 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() =>
                    exportGraph(
                      graph4Ref,
                      `focalisation-item-${focalIndex + 1}-${id}`
                    )
                  }
                >
                  Exporter Graphe 4
                </button>
              )}
              {/* Nouveau bouton pour le schéma en couronnes */}
              {crowns.length > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() =>
                    exportGraph(
                      graph5Ref,
                      `schema-couronnes-representation-sociale-${id}`
                    )
                  }
                >
                  Exporter Graphe 5
                </button>
              )}
            </div>
          </div>

          {/* GRAPHE 1 : Scores des items – Adhésion */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Scores des items – Adhésion
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Chaque point représente un item placé sur l&apos;axe horizontal en
              fonction de son score (saillance).
            </p>

            <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4 overflow-x-auto">
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: 1200,
                  backgroundColor: "#ffffffff",
                  color: "#00000000",
                }}
                ref={graph1Ref}
              >
                {(() => {
                  const width = 1100;
                  const height = 360;
                  const paddingLeft = 60;
                  const paddingRight = 40;
                  const paddingTop = 40;
                  const paddingBottom = 40;
                  const axisY = height / 2;
                  const zeroX = normScoreToX(
                    0,
                    width,
                    paddingLeft,
                    paddingRight
                  );

                  return (
                    <svg
                      width={width}
                      height={height}
                      className="block mx-auto"
                      style={{ backgroundColor: "white" }}
                    >
                      {/* Axe vertical à 0 */}
                      <line
                        x1={zeroX}
                        y1={paddingTop}
                        x2={zeroX}
                        y2={height - paddingBottom}
                        stroke="#9ca3af"
                        strokeDasharray="2,2"
                        strokeWidth="1"
                      />

                      {/* Ligne centrale */}
                      <line
                        x1={paddingLeft}
                        y1={axisY}
                        x2={width - paddingRight}
                        y2={axisY}
                        stroke="#444"
                        strokeWidth="1"
                      />

                      {/* Ticks -2..2 */}
                      {Array.from({ length: 41 }, (_, i) => (i - 20) / 10).map((v) => {
                        const x = normScoreToX(
                          v,
                          width,
                          paddingLeft,
                          paddingRight
                        );
                        const majeur = Math.round(v * 10) % 5 === 0;
                        return (
                          <g key={v}>
                            <line
                              x1={x}
                              y1={axisY - 5}
                              x2={x}
                              y2={axisY + (majeur ? 8 : 4)}
                              stroke="#888"
                              strokeWidth="1"
                            />
                            <text
                              x={x}
                              y={axisY + 18}
                              fontSize={majeur ? "12" : "9"}
                              textAnchor="middle"
                              fill={majeur ? "#ccc" : "#999"}
                            >
                              {v.toFixed(1)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Titre en haut */}
                      <text
                        x={width / 2}
                        y={24}
                        fontSize="20"
                        textAnchor="middle"
                        fill="#ff0000"
                      >
                        Scores des Items – Adhésion
                      </text>

                      {/* Items */}
                      {items.map((item, idx) => {
                        const s = scores[idx];
                        const x = normScoreToX(
                          s,
                          width,
                          paddingLeft,
                          paddingRight
                        );
                        return (
                          <g key={item.id}>
                            <circle cx={x} cy={axisY} r={14} fill="#3b82f6" fillOpacity={0.85}>
                              <title>{`Proposition ${idx + 1} : ${item.texte} (score ${s.toFixed(2)})`}</title>
                            </circle>
                            <text x={x} y={axisY + 4} fontSize="11" textAnchor="middle" fill="#ffffff">
                              {idx + 1}
                            </text>
                            {/* Mot de l'item au-dessus du cercle, hauteur alternée pour limiter les chevauchements */}
                            <text
                              x={x}
                              y={axisY - 24 - (idx % 2 === 0 ? 0 : 16)}
                              fontSize="11"
                              textAnchor="middle"
                              fill="#374151"
                            >
                              {item.texte}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* GRAPHE 2 : Adhésion et consensus (cercles) */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Adhésion et consensus
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Chaque cercle est centré sur le score de l&apos;item. Le rayon
              représente le consensus : plus le cercle est grand, plus
              l&apos;accord des répondants est fort.
            </p>

            <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4 overflow-x-auto">
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: 1200,
                  backgroundColor: "#ffffffff",
                  color: "#00000000",
                }}
                ref={graph2Ref}
              >
                {(() => {
                  const width = 1100;
                  const height = 420;
                  const paddingLeft = 60;
                  const paddingRight = 40;
                  const paddingTop = 50;
                  const paddingBottom = 40;
                  const axisY = height / 2;
                  const rMin = 14;
                  const rMax = 45;
                  const zeroX = normScoreToX(
                    0,
                    width,
                    paddingLeft,
                    paddingRight
                  );

                  return (
                    <svg
                      width={width}
                      height={height}
                      className="block mx-auto"
                      style={{ backgroundColor: "white" }}
                    >
                      {/* Axe vertical à 0 */}
                      <line
                        x1={zeroX}
                        y1={paddingTop}
                        x2={zeroX}
                        y2={height - paddingBottom}
                        stroke="#9ca3af"
                        strokeDasharray="2,2"
                        strokeWidth="1"
                      />

                      {/* Axe horizontal */}
                      <line
                        x1={paddingLeft}
                        y1={axisY}
                        x2={width - paddingRight}
                        y2={axisY}
                        stroke="#444"
                        strokeWidth="1"
                      />

                      {/* Ticks -2..2 */}
                      {Array.from({ length: 41 }, (_, i) => (i - 20) / 10).map((v) => {
                        const x = normScoreToX(
                          v,
                          width,
                          paddingLeft,
                          paddingRight
                        );
                        const majeur = Math.round(v * 10) % 5 === 0;
                        return (
                          <g key={v}>
                            <line
                              x1={x}
                              y1={axisY - 5}
                              x2={x}
                              y2={axisY + (majeur ? 8 : 4)}
                              stroke="#888"
                              strokeWidth="1"
                            />
                            <text
                              x={x}
                              y={axisY + 22}
                              fontSize={majeur ? "12" : "9"}
                              textAnchor="middle"
                              fill={majeur ? "#ccc" : "#999"}
                            >
                              {v.toFixed(1)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Titre */}
                      <text
                        x={width / 2}
                        y={26}
                        fontSize="20"
                        textAnchor="middle"
                        fill="#ff0000"
                      >
                        Adhésion et consensus
                      </text>

                      {/* Cercles items avec anti-chevauchement */}
                      {(() => {
                        const nodes = items.map((item, idx) => {
                          const s = scores[idx];
                          const c = consensus[idx];
                          const x = normScoreToX(
                            s,
                            width,
                            paddingLeft,
                            paddingRight
                          );
                          const r = normConsensusToRadius(c, rMin, rMax);

                          const t =
                            (s - SCORE_MIN) / (SCORE_MAX - SCORE_MIN || 1);
                          const color =
                            t < 0.4
                              ? "#1d4ed8"
                              : t < 0.6
                              ? "#a855f7"
                              : "#ef4444";

                          return { item, idx, x, r, color };
                        });

                        const placed = layoutBubbles(nodes, axisY, 4);

                        return placed.map((n) => (
                          <g key={n.item.id}>
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={n.r}
                              fill={n.color}
                              fillOpacity={0.35}
                              stroke={n.color}
                              strokeWidth="1"
                            >
                              <title>{`${n.item.texte} : adhésion ${scores[n.idx].toFixed(2)}, consensus ${consensus[n.idx].toFixed(2)}`}</title>
                            </circle>
                            <circle cx={n.x} cy={n.y} r={2} fill="#0000ff" />
                            <text
                              x={n.x}
                              y={n.y - n.r - 4}
                              fontSize="13"
                              textAnchor="middle"
                              fill="#000000"
                            >
                              {n.item.texte}
                            </text>
                          </g>
                        ));
                      })()}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* GRAPHE 3 : Saillance–Consensus–Polarisations */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              Mise en évidence des rapprochements entre certains items
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Même représentation que ci-dessus, avec en plus les segments verts
              entre les couples d&apos;items les plus proches (polarisations) et
              leurs distances.
            </p>

            <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4 overflow-x-auto">
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: 1200,
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
                ref={graph3Ref}
              >
                {(() => {
                  const width = 1200;
                  const height = 480;
                  const paddingLeft = 60;
                  const paddingRight = 40;
                  const paddingTop = 70;
                  const paddingBottom = 50;
                  const axisY = height / 2;
                  const rMin = 14;
                  const rMax = 45;

                  const maxD =
                    polarisations && polarisations.length
                      ? Math.max(...polarisations.map((p) => p.distance || 0))
                      : 1;

                  const zeroX = normScoreToX(
                    0,
                    width,
                    paddingLeft,
                    paddingRight
                  );

                  return (
                    <svg
                      width={width}
                      height={height}
                      className="block mx-auto"
                      style={{ backgroundColor: "white" }}
                    >
                      {/* Axe vertical à 0 */}
                      <line
                        x1={zeroX}
                        y1={paddingTop}
                        x2={zeroX}
                        y2={height - paddingBottom}
                        stroke="#9ca3af"
                        strokeDasharray="2,2"
                        strokeWidth="1"
                      />

                      {/* Axe horizontal */}
                      <line
                        x1={paddingLeft}
                        y1={axisY}
                        x2={width - paddingRight}
                        y2={axisY}
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />

                      {/* Ticks -2..2 */}
                      {Array.from({ length: 41 }, (_, i) => (i - 20) / 10).map((v) => {
                        const x = normScoreToX(
                          v,
                          width,
                          paddingLeft,
                          paddingRight
                        );
                        return (
                          <g key={v}>
                            <line
                              x1={x}
                              y1={axisY - 3}
                              x2={x}
                              y2={axisY + 3}
                              stroke="#9ca3af"
                              strokeWidth="1"
                            />
                            <text
                              x={x}
                              y={height - paddingBottom + 14}
                              fontSize="10"
                              textAnchor="middle"
                              fill="#16a34a"
                            >
                              {v.toFixed(1)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Titre */}
                      <text
                        x={width / 2}
                        y={30}
                        fontSize="20"
                        textAnchor="middle"
                        fill="#ff0000"
                      >
                        Mise en évidence des rapprochements entre certains items
                      </text>

                      {/* Légende bas */}
                      <text
                        x={paddingLeft}
                        y={height - 8}
                        fontSize="16"
                        textAnchor="start"
                        fill="#16a34a"
                      >
                        {enquete?.titre || ""}
                      </text>
                      <text
                        x={width - paddingRight}
                        y={height - 8}
                        fontSize="12"
                        textAnchor="end"
                        fill="#a21caf"
                      >
                        Saillance
                      </text>

                      {/* Cercles items avec anti-chevauchement */}
                      {(() => {
                        const nodes = items.map((item, idx) => {
                          const s = scores[idx];
                          const c = consensus[idx];
                          const x = normScoreToX(
                            s,
                            width,
                            paddingLeft,
                            paddingRight
                          );
                          const r = normConsensusToRadius(c, rMin, rMax);

                          const t =
                            (s - SCORE_MIN) / (SCORE_MAX - SCORE_MIN || 1);
                          const color =
                            t < 0.4
                              ? "#1d4ed8"
                              : t < 0.6
                              ? "#a855f7"
                              : "#ef4444";

                          return { item, idx, x, r, color };
                        });

                        const placed = layoutBubbles(nodes, axisY, 4);

                        return placed.map((n) => (
                          <g key={n.item.id}>
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={n.r}
                              fill={n.color}
                              fillOpacity={0.2}
                              stroke={n.color}
                              strokeWidth="1"
                            />
                            <circle cx={n.x} cy={n.y} r={2} fill="#0000ff" />
                            <text
                              x={n.x}
                              y={n.y - n.r - 4}
                              fontSize="13"
                              textAnchor="middle"
                              fill="#000000"
                            >
                              {`Item ${n.idx + 1}`}
                            </text>
                          </g>
                        ));
                      })()}

                      {/* Segments de polarisation */}
                      {polarisations &&
                        polarisations.map((p, idx) => {
                          const a = p.item_a_index;
                          const b = p.item_b_index;
                          const d = p.distance || 0;

                          const sA = scores[a];
                          const sB = scores[b];
                          const x1 = normScoreToX(
                            sA,
                            width,
                            paddingLeft,
                            paddingRight
                          );
                          const x2 = normScoreToX(
                            sB,
                            width,
                            paddingLeft,
                            paddingRight
                          );

                          const y1 = axisY;
                          const y2 = axisY;

                          const w = maxD > 0 ? 3 - (d / maxD) * 2 : 2;
                          //   const midX = (x1 + x2) / 2;

                          return (
                            <g key={`${p.item_a_id}-${p.item_b_id}-${idx}`}>
                              <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#16a34a"
                                strokeWidth={w}
                              />
                              {/* <text
                            x={midX}
                            y={y1 - 10}
                            fontSize="11"
                            textAnchor="middle"
                            fill="#000402ff"
                          >
                            {formatNumber(d, 3)}
                          </text> */}
                            </g>
                          );
                        })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* GRAPHE 4 : Focalisation autour d'un item */}
          {focalIndex >= 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-2">
                Polarisation : distances par rapport à un item
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                L&apos;item focal est placé à son score sur l&apos;axe horizontal,
                au milieu du graphe. Les autres items sont placés à leur score sur
                le même axe ; leur hauteur est décalée pour éviter les chevauchements.
                La taille des cercles représente le consensus.
              </p>

              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                <label htmlFor="choix-item-focal" className="text-gray-700 dark:text-slate-300">
                  Item focal :
                </label>
                <select
                  id="choix-item-focal"
                  className="input"
                  value={focalItemId ?? ""}
                  onChange={(e) => setFocalChoisi(Number(e.target.value))}
                >
                  {items.map((it, idx) => (
                    <option key={it.id} value={it.id}>
                      Item {idx + 1} : {it.texte}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4 overflow-x-auto">
                <div
                  className="relative mx-auto"
                  style={{
                    maxWidth: 1200,
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                  ref={graph4Ref}
                >
                  {(() => {
                    const width = 1200;
                    const height = 520;
                    const paddingLeft = 80;
                    const paddingRight = 40;
                    const paddingTop = 80;
                    const paddingBottom = 60;
                    const axisY = height / 2;
                    const centerY = axisY - 20;

                    // const maxDist =
                    //   focalDistances && focalDistances.length
                    //     ? Math.max(...focalDistances)
                    //     : 1;

                    const zeroX = normScoreToX(
                      0,
                      width,
                      paddingLeft,
                      paddingRight
                    );

                    return (
                      <svg
                        width={width}
                        height={height}
                        className="block mx-auto"
                        style={{ backgroundColor: "white" }}
                      >
                        {/* Axe horizontal */}
                        <line
                          x1={paddingLeft}
                          y1={axisY}
                          x2={width - paddingRight}
                          y2={axisY}
                          stroke="#9ca3af"
                          strokeWidth="1"
                        />

                        {/* Axe vertical à 0 */}
                        <line
                          x1={zeroX}
                          y1={paddingTop}
                          x2={zeroX}
                          y2={height - paddingBottom}
                          stroke="#f97316"
                          strokeDasharray="2,2"
                          strokeWidth="1"
                        />

                        {/* Titre */}
                        <text
                          x={width / 2}
                          y={30}
                          fontSize="20"
                          textAnchor="middle"
                          fill="#ef4444"
                        >
                          Polarisation : distances par rapport à un item
                        </text>

                        {/* Item focal */}
                        {(() => {
                          const s = scores[focalIndex];
                          const c = consensus[focalIndex];
                          const x = normScoreToX(
                            s,
                            width,
                            paddingLeft,
                            paddingRight
                          );
                          const r = normConsensusToRadius(c, 18, 35);

                          return (
                            <g>
                              <circle
                                cx={x}
                                cy={centerY}
                                r={r}
                                fill="#f97316"
                                fillOpacity={0.2}
                                stroke="#f97316"
                              />
                              <circle
                                cx={x}
                                cy={centerY}
                                r={3}
                                fill="#0000ff"
                              />
                              <text
                                x={x}
                                y={centerY}
                                fontSize="16"
                                textAnchor="middle"
                                fill="#ec4899"
                              >
                                {`Item ${focalIndex + 1}`}
                              </text>
                            </g>
                          );
                        })()}

                        {/* Autres items avec anti-chevauchement contrôlé */}
                        {(() => {
                          // on part de l'axe horizontal comme ligne de base
                          const baseY = axisY;

                          const nodes = items
                            .map((item, idx) => {
                              if (idx === focalIndex) return null;

                              const s = scores[idx];
                              const c = consensus[idx];

                              const x = normScoreToX(
                                s,
                                width,
                                paddingLeft,
                                paddingRight
                              );

                              const r = normConsensusToRadius(c, 6, 20);

                              return { item, idx, x, r };
                            })
                            .filter(Boolean)
                            .sort((a, b) => a.x - b.x);

                          const placed = [];
                          const margin = 4;

                          nodes.forEach((n) => {
                            let cy = baseY;
                            const maxIterations = 30;
                            const step = n.r + margin;

                            for (let k = 0; k < maxIterations; k++) {
                              const dir = k % 2 === 0 ? 1 : -1;
                              const offset = Math.ceil(k / 2) * step * dir;
                              const testY = baseY + offset;

                              let ok = true;
                              for (const other of placed) {
                                const dx = n.x - other.x;
                                const dy = testY - other.y;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                if (dist < n.r + other.r + margin) {
                                  ok = false;
                                  break;
                                }
                              }

                              if (ok) {
                                cy = testY;
                                break;
                              }
                            }

                            placed.push({ ...n, y: cy });
                          });

                          return placed.map((n) => (
                            <g key={n.item.id}>
                              <circle
                                cx={n.x}
                                cy={n.y}
                                r={n.r}
                                fill="#60a5fa"
                                fillOpacity={0.2}
                                stroke="#1d4ed8"
                              />
                              <circle cx={n.x} cy={n.y} r={2} fill="#0000ff" />
                              <text
                                x={n.x}
                                y={n.y - n.r - 4}
                                fontSize="12"
                                textAnchor="middle"
                                fill="#1f2937"
                              >
                                {`Item ${n.idx + 1}`}
                              </text>
                            </g>
                          ));
                        })()}
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}
          {/* GRAPHE 5 : Schéma en couronnes */}
          {crowns.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-2">
                Schéma en couronnes de la structure de la représentation sociale
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                Les items sont répartis en zones de centralité et de périphérie
                à partir de leurs scores d’adhésion et de leurs distances
                moyennes.
              </p>

              <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4 overflow-x-auto">
                <div
                  className="relative mx-auto"
                  style={{
                    maxWidth: 800,
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                  ref={graph5Ref}
                >
                  {(() => {
                    const width = 700;
                    const height = 700;
                    const cx = width / 2;
                    const cy = height / 2;

                    // 4 couronnes : zone 1 (centre) -> zone 4 (périphérie)
                    const ringWidths = [60, 60, 60, 60]; // épaisseur de chaque anneau
                    const innerRadiusZone1 = 0;
                    const radii = [];
                    let currentInner = innerRadiusZone1;
                    for (let z = 1; z <= 4; z++) {
                      const rOuter = currentInner + ringWidths[z - 1];
                      radii.push({ zone: z, rInner: currentInner, rOuter });
                      currentInner = rOuter + 10; // petit espace entre les couronnes
                    }
                    const maxOuterRadius = radii[radii.length - 1].rOuter + 20;

                    // Regrouper les items par zone
                    const itemsByZone = { 1: [], 2: [], 3: [], 4: [] };
                    crowns.forEach((c) => {
                      if (c.zone >= 1 && c.zone <= 4 && items[c.index]) {
                        itemsByZone[c.zone].push(c);
                      }
                    });

                    // Fonction pour placer les items d'une zone sur un cercle moyen de la couronne
                    const renderZoneItems = (zone, color) => {
                      const list = itemsByZone[zone];
                      if (!list.length) return null;

                      const ring = radii[zone - 1];
                      const rCenter = (ring.rInner + ring.rOuter) / 2;
                      const angleStep = (2 * Math.PI) / list.length;

                      return list.map((c, i) => {
                        const angle = i * angleStep - Math.PI / 2; // commencer en haut
                        const x = cx + rCenter * Math.cos(angle);
                        const y = cy + rCenter * Math.sin(angle);

                        const item = items[c.index];
                        const cons = consensus[c.index] ?? 0.2;

                        // rayon visuel basé sur le consensus
                        const rMin = 8;
                        const rMax = 28;
                        const t = Math.max(0, Math.min(1, cons)); // cons déjà normalisé [0,1] dans ton modèle
                        const r = rMin + t * (rMax - rMin);

                        // couleur par zone
                        const zoneColor =
                          zone === 1
                            ? "#f97316" // centralité max
                            : zone === 2
                            ? "#22c55e" // couronne centrale
                            : zone === 3
                            ? "#3b82f6" // périphérie incertaine
                            : "#a855f7"; // périphérie marginale

                        return (
                          <g key={item.id}>
                            <circle
                              cx={x}
                              cy={y}
                              r={r}
                              fill={zoneColor}
                              fillOpacity={0.25}
                              stroke={zoneColor}
                              strokeWidth="1"
                            />
                            <circle cx={x} cy={y} r={2} fill="#0000ff" />
                            <text
                              x={x}
                              y={y}
                              fontSize="11"
                              textAnchor="middle"
                              fill="#111827"
                            >
                              {`Item ${c.index + 1}`}
                            </text>
                          </g>
                        );
                      });
                    };

                    return (
                      <svg
                        width={width}
                        height={height}
                        className="block mx-auto"
                        style={{ backgroundColor: "white" }}
                      >
                        {/* Fond blanc */}
                        <rect
                          x={0}
                          y={0}
                          width={width}
                          height={height}
                          fill="#ffffff"
                        />

                        {/* Titre */}
                        <text
                          x={width / 2}
                          y={30}
                          fontSize="20"
                          textAnchor="middle"
                          fill="#ef4444"
                        >
                          STRUCTURE EN COURONNES DE LA REPRÉSENTATION SOCIALE
                        </text>

                        {/* Cercles des zones */}
                        {radii.map((r) => (
                          <circle
                            key={r.zone}
                            cx={cx}
                            cy={cy}
                            r={r.rOuter}
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Etiquettes des zones */}
                        {radii.map((r) => {
                          const labelRadius = (r.rInner + r.rOuter) / 2;
                          const x = cx + labelRadius * Math.cos(-Math.PI / 2);
                          const y =
                            cy + labelRadius * Math.sin(-Math.PI / 2) - 10;
                          let label = "";
                          if (r.zone === 1)
                            label = "Zone 1 : centralité maximum";
                          else if (r.zone === 2)
                            label = "Zone 2 : couronne centrale";
                          else if (r.zone === 3)
                            label = "Zone 3 : périphérie incertaine";
                          else if (r.zone === 4)
                            label = "Zone 4 : périphérie marginale";
                          return (
                            <text
                              key={r.zone}
                              x={x}
                              y={y}
                              fontSize="11"
                              textAnchor="middle"
                              fill="#374151"
                            >
                              {label}
                            </text>
                          );
                        })}

                        {/* Items par zone */}
                        {renderZoneItems(1)}
                        {renderZoneItems(2)}
                        {renderZoneItems(3)}
                        {renderZoneItems(4)}
                      </svg>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {message && !loading && (
            <div className="mt-4 text-center text-red-600">{message}</div>
          )}
        </>
      )}
    </div>
  );
}

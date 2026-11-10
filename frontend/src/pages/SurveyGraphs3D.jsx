// // frontend/src/pages/SurveyGraphs3D.jsx
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import Plot from "react-plotly.js";
// import api from "../services/api";

// const SCORE_MIN = -2;
// const SCORE_MAX = 2;
// const CONS_MIN = 0.05;
// const CONS_MAX = 0.5;

// const formatNumber = (x, digits = 2) =>
//   typeof x === "number" ? x.toFixed(digits) : x;

// // Layout de collision 1D pour produire un Y artificiel non chevauchant
// // nodes: [{ x, r, ...meta }], r = petit rayon logique (unités arbitraires)
// const layoutNonOverlapping = (nodes, baseY = 0, margin = 0.02) => {
//   const placed = [];
//   const sorted = nodes.slice().sort((a, b) => a.x - b.x);

//   sorted.forEach((n) => {
//     let y = baseY;
//     const maxIter = 40;
//     const step = n.r + margin;

//     for (let k = 0; k < maxIter; k++) {
//       const dir = k % 2 === 0 ? 1 : -1;
//       const offset = Math.ceil(k / 2) * step * dir;
//       const testY = baseY + offset;

//       let ok = true;
//       for (const o of placed) {
//         const dx = n.x - o.x;
//         const dy = testY - o.y;
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         if (dist < n.r + o.r + margin) {
//           ok = false;
//           break;
//         }
//       }
//       if (ok) {
//         y = testY;
//         break;
//       }
//     }

//     placed.push({ ...n, y });
//   });

//   return placed;
// };

// export default function SurveyGraphs3D() {
//   const { id } = useParams();
//   const [enquete, setEnquete] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [enqRes, statsRes] = await Promise.all([
//           api.get(`/enquetes/${id}`),
//           api.get(`/enquetes/${id}/stats`),
//         ]);
//         setEnquete(enqRes.data);
//         setStats(statsRes.data);
//       } catch (err) {
//         setMessage(
//           err.response?.data?.detail ||
//             "Erreur de chargement des données pour les graphiques."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [id]);

//   if (loading)
//     return <div className="p-6 text-center text-gray-600 dark:text-slate-400">Chargement...</div>;

//   if (!enquete || !stats)
//     return (
//       <div className="p-6 text-center text-red-600">
//         {message || "Graphiques 3D indisponibles."}
//       </div>
//     );

//   const { items, scores, consensus, polarisations, distances, n_responses } =
//     stats;

//   const itemLabels = items.map((it, idx) => it.texte || `Item ${idx + 1}`);

//   // ---------------- Graphe 1 : Scores (saillance) – bulles 2D sans chevauchement ----------------

//   const nodesG1 = items.map((item, idx) => ({
//     item,
//     idx,
//     x: scores[idx],
//     r: 0.02,
//   }));

//   const placedG1 = layoutNonOverlapping(nodesG1, 0, 0.015);

//   const traceScores = {
//     x: placedG1.map((n) => n.x),
//     y: placedG1.map((n) => n.y),
//     mode: "markers+text",
//     type: "scatter",
//     text: itemLabels,
//     textposition: "top center",
//     marker: {
//       size: 10,
//       color: "#3b82f6",
//       opacity: 0.9,
//     },
//     hovertemplate:
//       "<b>%{text}</b><br>" +
//       "Score (x) : %{x:.2f}<extra></extra>",
//   };

//   const layoutScores = {
//     title: "Graphe 1 – Scores des items (saillance)",
//     xaxis: {
//       title: "Score",
//       range: [SCORE_MIN, SCORE_MAX],
//       zeroline: true,
//       zerolinecolor: "#9ca3af",
//     },
//     yaxis: {
//       visible: false,
//       range: [-0.25, 0.25],
//     },
//     margin: { l: 40, r: 20, t: 40, b: 40 },
//   };

//   // ---------------- Graphe 2 : Adhésion & consensus (bubbles 2D) sans chevauchement -------------

//   const bubbleSize2D = consensus.map((c) => {
//     const ratio = (c - CONS_MIN) / (CONS_MAX - CONS_MIN || 1);
//     return 14 + Math.max(0, Math.min(1, ratio)) * 26;
//   });

//   const nodesG2 = items.map((item, idx) => {
//     const sizePx = bubbleSize2D[idx];
//     const rLogical = 0.03 + (sizePx / 40) * 0.03;
//     return {
//       item,
//       idx,
//       x: scores[idx],
//       r: rLogical,
//       trueC: consensus[idx],
//     };
//   });

//   const placedG2 = layoutNonOverlapping(nodesG2, 0, 0.02);

//   const traceAdhCons = {
//     x: placedG2.map((n) => n.x),
//     y: placedG2.map((n) => n.y),
//     mode: "markers+text",
//     type: "scatter",
//     marker: {
//       size: bubbleSize2D,
//       color: scores,
//       colorscale: "RdBu",
//       cmin: SCORE_MIN,
//       cmax: SCORE_MAX,
//       opacity: 0.8,
//       line: { color: "rgba(0,0,0,0.4)", width: 1 },
//     },
//     text: itemLabels,
//     textposition: "top center",
//     customdata: placedG2.map((n) => n.trueC),
//     hovertemplate:
//       "<b>%{text}</b><br>" +
//       "Score (x) : %{x:.2f}<br>" +
//       "Consensus (y réel) : %{customdata:.2f}<extra></extra>",
//   };

//   const layoutAdhCons = {
//     title: "Graphe 2 – Adhésion et consensus (bubbles 2D)",
//     xaxis: {
//       title: "Score (saillance)",
//       range: [SCORE_MIN, SCORE_MAX],
//       zeroline: true,
//       zerolinecolor: "#9ca3af",
//     },
//     yaxis: {
//       visible: false,
//       range: [-0.4, 0.4],
//     },
//     margin: { l: 40, r: 20, t: 40, b: 40 },
//   };

//   // ---------------- Graphe 3 : Saillance – Consensus – Polarisations (2D, Y artificiel) --------

//   const bubbleSize3 = consensus.map((c) => {
//     const ratio = (c - CONS_MIN) / (CONS_MAX - CONS_MIN || 1);
//     return 10 + Math.max(0, Math.min(1, ratio)) * 18;
//   });

//   const nodesG3 = items.map((item, idx) => ({
//     item,
//     idx,
//     x: scores[idx],
//     r: 0.03, // rayon logique fixe pour collision
//     trueC: consensus[idx],
//   }));

//   const placedG3 = layoutNonOverlapping(nodesG3, 0, 0.025);

//   const traceSaillCons = {
//     x: placedG3.map((n) => n.x),
//     y: placedG3.map((n) => n.y),
//     mode: "markers+text",
//     type: "scatter",
//     marker: {
//       size: bubbleSize3,
//       color: scores,
//       colorscale: "RdBu",
//       cmin: SCORE_MIN,
//       cmax: SCORE_MAX,
//       opacity: 0.85,
//       line: { color: "rgba(0,0,0,0.4)", width: 1 },
//     },
//     text: itemLabels,
//     textposition: "top center",
//     customdata: placedG3.map((n) => n.trueC),
//     hovertemplate:
//       "<b>%{text}</b><br>" +
//       "Score (x) : %{x:.2f}<br>" +
//       "Consensus (y réel) : %{customdata:.2f}<extra></extra>",
//     showlegend: false,
//   };

//   const polTraces =
//     polarisations?.map((p) => {
//       const a = p.item_a_index;
//       const b = p.item_b_index;
//       const d = p.distance || 0;

//       const pa = placedG3[a];
//       const pb = placedG3[b];
//       if (!pa || !pb) return null;

//       return {
//         x: [pa.x, pb.x],
//         y: [pa.y, pb.y],
//         mode: "lines",
//         type: "scatter",
//         line: { color: "#16a34a", width: 2 },
//         hovertemplate:
//           "<b>Distance</b> : " + formatNumber(d, 3) + "<extra></extra>",
//         showlegend: false,
//       };
//     }).filter(Boolean) || [];

//   const layoutSaillCons = {
//     title:
//       "Graphe 3 – Saillance / consensus / polarisations (consensus réel dans le popup)",
//     xaxis: {
//       title: "Score (saillance)",
//       range: [SCORE_MIN, SCORE_MAX],
//       zeroline: true,
//       zerolinecolor: "#9ca3af",
//     },
//     yaxis: {
//       visible: false,
//       range: [-0.5, 0.5],
//     },
//     margin: { l: 50, r: 20, t: 40, b: 50 },
//   };

//   // ---------------- Graphe 4 : Bubble 3D saillance / consensus / distance ----------------------

//   const focalIndex = items.length > 0 ? items.length - 1 : -1;
//   const focalDistances =
//     focalIndex >= 0 && distances && distances.length
//       ? distances[focalIndex]
//       : [];

//   const z4 =
//     focalDistances && focalDistances.length === items.length
//       ? focalDistances
//       : scores.map(() => 0);

//   const bubbleSize3D = bubbleSize2D;

//   const trace3D = {
//     x: scores,
//     y: consensus,
//     z: z4,
//     mode: "markers+text",
//     type: "scatter3d",
//     marker: {
//       size: bubbleSize3D,
//       color: scores,
//       colorscale: "RdBu",
//       cmin: SCORE_MIN,
//       cmax: SCORE_MAX,
//       opacity: 0.85,
//       line: { color: "rgba(0,0,0,0.5)", width: 1 },
//     },
//     text: itemLabels,
//     textposition: "top center",
//     hovertemplate:
//       "<b>%{text}</b><br>" +
//       "Score (x) : %{x:.2f}<br>" +
//       "Consensus (y) : %{y:.2f}<br>" +
//       "Distance à l'item focal (z) : %{z:.3f}<extra></extra>",
//   };

//   const layout3D = {
//     title: `Graphe 4 – Saillance / consensus / distance (3D)`,
//     margin: { l: 0, r: 0, b: 0, t: 60 },
//     scene: {
//       xaxis: { title: "Score (saillance)", range: [SCORE_MIN, SCORE_MAX] },
//       yaxis: { title: "Consensus" },
//       zaxis: { title: `Distance à l'item ${focalIndex + 1}` },
//     },
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-8">
//       <div>
//         <h1 className="text-2xl font-bold mb-2">
//           Graphiques Plotly (2D & 3D) : {enquete.titre}
//         </h1>
//         <p className="mb-2 text-gray-700 dark:text-slate-300">{enquete.description}</p>
//         <p className="mb-4 text-sm text-gray-500">
//           Nombre de réponses prises en compte : {n_responses}
//         </p>

//         <Link to={`/enquetes/${id}/stats`} className="btn-secondary">
//           ← Retour aux statistiques
//         </Link>
//       </div>

//       {/* Graphe 1 */}
//       <section>
//         <h2 className="text-xl font-semibold mb-2">
//           Graphe 1 – Scores des items
//         </h2>
//         <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4">
//           <Plot
//             data={[traceScores]}
//             layout={layoutScores}
//             style={{ width: "100%", height: 260 }}
//             config={{ responsive: true }}
//           />
//         </div>
//       </section>

//       {/* Graphe 2 */}
//       <section>
//         <h2 className="text-xl font-semibold mb-2">
//           Graphe 2 – Adhésion et consensus (bubbles 2D)
//         </h2>
//         <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4">
//           <Plot
//             data={[traceAdhCons]}
//             layout={layoutAdhCons}
//             style={{ width: "100%", height: 260 }}
//             config={{ responsive: true }}
//           />
//         </div>
//       </section>

//       {/* Graphe 3 */}
//       <section>
//         <h2 className="text-xl font-semibold mb-2">
//           Graphe 3 – Saillance / consensus / polarisations
//         </h2>
//         <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4">
//           <Plot
//             data={[traceSaillCons, ...polTraces]}
//             layout={layoutSaillCons}
//             style={{ width: "100%", height: 320 }}
//             config={{ responsive: true }}
//           />
//         </div>
//       </section>

//       {/* Graphe 4 */}
//       <section>
//         <h2 className="text-xl font-semibold mb-2">
//           Graphe 4 – Saillance / consensus / distance (3D)
//         </h2>
//         <div className="border rounded-lg bg-white dark:bg-slate-800 shadow-sm p-4">
//           <Plot
//             data={[trace3D]}
//             layout={layout3D}
//             style={{ width: "100%", height: 420 }}
//             config={{ responsive: true }}
//           />
//         </div>
//       </section>

//       {message && (
//         <div className="mt-4 text-center text-red-600">{message}</div>
//       )}
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
// frontend/src/pages/SurveyGraphs3DECharts.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import "echarts-gl";
import api from "../services/api";

// Vérifie que le navigateur peut afficher de la 3D (WebGL)
function webglDisponible() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

const SCORE_MIN = -2;
const SCORE_MAX = 2;
const CONS_MIN = 0.05;
const CONS_MAX = 0.5;

export default function SurveyGraphs3DECharts() {
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
          err.response?.data?.detail ||
            "Erreur de chargement du graphe 3D."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Ordinateur sans WebGL : bascule automatiquement vers la carte 2D interactive
  if (!webglDisponible()) {
    return <Navigate to={`/enquetes/${id}/graphs`} replace state={{ sans3d: true }} />;
  }

  if (loading)
    return <div className="p-6 text-center text-gray-600">Chargement...</div>;
  if (!enquete || !stats)
    return (
      <div className="p-6 text-center text-red-600">
        {message || "Graphe 3D indisponible."}
      </div>
    );

  const { items, scores, consensus, distances, n_responses } = stats;

  const focalIndex = items.length > 0 ? items.length - 1 : -1;
  const focalDistances =
    focalIndex >= 0 && distances && distances.length
      ? distances[focalIndex]
      : [];

  const data = items.map((item, idx) => {
    const s = scores[idx];
    const c = consensus[idx];
    const d = focalDistances[idx] || 0;
    const ratio = (c - CONS_MIN) / (CONS_MAX - CONS_MIN || 1);
    const size = 8 + Math.max(0, Math.min(1, ratio)) * 22;
    const isFocal = idx === focalIndex;
    return {
      value: [s, c, d, size],
      name: item.texte || `Item ${idx + 1}`,
      itemStyle: {
        color: isFocal ? "#f97316" : "#3b82f6",
      },
    };
  });

  const option = {
    tooltip: {
      formatter: (params) => {
        const [s, c, d] = params.value;
        return (
          `<b>${params.name}</b><br/>` +
          `Score : ${s.toFixed(2)}<br/>` +
          `Consensus : ${c.toFixed(2)}<br/>` +
          `Distance : ${d.toFixed(3)}`
        );
      },
    },
    xAxis3D: {
      name: "Score (saillance)",
      min: SCORE_MIN,
      max: SCORE_MAX,
    },
    yAxis3D: {
      name: "Consensus",
    },
    zAxis3D: {
      name: "Distance à l'item focal",
    },
    grid3D: {
      viewControl: {
        projection: "perspective",
      },
    },
    series: [
      {
        type: "scatter3D",
        symbolSize: (val) => val[3],
        data,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Graphe 3D MAC (ECharts) : {enquete.titre}
        </h1>
        <p className="mb-2 text-gray-700">{enquete.description}</p>
        <p className="mb-4 text-sm text-gray-500">
          Nombre de réponses prises en compte : {n_responses}
        </p>

        <Link to={`/enquetes/${id}/graphs`} className="btn-secondary">
          ← Retour aux graphiques 2D
        </Link>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          Saillance – consensus – distance (3D)
        </h2>
        <ReactECharts
          option={option}
          style={{ width: "100%", height: "800px" }}
        />
      </section>

      {message && (
        <div className="mt-4 text-center text-red-600">{message}</div>
      )}
    </div>
  );
}

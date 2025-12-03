// frontend/src/pages/SurveyList.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function SurveyList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSurveys() {
      try {
        const res = await api.get("/enquetes/");
        if (isMounted) setList(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSurveys();
    return () => { isMounted = false; };
  }, []);

  const load = async () => {
    const res = await api.get("/enquetes/");
    setList(res.data);
  };

const remove = async (id) => {
  if (!window.confirm("Voulez-vous vraiment supprimer cette enquête ?")) return;
  try {
    await api.delete(`/enquetes/${id}`);
    await load();
    alert("Enquête supprimée !");
  } catch (err) {
    alert(err.response?.data?.detail || "Erreur lors de la suppression.");
  }
};

  const share = async (id) => {
    const res = await api.post(`/enquetes/${id}/share`);
    const token = res.data.token;
    const url = `${window.location.origin}/public/${token}`;
    prompt("Lien public (copiez) :", url);
  };

  if (loading) return <div className="p-6 text-center text-gray-600">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mes enquêtes</h1>

      <Link to="/enquetes/create" className="btn-primary mb-4 inline-block">
        Créer une enquête
      </Link>

      {list.length === 0 ? (
        <div className="text-gray-600 mt-6">Aucune enquête trouvée.</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Description</th>
              <th>Taille</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.titre}</td>
                <td className="p-3">{e.description}</td>
                <td className="p-3">{e.taille_liste}</td>
                <td className="p-3 flex gap-2 flex-wrap">
                  {/* Modifier */}
                  <Link to={`/enquetes/${e.id}/edit`} className="btn-secondary">Modifier</Link>

                  {/* Supprimer */}
                  <button onClick={() => remove(e.id)} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md text-sm font-semibold transition">Supprimer</button>

                  {/* Partager / Accès public */}
                  <button onClick={() => share(e.id)} className="btn-primary">Partager</button>
                  <Link to={`/public/${e.public_token}`} className="btn-secondary">Répondre</Link>

                  {/* Consulter réponses (créateur uniquement) */}
                  <Link to={`/enquetes/${e.id}/responses`} className="btn-secondary">Réponses</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

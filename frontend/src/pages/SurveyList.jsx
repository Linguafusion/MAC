/* eslint-disable no-unused-vars */
// frontend/src/pages/SurveyList.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';

export default function SurveyList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [urlToCopy, setUrlToCopy] = useState("");

  const notify = () => toast.success("Lien copié dans le presse-papier !", {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });

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
    await navigator.clipboard.writeText(url);
    setUrlToCopy(url);
    notify();
  };

  if (loading) return (
    // Loader uses transparent background to blend in
    <div className="flex items-center justify-center p-10 transition-colors duration-300">
        <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-indigo-600 border-gray-200 dark:border-gray-700 animate-spin mb-4"></div>
            <div className="text-gray-500 dark:text-gray-400 font-medium">Chargement...</div>
        </div>
    </div>
  );

  return (
    // Removed 'min-h-screen' and 'bg-' classes from here so it's transparent
    <div className="w-full p-6 md:p-10 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            {/* Title adapts automatically */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 mb-2">
              Mes Enquêtes
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Gérez vos formulaires, analysez les réponses et partagez vos liens.
            </p>
          </div>
          <Link
            to="/enquetes/create"
            className="mt-4 md:mt-0 inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white dark:text-white transition-all duration-200 bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 dark:focus:ring-offset-gray-900 active:scale-95"
          >
            <span className="mr-2 text-lg text-white dark:text-white">+</span>
            <span className="text-white dark:text-white">Créer une enquête</span>
          </Link>
        </div>

        {/* Table Container - Keeps a solid background for readability */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-300">
          {list.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4 transition-colors duration-300">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune enquête trouvée</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Commencez par créer votre première enquête ci-dessus.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-auto text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider font-semibold">
                    <th className="p-5 w-2/5">Titre de l'enquête</th>
                    <th className="p-5">Description</th>
                    <th className="p-5 text-center whitespace-nowrap">Taille</th>
                    <th className="p-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      
                      {/* Title */}
                      <td className="p-5 align-middle">
                        <div className="font-bold text-gray-800 dark:text-white text-base md:text-lg whitespace-normal max-w-full">{e.titre}</div>
                      </td>

                      {/* Description */}
                      <td className="p-5 align-middle max-w-xs">
                        <div className="text-gray-500 dark:text-gray-400 truncate text-sm">{e.description || "-"}</div>
                      </td>

                      {/* Size */}
                      <td className="p-5 align-middle text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                          {e.taille_liste} Q
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 flex-wrap xl:flex-nowrap">
                          
                          {/* Share Button */}
                          <button 
                            onClick={() => share(e.id)} 
                            title="Partager"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            {/* <span className="hidden xl:inline">Partager</span> */}
                          </button>

                          {/* Edit Button */}
                          <Link 
                            to={`/enquetes/${e.id}/edit`} 
                            title="Modifier"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-400/10 dark:hover:bg-blue-400/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {/* <span className="hidden xl:inline">Éditer</span> */}
                          </Link>
                          <button 
                            onClick={() => remove(e.id)} 
                            title="Supprimer"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-400/10 dark:hover:bg-red-400/20 transition-all"
                          >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {/* <span className="hidden xl:inline">Supprimer</span> */}
                          </button>

                           {/* View Public Link */}
                           <Link 
                            to={`/public/${e.public_token}`} 
                            title="Voir"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-sky-600 bg-sky-50 hover:bg-sky-100 dark:text-sky-400 dark:bg-sky-400/10 dark:hover:bg-sky-400/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="hidden xl:inline">Répondre</span>
                          </Link>

                          {/* Responses Link */}
                          <Link 
                            to={`/enquetes/${e.id}/responses`} 
                            title="Réponses"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-400/10 dark:hover:bg-purple-400/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                            </svg>
                            <span className="hidden xl:inline">Réponses</span>
                          </Link>
                          <Link 
                            to={`/enquetes/${e.id}/stats`} 
                            title="Analyse"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-400/10 dark:hover:bg-purple-400/20 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v14a1 1 0 001 1h3a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 011 1v11a1 1 0 001 1h3a1 1 0 001-1V3" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v7M7 16v3M17 8v11" />
                            </svg>
                            <span className="hidden xl:inline">Analyse</span>
                          </Link>

                          {/* Delete Button - With separator */}
                          {/* <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 hidden xl:block"></div> */}

                          
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

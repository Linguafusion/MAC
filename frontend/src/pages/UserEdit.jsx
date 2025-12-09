// frontend/src/pages/UserEdit.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState(null); // rôle de l'utilisateur connecté

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CREATOR");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isRootUser, setIsRootUser] = useState(false); // l'utilisateur édité est ROOT ?

  // Charger l'utilisateur courant (pour savoir s'il est ROOT ou ADMIN)
  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/users/me/");
        setCurrentRole(res.data.role); // "ROOT" ou "ADMIN"
      } catch (err) {
        console.error("Erreur /users/me/", err);
      }
    };
    loadMe();
  }, []);

  // Charger l'utilisateur à éditer
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        const u = res.data;

        setEmail(u.email);
        setRole(u.role);
        setIsActive(u.is_active);

        if (u.role === "ROOT") {
          setIsRootUser(true);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l'utilisateur");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const validate = () => {
    const errs = {};

    // Si on édite ROOT : seul le mot de passe est obligatoire
    if (isRootUser) {
      if (!password.trim()) {
        errs.password = "Le nouveau mot de passe ROOT est requis.";
      } else if (password.length < 8) {
        errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
      }
      setFieldErrors(errs);
      return Object.keys(errs).length === 0;
    }

    // Autres utilisateurs : email requis + format, password optionnel + longueur
    if (!email.trim()) {
      errs.email = "L’email est requis.";
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.trim())) {
        errs.email = "Format d’email invalide.";
      }
    }

    if (password && password.length < 8) {
      errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    if (!role) {
      errs.role = "Le rôle est requis.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    let payload = {};

    if (isRootUser) {
      payload = { password };
    } else {
      payload = {
        email: email.trim(),
        role,
        is_active: isActive,
      };
      if (password.trim() !== "") {
        payload.password = password;
      }
    }

    try {
      await api.put(`/users/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/users");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 md:p-10">
        <div className="max-w-xl mx-auto text-gray-600 dark:text-gray-300">
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/users"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Retour à la liste
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
            {isRootUser
              ? "Modifier le mot de passe ROOT"
              : "Modifier l’utilisateur"}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 17.804A4 4 0 018 17h8a4 4 0 013.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Informations utilisateur
            </h2>

            <div className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled={isRootUser}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all dark:text-white ${
                    isRootUser
                      ? "border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-75"
                      : fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-indigo-500"
                  }`}
                  required
                />
                {fieldErrors.email && !isRootUser && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isRootUser
                    ? "Nouveau mot de passe ROOT"
                    : "Nouveau mot de passe (optionnel)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isRootUser
                      ? "Obligatoire (min. 8 caractères)"
                      : "Laisser vide pour ne pas changer"
                  }
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all dark:text-white ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-indigo-500"
                  }`}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* ROLE : seulement si l'utilisateur édité n'est pas ROOT */}
              {!isRootUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rôle
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* CREATOR toujours disponible */}
                    <button
                      type="button"
                      onClick={() => setRole("CREATOR")}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        role === "CREATOR"
                          ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm"
                          : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      Créateur
                    </button>

                    {/* ADMIN seulement si l'utilisateur courant est ROOT */}
                    {currentRole === "ROOT" && (
                      <button
                        type="button"
                        onClick={() => setRole("ADMIN")}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          role === "ADMIN"
                            ? "bg-purple-50 dark:bg-purple-900/40 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm"
                            : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-purple-400"
                        }`}
                      >
                        Admin
                      </button>
                    )}
                  </div>
                  {fieldErrors.role && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.role}
                    </p>
                  )}
                </div>
              )}

              {/* ACTIVE : seulement si l'utilisateur édité n'est pas ROOT */}
              {!isRootUser && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer"
                  >
                    Compte actif
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 pb-8">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {isRootUser
                ? "Modifier le mot de passe ROOT"
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

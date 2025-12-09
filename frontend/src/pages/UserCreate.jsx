import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function UserCreate() {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CREATOR");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await axios.get("/users/me/");
        setCurrentRole(res.data.role); // "ROOT" ou "ADMIN"
      } catch (err) {
        console.error("Erreur /users/me/", err);
      }
    };
    loadMe();
  }, []);

  const validate = () => {
    const errs = {};

    // email requis + format simple
    if (!email.trim()) {
      errs.email = "L’email est requis.";
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.trim())) {
        errs.email = "Format d’email invalide.";
      }
    }

    // mot de passe requis + longueur mini
    if (!password) {
      errs.password = "Le mot de passe est requis.";
    } else if (password.length < 8) {
      errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    // rôle requis
    if (!role) {
      errs.role = "Le rôle est requis.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    try {
      const payload = {
        email: email.trim(),
        password,
        role, // "CREATOR" ou "ADMIN"
        is_active: isActive,
      };

      await axios.post("/users/", payload, {
        headers: { "Content-Type": "application/json" },
      });
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

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
            Créer un utilisateur
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          {/* CARD: Infos utilisateur */}
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
              Informations de connexion
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="utilisateur@exemple.com"
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all dark:text-white ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-indigo-500"
                  }`}
                  required
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all dark:text-white ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-indigo-500"
                  }`}
                  required
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Tout le monde peut créer un CREATOR */}
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

                  {/* Bouton Admin visible seulement si l'utilisateur courant est ROOT */}
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

              {/* Active / Inactive */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="is-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="is-active"
                  className="text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer"
                >
                  Compte actif
                </label>
              </div>
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
              Créer l’utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

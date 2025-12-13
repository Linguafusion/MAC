// frontend/src/pages/UserEdit.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { UserIcon, KeyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CREATOR");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRootUser, setIsRootUser] = useState(false);

  // Charger l'utilisateur
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/users/${id}`);
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

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    let payload = {};

    // Si c'est ROOT → seul le mot de passe est autorisé
    if (isRootUser) {
      if (password.trim() === "") {
        setError("Veuillez entrer un mot de passe pour le modifier.");
        return;
      }
      payload = { password };
    } else {
      // Utilisateur normal : email / role / active / password optionnel
      payload = {
        email,
        role,
        is_active: isActive,
      };

      if (password.trim() !== "") {
        payload.password = password;
      }
    }

    try {
      await axios.put(`/users/${id}`, payload);
      navigate("/users");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin mb-4"></div>
          <div className="text-gray-600 font-medium">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center transition-colors duration-300">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-blue-100 p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isRootUser ? "Sécurité Root" : "Modifier l'utilisateur"}
          </h1>
          <p className="text-sm text-gray-500">
            {isRootUser 
              ? "Modification du mot de passe administrateur principal." 
              : "Mettez à jour les informations et les permissions."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                disabled={isRootUser}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none transition-all ${
                  isRootUser 
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                    : "bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
                required
              />
            </div>
            {isRootUser && <p className="mt-1 text-xs text-gray-400">L'email Root ne peut pas être modifié.</p>}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRootUser ? "Nouveau mot de passe" : "Nouveau mot de passe (optionnel)"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder={isRootUser ? "Obligatoire" : "Laisser vide pour ne pas changer"}
              />
            </div>
          </div>

          {/* ROLE & ACTIVE (Masqué pour ROOT) */}
          {!isRootUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none"
                  >
                    <option value="CREATOR">CREATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer select-none">
                  Compte actif (autoriser la connexion)
                </label>
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200"
            >
              {isRootUser ? "Mettre à jour le mot de passe" : "Enregistrer les modifications"}
            </button>
            <button
               type="button"
               onClick={() => navigate("/users")}
               className="mt-4 w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
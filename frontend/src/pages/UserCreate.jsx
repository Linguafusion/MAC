// frontend/src/pages/UserCreate.jsx
import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { UserIcon, KeyIcon, ShieldCheckIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function UserCreate() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CREATOR");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            await axios.post("/users/", { email, password, role });
            navigate("/users");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Erreur lors de la création de l'utilisateur.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center transition-colors duration-300">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-blue-100 p-8 sm:p-10">
                
                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <UserPlusIcon className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                        Créer un utilisateur
                    </h1>
                    <p className="text-sm text-gray-500">
                        Ajoutez un nouveau membre à l'équipe d'administration.
                    </p>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center animate-fade-in">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="exemple@mac-enquete.ma"
                                required
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input 
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* ROLE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="CREATOR">CREATOR (Créateur d'enquêtes)</option>
                                <option value="ADMIN">ADMIN (Accès complet)</option>
                            </select>
                            {/* Petite flèche personnalisée pour le select */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* BOUTONS */}
                    <div className="pt-4 space-y-3">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création en cours...
                                </span>
                            ) : "Créer l'utilisateur"}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate("/users")}
                            className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
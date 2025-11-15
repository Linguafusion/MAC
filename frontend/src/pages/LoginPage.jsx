// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
// CORRECTION : Remplacement de LoginIcon par le nom actuel (ArrowRightOnRectangleIcon)
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();

    if (currentUser) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // NOTE: Assurez-vous que votre fonction login(email, password) gère correctement la connexion API
            await login(email, password);
            navigate('/');
        } catch (err) {
            // Gestion d'erreur améliorée
            setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-16">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all duration-500 hover:shadow-indigo-500/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                        {/* Utilisation de la nouvelle icône */}
                        <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                        Connexion à la Plateforme
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Utilisez votre compte universitaire.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Adresse e-mail
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="exemple@univ.ma"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm transition duration-300" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary w-full flex items-center justify-center mt-6"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
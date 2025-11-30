/* eslint-disable no-unused-vars */
// src/pages/HomePage.jsx
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import pic1 from "../assets/LogoUIZ.png";

import {
  PlusCircleIcon,
  DocumentTextIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

// Composant ActionCard (inchangé)
const ActionCard = ({
  to,
  label,
  colorClass,
  action,
  icon: Icon,
  delayClass = "delay-[0ms]",
}) => (
  <Link
    to={to}
    onClick={action}
    className={`flex flex-col items-center justify-center p-6 rounded-2xl transition transform hover:scale-[1.03] duration-300 ease-in-out ${colorClass} text-white font-semibold text-center hover:shadow-2xl 
            opacity-0 translate-y-4 animate-fade-in ${delayClass}`}
    style={{ animationDuration: "0.6s", animationFillMode: "forwards" }}
  >
    <Icon className="h-10 w-10 mb-3 text-white" />
    <span className="text-lg text-white">{label}</span>
  </Link>
);

const HomePage = () => {
  const { currentUser, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] text-2xl text-gray-500 dark:text-gray-500">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Chargement...
      </div>
    );
  }

  return (
    <div className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      {/* logo ibn zohr */}
      <header
        className="text-center mb-16 opacity-0 -translate-y-2.5 animate-fade-in delay-200"
        style={{ animationDuration: "0.8s", animationFillMode: "forwards" }}
      >
        <img
          class="rounded-lg h-30 mx-auto mb-5"
          src={pic1}
          alt="office content 1"
        />
        <p className="text-7xl animate-bounce font-medium text-indigo-800 dark:text-indigo-600 uppercase mb-2">
          Bienvenue
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold  mb-4  drop-shadow-lg">
          <span className="text-dark">Plateforme d’Enquêtes</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {" "}
            Statistiques
          </span>{" "}
          MAC
        </h1>
        <p className="text-xl max-w-3xl mx-auto">
          Votre outil moderne et sécurisé pour la conception, la collecte et
          l'analyse de données de recherche universitaire au Maroc.
        </p>
      </header>

      <main
        className="max-w-5xl mx-auto opacity-0 translate-y-4 animate-fade-in delay-500"
        style={{ animationDuration: "0.8s", animationFillMode: "forwards" }}
      >
        {currentUser ? (
          <div
            className="
  p-8 sm:p-10 rounded-3xl shadow-2xl border 
  bg-linear-to-br from-blue-200 via-indigo-200 to-blue-300
  dark:from-slate-800 dark:via-slate-900 dark:to-slate-950
  border-indigo-300 dark:border-slate-700
  animate-glow-pulse
"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300 mb-2">
                Espace Utilisateur
              </h2>

              <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">
                Connecté en tant que{" "}
                <span className="font-bold text-indigo-600 dark:text-blue-400">
                  {currentUser.email}
                </span>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 1. Light Blue (Bleu Ciel) */}
              <ActionCard
                to="/enquetes"
                label="Créer une nouvelle enquête"
                icon={PlusCircleIcon}
                colorClass="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/50"
                delayClass="delay-[700ms]"
              />

              {/* 2. Same Color (Indigo) */}
              <ActionCard
                to="/dashboard"
                label="Gérer mes enquêtes"
                icon={DocumentTextIcon}
                colorClass="bg-sky-500 hover:bg-sky-600 shadow-sky-500/50"
                delayClass="delay-[1000ms]"
              />

              {/* 3. Blue going to Purple (Dégradé) */}
              <ActionCard
                to="#"
                label="Se déconnecter"
                icon={ArrowLeftCircleIcon}
                colorClass="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-purple-500/50 border-0"
                action={logout}
                delayClass="delay-[1200ms]"
              />
            </div>
          </div>
        ) : (
          /* Vue utilisateur déconnecté */
          // 🔑 MODIFICATION : Utilisation de la nouvelle classe très visible
          <div className="bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 text-center animate-glow-pulse">
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8 font-semibold">
              Accédez à la puissance des outils de recherche sécurisés.
            </p>
            <Link
              to="/login"
              className="btn-primary inline-flex items-center text-xl px-10 py-3 shadow-lg shadow-indigo-500/30 transition duration-300 hover:shadow-indigo-500/50"
            >
              <ArrowRightCircleIcon className="h-6 w-6 mr-2" />
              Commencer ici
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;

/* eslint-disable no-unused-vars */
// src/pages/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logoUIZ from "../assets/LogoUIZ.png";
import logoLARSLAM from "../assets/LogoLARSLAM.png";
import logoAUF from "../assets/LogoAUF.png";

import {
  PlusCircleIcon,
  DocumentTextIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const FEATURES = [
  {
    icon: ClipboardDocumentListIcon,
    title: "Création d'enquêtes",
    text: "Questions obligatoires en classement (−2 à +2) et questions optionnelles : texte libre, oui/non, choix unique ou multiple.",
  },
  {
    icon: ShareIcon,
    title: "Collecte par lien",
    text: "Un lien public, sans compte pour les répondants. La saisie des feuilles papier est possible pour les enquêtes de terrain.",
  },
  {
    icon: ChartBarIcon,
    title: "Analyse MAC",
    text: "Scores, consensus, distances entre items et schéma en couronnes, avec export des graphiques en SVG.",
  },
];

const STEPS = [
  { n: "1", title: "Créer", text: "Rédigez vos questions et vos propositions." },
  { n: "2", title: "Partager", text: "Copiez le lien public et envoyez-le aux répondants." },
  { n: "3", title: "Collecter", text: "Les réponses arrivent au fil de l'eau, ou par saisie papier." },
  { n: "4", title: "Analyser", text: "Consultez les statistiques et exportez vos graphiques." },
];

const Spinner = () => (
  <div className="flex items-center justify-center h-[calc(100vh-80px)] text-2xl text-gray-500 dark:text-gray-400">
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Chargement...
  </div>
);

// Aperçu décoratif (illustration, pas de données réelles)
const Illustration = () => (
  <div className="relative rounded-3xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 shadow-xl p-6">
    <svg viewBox="0 0 320 240" className="w-full h-auto" aria-hidden="true">
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="120" r="110" fill="url(#halo)" />
      <line x1="40" y1="120" x2="280" y2="120" stroke="#c7d2fe" strokeWidth="2" />
      <line x1="160" y1="20" x2="160" y2="220" stroke="#e0e7ff" strokeWidth="2" strokeDasharray="4 4" />
      <line x1="90" y1="70" x2="235" y2="150" stroke="#22c55e" strokeWidth="2" opacity="0.7" />
      <line x1="90" y1="70" x2="130" y2="180" stroke="#22c55e" strokeWidth="2" opacity="0.7" />
      <circle cx="90" cy="70" r="26" fill="#6366f1" opacity="0.85" />
      <circle cx="235" cy="150" r="18" fill="#0ea5e9" opacity="0.85" />
      <circle cx="130" cy="180" r="14" fill="#a855f7" opacity="0.85" />
      <circle cx="200" cy="80" r="10" fill="#f59e0b" opacity="0.85" />
      <circle cx="60" cy="150" r="12" fill="#10b981" opacity="0.85" />
      <text x="90" y="74" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="600">Item A</text>
      <text x="235" y="154" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">B</text>
    </svg>
    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
      Aperçu illustratif de la représentation des items
    </p>
  </div>
);

const ActionCard = ({ to, label, icon: Icon, className = "", onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group flex flex-col items-start gap-3 rounded-2xl p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`}
  >
    <Icon className="h-9 w-9 text-white/90" />
    <span className="text-lg font-semibold">{label}</span>
    <span className="mt-auto inline-flex items-center text-sm text-white/80 group-hover:text-white">
      Accéder <ArrowRightIcon className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
    </span>
  </Link>
);

const HomePage = () => {
  const { currentUser, logout, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "ROOT";

  return (
    <div className="pb-20">
      {/* En-tête institutionnel : Université Ibn Zohr, LaRSLAM, AUF */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-3xl border border-indigo-100 bg-white px-6 py-6 shadow-md dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:justify-between sm:px-10">
          <div className="flex items-center gap-5">
            <img src={logoUIZ} alt="Université Ibn Zohr Agadir" className="h-24 w-auto sm:h-28" />
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Université Ibn Zohr · Agadir
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">Laboratoire LaRSLAM</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Plateforme MAC · Méthode d'analyse combinée
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <img src={logoLARSLAM} alt="LaRSLAM" className="h-16 w-auto" />
            <img src={logoAUF} alt="Agence universitaire de la Francophonie" className="h-16 w-auto" />
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/30" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="opacity-0 translate-y-4 animate-fade-in" style={{ animationDuration: "0.8s", animationFillMode: "forwards" }}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Plateforme d'enquêtes <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">MAC</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Concevez vos enquêtes, collectez les réponses par un lien public, puis obtenez automatiquement
              scores, consensus et graphiques exportables pour votre recherche.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {currentUser ? (
                <Link to="/enquetes/create" className="btn-primary inline-flex items-center px-8 py-3 text-lg">
                  <PlusCircleIcon className="mr-2 h-6 w-6" />
                  Nouvelle enquête
                </Link>
              ) : (
                <Link to="/login" className="btn-primary inline-flex items-center px-8 py-3 text-lg">
                  <ArrowRightCircleIcon className="mr-2 h-6 w-6" />
                  Se connecter
                </Link>
              )}
              <Link
                to="/about"
                className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                En savoir plus
              </Link>
            </div>
          </div>

          <div className="opacity-0 translate-y-4 animate-fade-in" style={{ animationDuration: "0.9s", animationDelay: "150ms", animationFillMode: "forwards" }}>
            <Illustration />
          </div>
        </div>
      </section>

      {/* Espace utilisateur connecté */}
      {currentUser && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-10">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bonjour</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Connecté en tant que <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentUser.email}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ActionCard
                to="/enquetes/create"
                label="Créer une enquête"
                icon={PlusCircleIcon}
                className="bg-gradient-to-br from-indigo-600 to-indigo-700"
              />
              <ActionCard
                to="/enquetes"
                label="Mes enquêtes"
                icon={DocumentTextIcon}
                className="bg-gradient-to-br from-sky-500 to-sky-600"
              />
              {isAdmin ? (
                <ActionCard
                  to="/users"
                  label="Gérer les utilisateurs"
                  icon={UserGroupIcon}
                  className="bg-gradient-to-br from-purple-600 to-indigo-700"
                />
              ) : (
                <ActionCard
                  to="/"
                  label="Se déconnecter"
                  icon={ArrowLeftCircleIcon}
                  className="bg-gradient-to-br from-slate-600 to-slate-800"
                  onClick={logout}
                />
              )}
            </div>
            {isAdmin && (
              <div className="mt-6 text-right">
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-800 hover:underline dark:text-gray-400 dark:hover:text-white"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Fonctionnalités */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Tout pour votre enquête</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            De la conception à l'analyse, la plateforme couvre le cycle complet de la méthode MAC.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Étapes */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">De l'enquête à l'analyse en 4 étapes</h2>
        </div>
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="relative rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 font-bold text-white">
                {s.n}
              </span>
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Appel à l'action (visiteurs) */}
      {!currentUser && (
        <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-cyan-500 p-10 text-center text-white shadow-2xl sm:p-14">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Prêt à lancer votre enquête ?</h2>
            <p className="max-w-2xl text-lg text-white/90">
              Connectez-vous à votre espace de recherche. Les comptes sont créés par l'administrateur de la plateforme.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl bg-white px-8 py-3 text-lg font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Se connecter
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

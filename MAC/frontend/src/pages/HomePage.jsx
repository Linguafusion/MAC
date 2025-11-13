// frontend/src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { BarChart3, Calculator, FileText, Menu, X } from 'lucide-react';

const HomePage = () => {
  const { currentUser, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-xl text-cyan-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-cyan-500/20 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">MAC Enquêtes</h1>
                <p className="text-xs text-cyan-400">Méthode d'Analyse Combinatoire</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              {currentUser ? (
                <>
                  <span className="text-slate-300 text-sm">Bonjour, {currentUser.email}</span>
                  <button
                    onClick={logout}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition"
                  >
                    Déconnexion
                  </button>
                  <Link
                    to="/create-enquete"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition"
                  >
                    Créer Enquête
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/50 transition"
                >
                  Se Connecter
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-3 animate-fadeIn">
              {currentUser ? (
                <>
                  <p className="text-slate-300 text-sm">Bonjour, {currentUser.email}</p>
                  <button
                    onClick={logout}
                    className="w-full px-6 py-2 bg-red-600 text-white rounded-lg font-medium text-sm"
                  >
                    Déconnexion
                  </button>
                  <Link
                    to="/create-enquete"
                    className="block w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium text-sm"
                  >
                    Créer Enquête
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium text-sm"
                >
                  Se Connecter
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-medium">Outils de Recherche de Nouvelle Génération</span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Renforcez Votre
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Intelligence de Recherche
            </span>
          </h2>

          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Transformez les données en insights avec des questionnaires avancés, des calculs puissants et des visualisations intelligentes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={currentUser ? "/create-enquete" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition hover:scale-105"
            >
              {currentUser ? "Créer une Enquête" : "Commencer l'Exploration"}
            </Link>
            <button className="px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white rounded-lg font-semibold hover:border-cyan-500/50 transition">
              Voir la Démo
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <FileText className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Questionnaires</h3>
              <p className="text-slate-400 mb-6">Logique adaptative, validation en temps réel.</p>
              <Link to="/create-enquete" className="text-cyan-400 font-medium text-sm hover:text-cyan-300 flex items-center">
                Explorer <span className="ml-2 group-hover:translate-x-1 transition">→</span>
              </Link>
            </div>

            <div className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Calculator className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Calculs</h3>
              <p className="text-slate-400 mb-6">Formules personnalisées, traitement par lot.</p>
              <a href="#" className="text-blue-400 font-medium text-sm hover:text-blue-300 flex items-center">
                Explorer <span className="ml-2 group-hover:translate-x-1 transition">→</span>
              </a>
            </div>

            <div className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <BarChart3 className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Graphiques</h3>
              <p className="text-slate-400 mb-6">Tableaux de bord interactifs en temps réel.</p>
              <a href="#" className="text-purple-400 font-medium text-sm hover:text-purple-300 flex items-center">
                Explorer <span className="ml-2 group-hover:translate-x-1 transition">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 rounded-3xl p-12 text-center backdrop-blur-sm">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à Accélérer Votre Recherche?
            </h3>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de chercheurs dans le monde.
            </p>
            <Link
              to={currentUser ? "/create-enquete" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition hover:scale-105"
            >
              Commencer Aujourd'hui
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 MAC Enquêtes. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
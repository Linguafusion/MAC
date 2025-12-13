import React from "react";
import { 
  AcademicCapIcon, 
  LightBulbIcon, 
  ShieldCheckIcon, 
  UserGroupIcon 
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function About() {
  return (
    // FORCE LE FOND BLEU CLAIR (bg-blue-50) MÊME EN MODE SOMBRE
    <div className="min-h-screen bg-blue-50 text-gray-900 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden pt-16 pb-24 text-center px-4 sm:px-6 lg:px-8">
        {/* Force le texte en noir/gris même en mode sombre */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">MAC Enquête</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-600">
          L'alliance de la rigueur scientifique et de la technologie numérique au service de l'analyse des représentations sociales.
        </p>
      </div>

      {/* 2. NOTRE MISSION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Texte */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Une plateforme née de la recherche
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              MAC Enquête n'est pas un simple outil de sondage. C'est la matérialisation numérique de la <strong>Méthode d'Analyse Combinée (MAC)</strong>, développée initialement par les chercheurs en sociolinguistique pour cartographier avec précision ce que les gens pensent réellement.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-justify">
              Porté par l'<strong>Université d'Agadir</strong>, ce projet vise à offrir aux chercheurs, étudiants et professionnels un outil puissant, intuitif et mathématiquement validé pour collecter et traiter des données complexes en quelques clics.
            </p>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-lg"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Étudiants universitaires" 
              className="relative rounded-2xl shadow-2xl border border-blue-100 w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 3. NOS VALEURS */}
      {/* Fond bleu clair continu */}
      <div className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir notre plateforme ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 shadow-lg border border-blue-100">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <AcademicCapIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rigueur Scientifique</h3>
              <p className="text-gray-600">
                Basée sur des algorithmes validés par la recherche universitaire pour garantir des résultats exploitables.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 shadow-lg border border-blue-100">
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <LightBulbIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation UX</h3>
              <p className="text-gray-600">
                Une interface moderne qui rend la création d'enquêtes complexes simple et agréable pour tous.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 shadow-lg border border-blue-100">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Données Sécurisées</h3>
              <p className="text-gray-600">
                Vos données et celles de vos participants sont protégées avec les standards de sécurité actuels.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION ÉQUIPE */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-blue-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Qui sommes-nous ?
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
          Derrière cette plateforme se cache une équipe multidisciplinaire de développeurs, designers et chercheurs passionnés.
        </p>
        
        <Link 
          to="/team"
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
        >
          <UserGroupIcon className="w-5 h-5 mr-2" />
          Découvrir notre équipe
        </Link>
      </div>

    </div>
  );
}
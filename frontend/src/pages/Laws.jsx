import React from "react";
import { 
  ScaleIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CpuChipIcon, 
  LockClosedIcon, 
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

export default function Terms() {
  return (
    // FOND BLEU CLAIR (bg-blue-50) pour respecter la charte graphique
    <div className="min-h-screen bg-blue-50 text-gray-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* 1. EN-TÊTE */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 text-blue-600">
            <ScaleIcon className="w-9 h-9" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Propriété <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Intellectuelle</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tous les contenus présents sur la plateforme du projet de recherche (textes, données, images, rapports, analyses, outils, codes, documents) sont protégés par la loi.
        </p>
      </div>

      {/* 2. CONTENU DES RÈGLES */}
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Article 1 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">1. Propriété des contenus</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Les contenus appartiennent à l’équipe de recherche, à l’institution du projet ou aux auteurs qui les ont créés.</li>
                <li>Ils ne peuvent pas être copiés, modifiés, partagés ou réutilisés sans autorisation écrite.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article 2 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <ScaleIcon className="w-8 h-8 text-purple-500" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">2. Usage autorisé</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>L’utilisateur peut consulter les contenus uniquement pour les besoins du projet.</li>
                <li>Toute utilisation extérieure (diffusion, publication, partage, usage commercial) est <strong>strictement interdite</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article 3 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <UserGroupIcon className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">3. Contributions des membres</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Les documents déposés par les chercheurs restent leur propriété.</li>
                <li>L’équipe du projet peut toutefois les utiliser en interne pour le bon fonctionnement du projet.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Article 4 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <CpuChipIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">4. Données et outils</h2>
              <p className="text-gray-600 mb-2">Les données, codes, modèles, scripts et outils hébergés sont protégés.</p>
              <p className="text-gray-600 font-medium">Il est interdit de les télécharger, copier, redistribuer ou décompiler.</p>
            </div>
          </div>
        </div>

        {/* Article 5 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <LockClosedIcon className="w-8 h-8 text-amber-500" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">5. Confidentialité</h2>
              <p className="text-gray-600">
                Certaines informations présentes sur cette plateforme sont confidentielles et ne doivent en aucun cas être partagées avec des tiers non autorisés.
              </p>
            </div>
          </div>
        </div>

        {/* Article 6 - Sanctions (Style légèrement différent pour l'avertissement) */}
        <div className="bg-red-50 rounded-2xl p-8 shadow-sm border border-red-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-bold text-red-700 mb-2">6. Sanctions</h2>
              <p className="text-red-800 font-medium">
                Toute violation des présentes règles entraîne la suspension immédiate de l’accès et peut entraîner des poursuites judiciaires.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer simple */}
      <div className="text-center mt-16 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MAC Enquête - Tous droits réservés.</p>
      </div>

    </div>
  );
}
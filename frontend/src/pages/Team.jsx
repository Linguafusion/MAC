import React from 'react';

// Données de l'équipe (Vous pouvez modifier les infos ici)
const teamMembers = [
  {
    id: 1,
    name: "Nom Prénom",
    role: "Chef de Projet & Développeur Fullstack",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    description: "Passionné par les technologies web, il a coordonné le développement de la plateforme et supervisé l'architecture technique."
  },
  {
    id: 2,
    name: "Nom Prénom",
    role: "Designer UI/UX",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    description: "Responsable de l'identité visuelle, elle s'assure que l'expérience utilisateur soit fluide, intuitive et esthétique."
  },
  {
    id: 3,
    name: "Nom Prénom",
    role: "Analyste de Données",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    description: "Expert en statistiques, il a conçu les modèles d'analyse combinée pour traiter les réponses des enquêtes avec précision."
  },
  // Vous pouvez ajouter d'autres membres ici...
];

function Team() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête avec le paragraphe en français */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 mb-6">
            Notre Équipe
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Ce projet est le fruit du travail, de la réflexion et de la collaboration d'une équipe passionnée. 
              Nous avons uni nos compétences techniques et scientifiques pour concevoir cette plateforme innovante, 
              dédiée à l'analyse rigoureuse des représentations sociales.
            </p>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>

        {/* Grille des membres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-gray-100"
            >
              {/* Image Container */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                 {/* La photo est positionnée à cheval sur le fond coloré et le contenu blanc */}
                 <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                    />
                 </div>
              </div>

              {/* Contenu de la carte */}
              <div className="pt-20 pb-8 px-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
                  {member.role}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {member.description}
                </p>
                
                {/* Icônes réseaux sociaux (Optionnel) */}
                <div className="flex justify-center mt-6 space-x-4">
                  <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-100 transition">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </span>
                  <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-100 transition">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Team;
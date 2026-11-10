import React from 'react';
import pic1 from '../assets/Elmadhipic.jpeg';
import pic2 from '../assets/Brunopic.jpeg';
import pic3 from '../assets/Giovannipic.jpg';
import pic4 from '../assets/Desrousseauxpic.jpeg';


import pic7 from '../assets/Souhailpic.jpeg';

// Données de l'équipe
// Les liens "linkedin" et "facebook" ne s'affichent que s'ils sont renseignés.
const teamMembers = [
  {
    id: 1,
    name: "Elmadhi Adil",
    role: "Chef de projet et directeur du laboratoire LARSLAM",
    image: pic1,
    description: "Figure majeure dans le domaine de la didactique des langues, de l’éducation et des humanités numériques au Maroc, je suis chercheur engagé, coordonnant un laboratoire de recherche et assumant plusieurs responsabilités institutionnelles, avec un rôle central dans l’innovation pédagogique et la transformation du système éducatif.",
    linkedin: "https://www.linkedin.com/in/adil-elmadhi-a2aab05b/"
  },
  {
    id: 2,
    name: "Maurer Bruno",
    role: "Co-coordinateur de projet",
    image: pic2,
    description: "Bruno Maurer est sociolinguiste, grammairien et didacticien des langues étrangères et premières. Il a développé la MAC entre 1998 et 2013 pour étudier les représentations des langues en Afrique. La méthodologie peut être utilisée pour d'autres objets de représentations.",

  },
  {
    id: 3,
    name: "Giovanni Agresti",
    role: "Professeur à l’université, ancien directeur de l’AUF Afrique du Nord",
    image: pic3,
    description: "Sociolinguiste et chercheur italien, Giovanni Agresti se spécialise dans la diversité linguistique, les droits linguistiques et la francophonie. Il est fondateur du réseau POCLANDE et coordonne des projets visant à promouvoir le plurilinguisme et le développement social des communautés linguistiques. Ses travaux combinent recherche académique et engagement pour l’intercompréhension entre langues et la valorisation des langues minoritaires.",

  },
  {

    id: 4,
    name: "Pierre-Antoine Desrousseaux",
    role: "Professeur universitaire de mathématiques, membre de l’équipe",
    image: pic4,
    description: "Professeur agrégé et docteur en mathématiques. Enseignant en statistiques à l'IUT de Béziers. Auteur des formules de calcul utilisées par la MAC.",

  },
  {
    id: 9,
    name: "Nouassi Souhail",
    role: "Membre de l'équipe",
    image: pic7,
    description: "Étudiant curieux et motivé, je développe parallèlement des compétences dans le digital afin de créer des ponts entre les langues, la communication et l’innovation. Organisé et réfléchi, j’allie rigueur et créativité dans mes projets.",
    linkedin: ""
  },
];

function Team() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          {/* Correction: bg-gradient-to-r au lieu de bg-linear-to-r */}
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 mb-6">
            Notre Équipe
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 dark:text-slate-400 leading-relaxed">
              Ce projet est le fruit du travail, de la réflexion et de la collaboration d'une équipe passionnée.
              Nous avons uni nos compétences techniques et scientifiques pour concevoir cette plateforme innovante.
            </p>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-gray-100"
            >

              {/* Correction: bg-gradient-to-r */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                 <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                    />
                 </div>
              </div>

              <div className="pt-20 pb-8 px-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-4">
                  {member.role}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {member.description}
                </p>

                {/* Profils professionnels : affichés seulement s'ils sont renseignés */}
                {(member.linkedin || member.facebook) && (
                  <div className="flex justify-center mt-6 space-x-4">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Profil LinkedIn de ${member.name}`}
                        title="LinkedIn"
                        className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-300 cursor-pointer hover:bg-blue-100 transition"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                    )}
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Profil Facebook de ${member.name}`}
                        title="Facebook"
                        className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-300 cursor-pointer hover:bg-blue-100 transition"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/></svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Remerciements */}
        <div className="mt-16 max-w-3xl mx-auto text-center border-t border-gray-200 pt-8">
          <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
            Nous remercions chaleureusement les personnes qui ont contribué à ce projet :
            Chakhrati Samar, Lakhdar Mohammed, Mustapha et Driss.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Team;

import React from 'react';
import pic1 from '../assets/Elmadhipic.jpeg';
import pic2 from '../assets/Brunopic.jpeg';
import pic3 from '../assets/Giovannipic.jpg';
import pic4 from '../assets/Desrousseauxpic.jpeg'; 
import pic5 from '../assets/Samarpic.jpeg';            
import pic6 from '../assets/Lakhdarpic.jpeg';       
import pic7 from '../assets/Souhailpic.jpeg';        

// Données de l'équipe
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
    name: "Agresti Giovanni",
    role: "Professeur à l’université, ancien directeur de l’AUF Afrique du Nord",
    image: pic3,
    description: "Sociolinguiste et chercheur italien, Giovanni Agresti se spécialise dans la diversité linguistique, les droits linguistiques et la francophonie. Il est fondateur du réseau POCLANDE et coordonne des projets visant à promouvoir le plurilinguisme et le développement social des communautés linguistiques. Ses travaux combinent recherche académique et engagement pour l’intercompréhension entre langues et la valorisation des langues minoritaires.",
   
  },
  {
   
    id: 4,
    name: "Desrousseaux Pierre-Antoine.", 
    role: "Mathématicien, membre de l’équipe", 
    image: pic4,
    description: "Professeur agrégé et docteur en mathématiques. Enseignant en statistiques à l'IUT de Béziers. Auteur des formules de calcul utilisées par la MAC.",
    
  },
 {
    id: 5,
    name: "Mustapha",
    role: "Ingénieur informaticien",
    image:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", 
    description: "Ingénieur informaticien spécialisé dans la conception, le développement et l’optimisation de solutions numériques. J’assure la gestion technique des systèmes informatiques, le développement d’applications et la résolution de problèmes complexes pour garantir performance, sécurité et innovation.",
    
},
{
    id: 6,
    name: "Driss",
    role: "Ingénieur informaticien",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
    description: "Ingénieur informaticien, je conçois et améliore des systèmes et applications informatiques adaptés aux besoins des utilisateurs. J’interviens dans le développement, la maintenance et l’optimisation de solutions numériques afin d’assurer leur efficacité, leur sécurité et leur fiabilité.",
    linkedin: ""
},
  {
    id: 7,
    name: "Chakhrati Samar",
    role: "Docteur en technologie éducative, membre de l'équipe",
    image: pic5,
    description: "Samar Chakhrati est chercheuse en langue et communication, spécialisée dans l’intégration du numérique au service du développement des compétences langagières et psychosociales des étudiants.",
    linkedin: ""
  },
  {
    id: 8,
    name: "Lakhdar Mohammed",
    role: "Membre de l'équipe",
    image: pic6,
    description: "Étudiant en 4ᵉ année de médecine et artiste amateur, je développe parallèlement des compétences dans le digital afin de créer des ponts entre la santé, la technologie et l’innovation.",
    linkedin: "https://www.linkedin.com/in/mohamed-lakdhar-theflame888/"
  },
  {
    id: 9,
    name: "Nouassi Souhail",
    role: "Membre de l'équipe",
    image: pic7,
    description: "Étudiant curieux et motivé, je développe parallèlement des compétences dans le digital afin de créer des ponts entre les langues, la communication et l’innovation. Organisé et réfléchi, j’allie rigueur et créativité dans mes projets.",
    linkedin: "https://www.linkedin.com/in/souhail-nou-34a6b0311/"
  },
];

function Team() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          {/* Correction: bg-gradient-to-r au lieu de bg-linear-to-r */}
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600 mb-6">
            Notre Équipe
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
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
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300 border border-gray-100"
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
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">
                  {member.role}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {member.description}
                </p>
                
                {/* LinkedIn Link Logic */}
                {member.linkedin && (
                  <div className="flex justify-center mt-6 space-x-4">
                    <a 
                      href={member.linkedin}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-100 transition"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Team;
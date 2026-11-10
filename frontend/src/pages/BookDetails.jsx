import React from "react";
import pic from "../assets/BookBMaurer.png";

export const BookDetails = () => {
  return (
    <div className="min-h-screen  pt-12 pb-20 px-4 sm:px-6 lg:px-8 flex justify-center">
      <article
        className="max-w-3xl w-full bg-linear-to-b from-blue-100 to-white shadow-xl rounded-2xl overflow-hidden p-8 sm:p-12 opacity-0 -translate-y-2.5 animate-fade-in delay-200"
        style={{ animationDuration: "0.8s", animationFillMode: "forwards" }}
      >
        {/* Titre Principal en Bleu */}
        <header className="text-center mb-10 border-b border-blue-100 pb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 mb-4 leading-tight">
            La Méthode d'analyse combinée des représentations sociales
          </h1>
        </header>

        {/* Introduction */}
        <div className="space-y-8 text-gray-700 dark:text-slate-300 leading-relaxed">
          <p className="text-justify">
            Développée par Bruno Maurer (Laboratoire Dipralang de Montpellier 3
            et Université de Lausanne) pour étudier les représentations des
            langues, la Méthode d'analyse combinée (MAC) permet de répondre à
            ces questions de manière rigoureuse et innovante et peut être
            utilisée pour étudier les représentations sociales d’autres objets.
          </p>
          <img
            className="rounded-lg w-96 mb-5"
            src={pic}
            alt="office content 1"
          />
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-blue-800 mb-3">
              Une approche qui va au-delà des apparences
            </h2>
            <p className="text-justify">
              Contrairement aux méthodes classiques qui se contentent de
              recueillir des opinions, la MAC dévoile la structure profonde des
              représentations. Elle distingue ce qui est vraiment important aux
              yeux des locuteurs de ce qui est secondaire ou marginal. La
              démarche de Bruno Maurer s’inscrit directement dans le paradigme
              des représentations sociales développé en psychologie sociale à
              Aix-en-Provence, notamment par Jean-Claude Abric. Elle applique ce
              cadre théorique — centré sur le noyau central et le système
              périphérique — à l’analyse des perceptions et discours sur les
              langues. Le type d'enquête développé peut être appliqué à d'autres
              objets et disciplines, en sociologie, psychologie sociale,
              sciences politiques, sciences de l'éducation, humanités
              numériques, etc.
            </p>
          </section>

          {/* Section 2: Comment ça marche (Fond blanc pur pour contraste avec le dégradé ciel) */}
          <section className="bg-white dark:bg-slate-800/60 p-6 rounded-xl border border-blue-100 shadow-sm">
            <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">
              Comment ça marche ?
            </h2>
            <p className="mb-4">
              La méthode se déroule en trois temps simples :
            </p>
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Recueil des perceptions :</strong> les participants
                expriment librement ce qu'évoque pour eux une langue donnée.
              </li>
              <li>
                <strong>Questionnaire ciblé :</strong> ils évaluent ensuite une
                série de propositions en les notant.
              </li>
              <li>
                <strong>Analyse combinée :</strong> trois dimensions sont
                mesurées simultanément pour chaque élément :
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 dark:text-slate-400">
                  <li>
                    L'adhésion : à quel point cette idée caractérise la langue
                  </li>
                  <li>
                    Le consensus : les membres du groupe sont-ils d'accord entre
                    eux
                  </li>
                  <li>
                    Les distances : quelles idées sont associées entre elles
                  </li>
                </ul>
              </li>
            </ol>
          </section>

          {/* Section 3: Résultats */}
          <section>
            <h2 className="text-xl font-bold text-blue-800 mb-3">
              Des résultats visuels et exploitables
            </h2>
            <p className="mb-3">
              L'analyse produit des graphiques et schémas qui révèlent quatre
              zones distinctes dans la représentation :
            </p>
            <ul className="grid sm:grid-cols-2 gap-4">
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-blue-500 shadow-sm">
                <strong>• La zone de centralité maximum :</strong> le cœur
                stable et partagé de la représentation
              </li>
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-blue-400 shadow-sm">
                <strong>• La couronne centrale :</strong> les éléments
                moyennement consensuels, susceptibles d'évoluer
              </li>
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-blue-300 shadow-sm">
                <strong>• La périphérie incertaine :</strong> les éléments sur
                lesquels le groupe est divisé
              </li>
              <li className="bg-white dark:bg-slate-800 p-3 rounded-lg border-l-4 border-gray-300 shadow-sm">
                <strong>• La périphérie marginale :</strong> ce qui est
                fortement rejeté, définissant la représentation "en creux"
              </li>
            </ul>
          </section>

          {/* Section 4: Pourquoi utiliser */}
          <section>
            <h2 className="text-xl font-bold text-blue-800 mb-3">
              Pourquoi utiliser la MAC ?
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">✓</span>{" "}
                Fiabilité : combine approches qualitative et quantitative
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">✓</span>{" "}
                Précision : identifie ce qui compte vraiment pour les locuteurs
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">✓</span>{" "}
                Comparabilité : permet d'étudier différents groupes ou
                situations
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2 font-bold">✓</span> Utilité
                pratique : aide à concevoir des politiques en lien avec les
                représentations
              </li>
            </ul>
          </section>

          {/* Section 5: Applications */}
          <section>
            <h2 className="text-xl font-bold text-blue-800 mb-3">
              Applications concrètes
            </h2>
            <p className="text-justify mb-4">
              La MAC a été testée avec succès dans de nombreux contextes
              francophones (Madagascar, Sénégal, etc.) pour comprendre des
              idéologies linguistiques en situation de multilinguisme. Son
              utilisation peut s’étendre à d’autres objets que les langues. Un
              outil unique pour saisir la complexité des représentations et
              éclairer des décisions.
            </p>
            <p className="text-base text-justify text-black italic bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-100">
              Outillée mathématiquement par Pierre-Antoine Desrousseaux (IUT de
              Béziers) qui a conçus tous les calculs qui sont ici utilisés, et
              mise en ligne par Nicolas Serra pour le premier site MAC construit
              (linguiste.iutbeziers.fr), la MAC est maintenant développée et
              mise à disposition de la communauté des chercheurs par
              l’Université Ibn Zohr d’Agadir.
            </p>
          </section>

          {/* Footer / Références */}
          <footer className="mt-8 pt-6 border-t border-blue-100 text-sm text-gray-600 dark:text-slate-400">
            <p className="font-semibold mb-2">Références :</p>
            <p>
              <span className="italic">
                Maurer, Bruno (2013), Représentations sociales des langues en
                situation multilingue : la méthode d’analyse combinée, nouvel
                outil d’enquête
              </span>
              , Paris, Archives contemporaines
            </p>
            <a
              href="https://circula.recherche.usherbrooke.ca/numero-3/"
              className="text-blue-600 hover:underline mt-2 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://circula.recherche.usherbrooke.ca/numero-3/
            </a>
          </footer>
        </div>
      </article>
    </div>
  );
};

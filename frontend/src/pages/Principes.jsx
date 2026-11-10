// frontend/src/pages/Principes.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  EyeIcon,
  ClipboardDocumentListIcon,
  ChartBarSquareIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

const TEMPS = [
  {
    icon: EyeIcon,
    title: "Recueil des perceptions",
    text: "Les participants expriment librement ce qu'évoque pour eux l'objet étudié : une langue, une politique, une situation.",
  },
  {
    icon: ClipboardDocumentListIcon,
    title: "Questionnaire ciblé",
    text: "Ils évaluent ensuite une série de propositions, en les situant sur une échelle de −2 à +2.",
  },
  {
    icon: ChartBarSquareIcon,
    title: "Analyse combinée",
    text: "Pour chaque proposition, trois dimensions sont mesurées en même temps : l'adhésion, le consensus et les distances.",
  },
];

const DIMENSIONS = [
  {
    title: "Adhésion",
    text: "Dans quelle mesure cette idée caractérise l'objet étudié, selon les répondants.",
  },
  {
    title: "Consensus",
    text: "Les membres du groupe sont-ils d'accord entre eux, ou leurs avis sont-ils dispersés ?",
  },
  {
    title: "Distances",
    text: "Quelles propositions sont associées entre elles dans l'esprit des répondants.",
  },
];

const ZONES = [
  {
    title: "Zone de centralité maximum",
    text: "Le cœur stable et partagé de la représentation.",
  },
  {
    title: "Couronne centrale",
    text: "Les éléments moyennement consensuels, susceptibles d'évoluer.",
  },
  {
    title: "Périphérie incertaine",
    text: "Les éléments sur lesquels le groupe est divisé.",
  },
  {
    title: "Périphérie marginale",
    text: "Ce qui est fortement rejeté : la représentation se définit aussi en creux.",
  },
];

export default function Principes() {
  return (
    <div className="pb-20">
      {/* Introduction */}
      <section className="pt-12 pb-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Méthode d'analyse combinée
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Les principes de la MAC
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          Contrairement aux méthodes qui recueillent seulement des opinions, la MAC révèle la structure
          profonde d'une représentation sociale. Elle distingue ce qui est vraiment important pour les
          personnes interrogées de ce qui est secondaire ou marginal.
        </p>
      </section>

      {/* Trois temps */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Une démarche en trois temps
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEMPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trois dimensions */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Trois dimensions mesurées ensemble
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {DIMENSIONS.map((d) => (
            <div
              key={d.title}
              className="rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 p-8 dark:from-gray-800 dark:to-gray-800"
            >
              <h3 className="mb-2 text-xl font-bold text-indigo-700 dark:text-indigo-300">{d.title}</h3>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Questionnaire */}
      <section className="mx-auto mt-24 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-12">
          <div className="mb-6 flex items-center gap-3">
            <ScaleIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Le questionnaire MAC</h2>
          </div>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              Une liste de 10, 15 ou 20 propositions, qui doit être rédigée à partir du discours des personnes
              interrogées plutôt qu'à partir des seules catégories du chercheur.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              Chaque proposition reçoit une valeur entre −2 et +2. Chaque valeur doit être attribuée le même nombre
              de fois : deux fois pour 10 propositions, trois pour 15, quatre pour 20.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              Les propositions doivent exprimer des idées distinctes : deux propositions qui traduisent la même idée
              se font concurrence dans l'esprit du répondant.
            </li>
          </ul>
        </div>
      </section>

      {/* Zones */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Des résultats visuels et exploitables
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-gray-600 dark:text-gray-300">
          L'analyse produit des graphiques et un schéma qui répartissent les éléments en quatre zones.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {ZONES.map((z, i) => (
            <div
              key={z.title}
              className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="text-3xl font-extrabold text-indigo-200 dark:text-indigo-800">{i + 1}</span>
              <div>
                <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">{z.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{z.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Usages et références */}
      <section className="mx-auto mt-24 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gray-50 p-8 dark:bg-gray-800 sm:p-10">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Où la MAC a été utilisée</h2>
          <p className="leading-relaxed text-gray-700 dark:text-gray-300">
            La méthode a été testée dans plusieurs contextes francophones, notamment à Madagascar et au Sénégal,
            pour étudier des idéologies linguistiques en situation de multilinguisme. Son usage peut s'étendre à
            d'autres objets que les langues.
          </p>
          <h3 className="mt-8 mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Référence
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Maurer, Bruno (2013). <em>Représentations sociales des langues en situation multilingue : la méthode
            d'analyse combinée, nouvel outil d'enquête</em>. Paris, Archives contemporaines.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/enquetes" className="btn-primary inline-flex items-center px-6 py-3">
              Créer une enquête
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              À propos de la plateforme
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

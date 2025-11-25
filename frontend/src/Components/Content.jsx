import React from "react";
import picFLSH from "../assets/picFLSH.jpg";
import picUIZ from "../assets/picUIZ.png";

function Content() {
  return (
    <section class="">
      <div class="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">
        <div class="font-light  sm:text-lg">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold ">
            La Méthode d'analyse combinée des représentations sociales{" "}
          </h2>
          <p class="mb-4">
            Que pensent les gens du français, de l'anglais ou de leur langue
            maternelle ? Quelles valeurs associent-ils à ces langues ?
            Développée par Bruno Maurer (Laboratoire Dipralang de Montpellier 3
            et Université de Lausanne) pour étudier les représentations des
            langues, la Méthode d'analyse combinée (MAC) permet de répondre à
            ces questions de manière rigoureuse et innovante et peut être
            utilisée pour étudier les représentations sociales d’autres objets..
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-8">
          <img class="w-full rounded-lg" src={picFLSH} alt="office content 1" />
          <img
            class="mt-4 w-full lg:mt-10 rounded-lg"
            src={picUIZ}
            alt="office content 2"
          />
        </div>
      </div>
    </section>
  );
}

export default Content;

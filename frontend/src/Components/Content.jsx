import React from "react";
import picFLSH from "../assets/picFLSH.jpg";
import picUIZ from "../assets/picUIZ.png";
import { Link } from "react-router-dom";

function Content() {
  return (
    <section class="">
      <div class="gap-16 items-center py-8 px-4 mx-auto max-w-7xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">
        <div class="font-light  sm:text-lg">
          <h2 class="mb-4 text-4xl tracking-tight font-extrabold ">
            La Méthode d'analyse combinée des représentations sociales{" "}
          </h2>
          <p class="mb-4">
            Développée par Bruno Maurer (Laboratoire Dipralang de Montpellier 3
            et Université de Lausanne) pour étudier les représentations des
            langues, la Méthode d'analyse combinée (MAC) permet de répondre à
            ces questions de manière rigoureuse et innovante et peut être
            utilisée pour étudier les représentations sociales d’autres objets..
          </p>
          <Link to={"/book-details"}>Plus d'informations!</Link>
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

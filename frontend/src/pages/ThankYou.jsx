// frontend/src/pages/ThankYou.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-3">
        Merci, votre réponse a été enregistrée !
      </h1>
      <p className="text-white-700 mb-6">
        Vous pouvez maintenant fermer cette page ou revenir à l’accueil.
      </p>
      <Link to="/" className="btn-primary">
        Retour à l’accueil
      </Link>
    </div>
  );
}

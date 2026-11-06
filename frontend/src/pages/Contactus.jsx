import React, { useState } from "react";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PaperAirplaneIcon 
} from "@heroicons/react/24/outline";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici vous mettrez votre logique d'envoi (API)
    alert("Merci ! Votre message a été envoyé (Simulation).");
  };

  return (
    // FOND BLEU CLAIR (bg-blue-50) pour matcher le thème
    <div className="min-h-screen bg-blue-50 text-gray-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* 1. EN-TÊTE */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          Contactez <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">l'équipe MAC</span>
        </h1>
        <p className="text-lg text-gray-600">
          Une question sur la méthode ? Un problème technique ou une demande de partenariat académique ? N'hésitez pas à nous écrire.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* 2. INFORMATIONS DE CONTACT (Gauche) */}
        <div className="space-y-8">
          {/* Carte Adresse */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 flex items-start space-x-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <MapPinIcon className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Notre Laboratoire</h3>
              <p className="text-gray-600 leading-relaxed">
                Université Ibn Zohr<br />
                FACULTÉ DES LETTRES ET DES SCIENCES HUMAINES<br />
                Adresse : Rue Hassan Bounaâmani, Agadir 80000, Agadir - Maroc
              </p>
            </div>
          </div>

          {/* Carte Email */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 flex items-start space-x-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                <EnvelopeIcon className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-1">Pour les demandes générales :</p>
              <div className="flex flex-col gap-1">
                <a href="mailto:a.elmadhi@uiz.ac.ma" className="text-blue-600 font-semibold hover:underline">
                  a.elmadhi@uiz.ac.ma
                </a>
                <a href="mailto:Elmadhi.adil@gmail.com" className="text-blue-600 font-semibold hover:underline">
                  Elmadhi.adil@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Carte Téléphone */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 flex items-start space-x-6 hover:-translate-y-1 transition-transform duration-300">
            <div className="shrink-0">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <PhoneIcon className="w-7 h-7" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Téléphone</h3>
              <p className="text-gray-600">Du Lundi au Vendredi, 9h - 17h</p>
              <p className="text-gray-900 font-bold mt-1">+212 661-729886</p>
            </div>
          </div>
        </div>

        {/* 3. FORMULAIRE DE CONTACT (Droite) */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Votre Nom</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Votre Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="jean@exemple.com"
                />
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                placeholder="Question sur l'analyse..."
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                name="message"
                id="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Comment pouvons-nous vous aider ?"
              ></textarea>
            </div>

            {/* Bouton Envoyer */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
            >
              <span>Envoyer le message</span>
              <PaperAirplaneIcon className="ml-2 w-5 h-5 -mt-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
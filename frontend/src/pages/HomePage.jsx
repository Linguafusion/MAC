// frontend/src/pages/HomePage.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { currentUser, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{padding: '20px'}}>Chargement...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bienvenue sur la Plateforme d'Enquêtes</h1>
      
      {currentUser ? (
        // CONTENU POUR UTILISATEUR CONNECTÉ
        <div>
          <p>Bonjour, **{currentUser.email}** ! Vous êtes connecté.</p>
          <button onClick={logout} style={{ marginTop: '10px', padding: '8px 12px' }}>
            Se Déconnecter
          </button>
          
          <hr style={{ margin: '20px 0' }} />
          
          <h2>Actions Principales</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/create-enquete" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none' }}>
                Créer une Nouvelle Enquête (F1)
            </Link>
            {/* Ajoutez ici d'autres liens pour les F2, F3... */}
          </div>
        </div>
      ) : (
        // CONTENU POUR UTILISATEUR DÉCONNECTÉ
        <div>
          <p>Veuillez vous connecter pour accéder aux outils.</p>
          <Link to="/login" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', display: 'inline-block' }}>
            Se Connecter
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
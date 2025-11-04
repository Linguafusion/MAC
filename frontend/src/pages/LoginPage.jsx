// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  // TEST SHLCNX
  if (currentUser) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/'); // Redirection vers la page d'accueil
    } catch (err) {
      setError(err.message || 'Une erreur inconnue est survenue. Vérifiez vos identifiants.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Mot de passe:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>Erreur: {error}</p>}
        <button type="submit" style={{ padding: '10px 15px', width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Se connecter
        </button>
      </form>
      {/* Note: Ajoutez ici un lien vers la page d'inscription si vous la créez */}
    </div>
  );
};

export default LoginPage;
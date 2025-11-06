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
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" className="mx-auto h-10 w-auto" />
    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">Sign in to your account</h2>
  </div>

  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label for="email" className="block text-sm/6 font-medium text-gray-100">Email address</label>
        <div className="mt-2">
          <input 
           id="email"
           type="email" 
           name="email" 
           required 
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           autocomplete="email" 
           className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label for="password" className="block text-sm/6 font-medium text-gray-100">Password</label>
        </div>
        <div className="mt-2">
          <input 
          id="password" 
          type="password" 
          name="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required autocomplete="current-password" 
          className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6" />
        </div>
      </div>

      <div>
        {error && <p style={{ color: 'red', marginBottom: '15px' }}>Erreur: {error}</p>}
        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Se connecter</button>
      </div>
    </form>
  </div>
</div>
  );
};

export default LoginPage;
/* eslint-disable react-refresh/only-export-components */
// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// L'URL de base de votre API FastAPI
const API_BASE_URL = 'http://localhost:8000'; 

export const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Axios pour inclure le token dans les requêtes
  axios.defaults.baseURL = API_BASE_URL;

  useEffect(() => {
    // Si un token est présent, vérifiez qui est l'utilisateur et configurez Axios
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [token]);

  // Récupère les infos de l'utilisateur (route /users/me)
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/users/me/');
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Token invalide ou expiré.", error);
      logout(); // Déconnexion si le token est invalide
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    // Utilise FormData car FastAPI attend le format x-www-form-urlencoded pour /token
    const data = new FormData();
    data.append('username', email); 
    data.append('password', password);

    try {
      const response = await axios.post('/token', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const newToken = response.data.access_token;

      localStorage.setItem('access_token', newToken);
      setToken(newToken);
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error.response.data);
      throw new Error(error.response.data.detail || "Échec de la connexion");
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    token,
    currentUser,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
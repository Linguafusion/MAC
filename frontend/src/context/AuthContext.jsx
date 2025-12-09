/* eslint-disable react-refresh/only-export-components */
// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Le token est stocké dans localStorage et lu par l'interceptor d'api.js
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/me/");
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Token invalide ou expiré.", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = new FormData();
    data.append("username", email);
    data.append("password", password);

    try {
      const response = await api.post("/token", data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const newToken = response.data.access_token;

      localStorage.setItem("access_token", newToken);
      setToken(newToken);
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error.response?.data || error);
      throw new Error(error.response?.data?.detail || "Échec de la connexion");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
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

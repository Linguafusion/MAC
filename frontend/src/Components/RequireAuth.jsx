// src/Components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * roles : tableau de rôles autorisés (["ROOT", "ADMIN"], etc.)
 * si roles est undefined => juste connecté obligatoire
 */
export default function RequireAuth({ roles, children }) {
  const { currentUser, isLoading } = useAuth(); // <-- ajouter isLoading ici
  const location = useLocation();

  // Tant que l'auth est en cours, on attend
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Vérification de l&apos;authentification...
      </div>
    );
  }

  // Pas connecté → on renvoie vers /login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si une restriction de rôles est définie
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

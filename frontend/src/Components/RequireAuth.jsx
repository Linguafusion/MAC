// src/Components/RequireAuth.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * roles : tableau de rôles autorisés (["ROOT", "ADMIN"], etc.)
 * si roles est undefined => juste connecté obligatoire
 */
export default function RequireAuth({ roles, children }) {
    const { currentUser } = useAuth();
    const location = useLocation();

    // Pas connecté → on renvoie vers /login
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si une restriction de rôles est définie
    if (roles && !roles.includes(currentUser.role)) {
        // Accès refusé → tu peux rediriger vers "/" ou une page 403 dédiée
        return <Navigate to="/" replace />;
    }

    return children;
}

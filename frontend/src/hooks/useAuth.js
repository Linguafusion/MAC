// frontend/src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Importez le contexte créé

export const useAuth = () => useContext(AuthContext);
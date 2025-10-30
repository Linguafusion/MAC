// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateEnquetePage from './pages/CreateEnquetePage';

const App = () => {
  return (
    <Router>
      <nav style={{ padding: '10px 20px', backgroundColor: '#f4f4f4', borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Accueil</Link>
        <Link to="/login" style={{ marginRight: '15px', textDecoration: 'none', color: '#333' }}>Connexion</Link>
        <Link to="/create-enquete" style={{ textDecoration: 'none', color: '#007bff' }}>Créer Enquête</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-enquete" element={<CreateEnquetePage />} />
        {/* Ajoutez ici d'autres routes comme /enquetes/:id pour la visualisation (F2) */}
      </Routes>
    </Router>
  );
};

export default App;
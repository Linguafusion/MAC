// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateEnquetePage from './pages/CreateEnquetePage';
import Navbar from './Components/Navbar';

const App = () => {
  return (
    <>
        <Router>
            <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create-enquete" element={<CreateEnquetePage />} />
                {/* Ajoutez ici d'autres routes comme /enquetes/:id pour la visualisation (F2) */}
              </Routes>
        </Router>

    </>
  );
};

export default App;
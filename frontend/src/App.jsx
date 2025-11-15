// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateEnquetePage from './pages/CreateEnquetePage';
import Navbar from './Components/Navbar';

const App = () => {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                {/* Ajout d'un padding top pour décaler le contenu sous la Navbar fixe.
                  px-4, py-6, et lg:px-8 pour centrer le contenu
                */}
                <main className="flex-1 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"> 
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/create-enquete" element={<CreateEnquetePage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./Components/Navbar";
import UsersList from "./pages/UsersList";
import UserCreate from "./pages/UserCreate";
import UserEdit from "./pages/UserEdit";
import RequireAuth from "./Components/RequireAuth"; // 👈 importer le garde
import SurveyList from "./pages/SurveyList";
import SurveyCreate from "./pages/SurveyCreate";
import PublicSurvey from "./pages/PublicSurvey";
import SurveyEdit from "./pages/SurveyEdit";
import SurveyResponses from "./pages/SurveyResponses";
import ThankYou from "./pages/ThankYou";
import SurveyStats from "./pages/SurveyStats";
import SurveyGraphs from "./pages/SurveyGraphs";
import SurveyGraphs3DECharts from "./pages/SurveyGraphs3DECharts";
// import SurveyGraphs3D from "./pages/SurveyGraphs3D";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Gestion des utilisateurs : ROOT + ADMIN uniquement */}
            <Route
              path="/users"
              element={
                <RequireAuth roles={["ROOT", "ADMIN"]}>
                  <UsersList />
                </RequireAuth>
              }
            />
            <Route
              path="/users/create"
              element={
                <RequireAuth roles={["ROOT", "ADMIN"]}>
                  <UserCreate />
                </RequireAuth>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <RequireAuth roles={["ROOT", "ADMIN"]}>
                  <UserEdit />
                </RequireAuth>
              }
            />

            {/* Création d'enquête : tout utilisateur connecté */}
            <Route
              path="/enquetes/create"
              element={
                <RequireAuth>
                  <SurveyCreate />
                </RequireAuth>
              }
            />

            {/* Création d'enquête : tout utilisateur connecté */}
            <Route
              path="/enquetes"
              element={
                <RequireAuth>
                  <SurveyList />
                </RequireAuth>
              }
            />

            <Route
              path="/enquetes/:id/edit"
              element={
                <RequireAuth roles={["ROOT", "ADMIN", "CREATOR"]}>
                  <SurveyEdit />
                </RequireAuth>
              }
            />
            <Route
              path="/enquetes/:id/responses"
              element={
                <RequireAuth>
                  <SurveyResponses />
                </RequireAuth>
              }
            />
            <Route path="/public/:token" element={<PublicSurvey />} />
            <Route path="/merci" element={<ThankYou />} />
            <Route
              path="/enquetes/:id/stats"
              element={
                <RequireAuth>
                  <SurveyStats />
                </RequireAuth>
              }
            />
            <Route
              path="/enquetes/:id/graphs"
              element={
                <RequireAuth>
                  <SurveyGraphs />
                </RequireAuth>
              }
            />
            <Route
              path="/enquetes/:id/graphs3d"
              element={
                <RequireAuth>
                  {/* <SurveyGraphs3D /> */}
                  <SurveyGraphs3DECharts />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

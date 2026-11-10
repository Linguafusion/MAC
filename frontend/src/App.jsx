// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./Components/Navbar";
import UsersList from "./pages/UsersList";
import UserCreate from "./pages/UserCreate";
import UserEdit from "./pages/UserEdit";
import RequireAuth from "./Components/RequireAuth";
import SurveyList from "./pages/SurveyList";
import SurveyImport from "./pages/SurveyImport";
import SurveyCreate from "./pages/SurveyCreate";
import PublicSurvey from "./pages/PublicSurvey";
import SurveyEdit from "./pages/SurveyEdit";
import SurveyResponses from "./pages/SurveyResponses";
import ThankYou from "./pages/ThankYou";
import Footer from "./Components/Footer";
import Content from "./Components/Content";
import { BookDetails } from "./pages/BookDetails";
import About from "./pages/About";
import Team from "./pages/Team";
import Contactus from "./pages/Contactus";
import Principes from "./pages/Principes";
import SurveyGraphs from "./pages/SurveyGraphs";
import SurveyStats from "./pages/SurveyStats";
import SurveyGraphs3DECharts from "./pages/SurveyGraphs3DECharts";

const AppWrapper = () => {
  const location = useLocation();

  // Regex patterns for pages where Content must NOT be shown
  const showContentPatterns = [
    /^\/$/,
  ];

  const shouldShowContent = showContentPatterns.some((pattern) =>
    pattern.test(location.pathname)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/book-details" element={<BookDetails />} />
          <Route path="/principes" element={<Principes />} />

          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contactus" element={<Contactus />} />
               

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

          <Route
            path="/enquetes/create"
            element={
              <RequireAuth>
                <SurveyCreate />
              </RequireAuth>
            }
          />

          <Route
            path="/enquetes/import"
            element={
              <RequireAuth roles={["ROOT", "ADMIN", "CREATOR"]}>
                <SurveyImport />
              </RequireAuth>
            }
          />

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

          <Route path="/public/:token" element={<PublicSurvey />} />
          <Route path="/merci" element={<ThankYou />} />
        </Routes>
      </main>

      {shouldShowContent && <Content />}

      <Footer />
    </div>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;

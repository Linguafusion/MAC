// src/Components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { useAuth } from '../hooks/useAuth'; 
import logo from "../assets/logomac.jpg"; 
=======
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logomac.jpg";
>>>>>>> 6e35019a0558d03867adcbae9fb9da3f784f975c

import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  PlusCircleIcon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
<<<<<<< HEAD
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true); 
    const location = useLocation();
    const navigate = useNavigate();
=======
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { currentUser, logout, isLoading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // to add a new page
  const navItems = [
    {
      label: "Accueil",
      path: "/", //
    },
    {
      label: "Principes",
      path: "/Book-details",
    },
    {
      label: "À propos",
      path: "/About",
    },
    {
      label: "Équipe",
      path: "/Team",
    },
    {
      label: "Contactez-nous",
      path: "/Contactus",
    },
>>>>>>> 6e35019a0558d03867adcbae9fb9da3f784f975c
    
  ];

  if (currentUser) {
    // Tous les utilisateurs connectés peuvent créer une enquête
    navItems.push({
      label: "Gérer enquêtes",
      path: "/enquetes",
      icon: PlusCircleIcon,
    });

<<<<<<< HEAD
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleDarkMode = () => setDarkMode(!darkMode);

    const navItems = [
        { label: "Accueil", path: "/" },
    ];
    
    if (currentUser) {
        // Tous les utilisateurs connectés peuvent créer une enquête
        navItems.push(
            { label: "Gérer enquêtes", path: "/enquetes", icon: PlusCircleIcon },
        );

        // Seuls ROOT et ADMIN peuvent gérer les utilisateurs
        if (currentUser.role === "ADMIN" || currentUser.role === "ROOT") {
            navItems.push(
                { label: "Gérer utilisateurs", path: "/users", icon: UserIcon },
            );
        }
    }
=======
    // Seuls ROOT et ADMIN peuvent gérer les utilisateurs
    if (currentUser.role === "ADMIN" || currentUser.role === "ROOT") {
      navItems.push({
        label: "Gérer utilisateurs",
        path: "/users",
        icon: UserIcon,
      });
    }
  }

  const getLinkClass = (path) =>
    `flex items-center px-4 py-2 rounded-lg font-medium transition duration-200 text-lg md:text-base ${
      location.pathname === path
        ? "text-indigo-700 dark:text-indigo-300 bg-gray-200 dark:bg-gray-800 sm:font-semibold"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
    }`;
>>>>>>> 6e35019a0558d03867adcbae9fb9da3f784f975c

  if (isLoading) return null;

  return (
    <nav className="sticky w-full top-0 z-30 backdrop-blur-lg  transition-all duration-300 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        {/* LOGO AMÉLIORÉ */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={logo}
            className="h-10 w-auto rounded-xl"
            alt="Logo MAC Enquête"
          />
          <div className="dark:text-indigo-500">
            <span className="self-center text-xl sm:text-2xl font-extrabold tracking-wide">
              MAC{" "}
            </span>
            <span className="dark:text-indigo-400/80 text-xl sm:text-2xl font-extrabold tracking-wide">
              Enquête
            </span>
          </div>
        </Link>

        {/* Boutons d'action (Dark Mode / Auth / Menu Mobile) */}
        <div className="flex items-center space-x-3 md:order-2">
          {/* BOUTON DE THÈME AMÉLIORÉ */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 cursor-pointer"
            title="Changer le thème"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-500" />
            ) : (
              <MoonIcon className="h-6 w-6 text-indigo-600" />
            )}
          </button>

          {/* Bouton Connexion/Déconnexion (Visible en Mobile uniquement si Déconnecté) */}
          {!currentUser && (
            <Link
              to="/login"
              className="btn-primary inline-flex md:hidden px-4 py-2"
            >
              <ArrowRightCircleIcon className="h-5 w-5 mr-1" />
              Connexion
            </Link>
          )}

          {/* Menu burger (mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none md:hidden transition"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Menu principal (desktop et mobile) */}
        <div
          id="mobile-menu"
          className={`${
            isOpen ? "block" : "hidden"
          } w-full md:flex md:w-auto md:order-1 mt-4 md:mt-0`}
        >
          <ul className="flex flex-col md:flex-row md:space-x-4 items-start md:items-center w-full md:w-auto bg-white  md:bg-transparent rounded-xl md:rounded-none shadow-xl md:shadow-none p-4 md:p-0 space-y-2 md:space-y-0">
            {/* Liens de navigation dynamiques */}
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={getLinkClass(item.path)}
                >
                  {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                  {item.label}
                </Link>
              </li>
            ))}

<<<<<<< HEAD
                        {/* Bouton Connexion / Déconnexion (Visible en Desktop) */}
                        <li className="hidden md:block">
                            {currentUser ? (
                                // BOUTON DÉCONNEXION
                                <button
                                    onClick={handleLogout}
                                    className="btn-primary flex items-center px-4 py-2 bg-red-600 hover:bg-red-700"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                                    Déconnexion
                                </button>
                            ) : (
                                // BOUTON CONNEXION
                                <Link
                                    to="/login"
                                    className="btn-primary flex items-center px-4 py-2"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                                    Connexion
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
=======
            {/* Bouton Connexion / Déconnexion (Visible en Desktop) */}
            <li className="hidden md:block">
              {currentUser ? (
                // BOUTON DÉCONNEXION
                <button
                  onClick={handleLogout}
                  className="btn-primary flex items-center px-4 py-2 bg-red-600 hover:bg-red-700"
                >
                  <ArrowLeftCircleIcon className="h-5 w-5 mr-2" />
                  Déconnexion
                </button>
              ) : (
                // BOUTON CONNEXION
                <Link
                  to="/login"
                  className="btn-primary flex items-center px-4 py-2"
                >
                  <ArrowRightCircleIcon className="h-5 w-5 mr-2" />
                  Connexion
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
>>>>>>> 6e35019a0558d03867adcbae9fb9da3f784f975c

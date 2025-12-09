import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const { currentUser } = useAuth();

    const load = async () => {
        const res = await api.get("/users/");
        setUsers(res.data);
    };

    useEffect(() => { load(); }, []);

    // petit helper pour savoir si l'utilisateur courant peut gérer les CREATOR
    const canManageCreators = currentUser?.role === "ROOT" || currentUser?.role === "ADMIN";
    const isRoot = currentUser?.role === "ROOT";

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Gestion des utilisateurs</h1>

            {canManageCreators && (
                <Link
                    to="/users/create"
                    className="btn-primary mb-4 inline-block"
                >
                    + Ajouter un utilisateur
                </Link>
            )}

            <table className="min-w-full dark:bg-gray-800 rounded-xl shadow-xl">
                <thead>
                    <tr className="border-b dark:border-gray-700">
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3">Rôle</th>
                        <th className="p-3">Actif</th>
                        <th className="p-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b dark:border-gray-700">
                            <td className="p-3">{u.email}</td>
                            <td className="p-3 text-center">{u.role}</td>
                            <td className="p-3 text-center">
                                {u.is_active ? "✔" : "❌"}
                            </td>
                            <td className="p-3 flex gap-3 justify-center">
                                {/* Cas ROOT */}
                                {u.role === "ROOT" && isRoot && (
                                    // on utilise la même page d'édition,
                                    // mais le backend n'autorisera que le changement de mot de passe
                                    <Link
                                        to={`/users/${u.id}/edit`}
                                        className="btn-secondary"
                                    >
                                        Changer mot de passe
                                    </Link>
                                )}

                                {/* Cas ADMIN : seul ROOT peut modifier/supprimer */}
                                {u.role === "ADMIN" && isRoot && (
                                    <>
                                        <Link
                                            to={`/users/${u.id}/edit`}
                                            className="btn-secondary"
                                        >
                                            Modifier
                                        </Link>
                                        <button
                                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md text-sm font-semibold transition"
                                            onClick={async () => {
                                                await api.delete(`/users/${u.id}`);
                                                load();
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    </>
                                )}

                                {/* Cas CREATOR : ROOT + ADMIN peuvent modifier/supprimer */}
                                {u.role === "CREATOR" && canManageCreators && (
                                    <>
                                        <Link
                                            to={`/users/${u.id}/edit`}
                                            className="btn-secondary"
                                        >
                                            Modifier
                                        </Link>
                                        <button
                                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md text-sm font-semibold transition"
                                            onClick={async () => {
                                                await api.delete(`/users/${u.id}`);
                                                load();
                                            }}
                                        >
                                            Supprimer
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

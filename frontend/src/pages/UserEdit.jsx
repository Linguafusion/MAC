// frontend/src/pages/UserEdit.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("CREATOR");
    const [isActive, setIsActive] = useState(true);
    const [password, setPassword] = useState(""); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isRootUser, setIsRootUser] = useState(false); // ⬅️ NEW

    // Charger l'utilisateur
    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(`/users/${id}`);
                const u = res.data;

                setEmail(u.email);
                setRole(u.role);
                setIsActive(u.is_active);

                if (u.role === "ROOT") {
                    setIsRootUser(true);
                }
            } catch (err) {
                console.error(err);
                setError("Impossible de charger l'utilisateur");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        let payload = {};

        // Si c'est ROOT → seul le mot de passe est autorisé
        if (isRootUser) {
            if (password.trim() === "") {
                setError("Veuillez entrer un mot de passe pour le modifier.");
                return;
            }
            payload = { password };
        }

        else {
            // Utilisateur normal : email / role / active / password optionnel
            payload = {
                email,
                role,
                is_active: isActive,
            };

            if (password.trim() !== "") {
                payload.password = password;
            }
        }

        try {
            await axios.put(`/users/${id}`, payload);
            navigate("/users");
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la mise à jour");
        }
    };

    if (loading) {
        return <div className="max-w-lg mx-auto p-6">Chargement...</div>;
    }

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-3xl mb-6 font-bold">
                {isRootUser ? "Modifier le mot de passe ROOT" : "Modifier l'utilisateur"}
            </h1>

            {error && <div className="mb-4 text-red-600">{error}</div>}

            <form onSubmit={submit} className="space-y-6">

                {/* EMAIL */}
                <div>
                    <label>Email</label>
                    <input
                        value={email}
                        disabled={isRootUser}  // ❌ désactivé pour ROOT
                        onChange={e => setEmail(e.target.value)}
                        className={`form-input ${isRootUser ? "bg-gray-200 cursor-not-allowed" : ""}`}
                        required
                    />
                </div>

                {/* PASSWORD */}
                <div>
                    <label>
                        {isRootUser ? "Nouveau mot de passe ROOT" : "Nouveau mot de passe (optionnel)"}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-input"
                        placeholder={isRootUser ? "Obligatoire" : "Laisser vide pour ne pas changer"}
                    />
                </div>

                {/* ROLE */}
                {!isRootUser && (
                    <div>
                        <label>Rôle</label>
                        <select
                            className="form-input"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="CREATOR">CREATOR</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                )}

                {/* ACTIVE */}
                {!isRootUser && (
                    <div className="flex items-center gap-2">
                        <input
                            id="isActive"
                            type="checkbox"
                            checked={isActive}
                            onChange={e => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isActive">Compte actif</label>
                    </div>
                )}

                <button className="btn-primary w-full">
                    {isRootUser ? "Modifier le mot de passe ROOT" : "Enregistrer les modifications"}
                </button>
            </form>
        </div>
    );
}

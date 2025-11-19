import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function UserCreate() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("CREATOR");

    const submit = async (e) => {
        e.preventDefault();
        await axios.post("/users/", { email, password, role });
        navigate("/users");
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-3xl mb-6 font-bold">Créer un utilisateur</h1>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label>Email</label>
                    <input 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

                <div>
                    <label>Mot de passe</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>

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

                <button className="btn-primary w-full">Créer</button>
            </form>
        </div>
    )
}

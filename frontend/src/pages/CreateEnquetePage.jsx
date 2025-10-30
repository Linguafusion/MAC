// frontend/src/pages/CreateEnquetePage.jsx

import React, { useState, useEffect } from 'react'; // Ajout de useEffect
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8000"; // Assurez-vous que cette URL est correcte ou configurée via Vite

const initialQuestion = { texte: '', type_question: 'text', is_required: false };
const initialItem = { stimulus: '', sequence: 1 };

const CreateEnquetePage = () => {
    // ------------------------------------------------------------------
    // 1. TOUS LES HOOKS SONT APPELÉS EN PREMIER (sans condition de retour)
    // ------------------------------------------------------------------
    const { token } = useAuth(); // Hook
    const navigate = useNavigate(); // Hook
    
    const [enquete, setEnquete] = useState({
        titre: '',
        description: '',
        taille_liste: 5, 
        rang_ponderation: true,
    });
    
    const [questions, setQuestions] = useState([initialQuestion]);
    const [items, setItems] = useState([initialItem]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    // ------------------------------------------------------------------


    // 2. LOGIQUE DE REDIRECTION GÉRÉE PAR useEffect (F4 / Règle des Hooks)
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]); // Dépendances

    // Afficher un message pendant que la redirection s'effectue (si l'utilisateur n'est pas connecté)
    if (!token) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Redirection vers la page de connexion...</p>;
    }


    // Fonctions de gestion des changements (Le reste de votre code est correct)
    const handleEnqueteChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEnquete(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    const handleQuestionChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newQuestions = questions.map((q, i) => 
            i === index ? { ...q, [name]: type === 'checkbox' ? checked : value } : q
        );
        setQuestions(newQuestions);
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = items.map((item, i) => 
            i === index ? { ...item, [name]: name === 'sequence' ? parseInt(value) : value } : item
        );
        setItems(newItems);
    };

    // Fonctions d'ajout/suppression
    const addQuestion = () => setQuestions(prev => [...prev, initialQuestion]);
    const removeQuestion = (index) => setQuestions(prev => prev.filter((_, i) => i !== index));
    const addItem = () => setItems(prev => [...prev, { ...initialItem, sequence: prev.length + 1 }]);
    const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...enquete,
            questions: questions.map(q => ({
                ...q, 
                is_required: !!q.is_required
            })),
            items: items.map(item => ({
                ...item,
                sequence: parseInt(item.sequence)
            }))
        };
        
        try {
            // Utiliser le contexte pour l'URL si axios est configuré globalement
            const response = await axios.post(`${API_BASE_URL}/enquetes/`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                    // Si l'intercepteur axios n'est pas utilisé dans AuthContext, il faut passer le token ici.
                }
            });
            alert(`Enquête "${response.data.titre}" créée avec succès!`);
            navigate('/');
        } catch (err) {
            console.error("Erreur de création d'enquête:", err.response ? err.response.data : err);
            setError(err.response?.data?.detail || "Échec de la création. Assurez-vous d'avoir rempli tous les champs.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' };
    const sectionStyle = { border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>Créer une Nouvelle Enquête (F1)</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                {/* Section 1: Informations Générales */}
                <div style={sectionStyle}>
                    <h2>1. Général</h2>
                    <input name="titre" value={enquete.titre} onChange={handleEnqueteChange} placeholder="Titre de l'Enquête" required style={inputStyle} />
                    <textarea name="description" value={enquete.description} onChange={handleEnqueteChange} placeholder="Description de l'Enquête" style={inputStyle} rows="3" />
                </div>

                {/* Section 2: Paramètres RS */}
                <div style={sectionStyle}>
                    <h2>2. Paramètres (Méthode de Représentation Sociale)</h2>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                        Taille Max. de la Liste de Mots (1-10): 
                        <input type="number" name="taille_liste" value={enquete.taille_liste} onChange={handleEnqueteChange} min="1" max="10" required style={{ marginLeft: '10px', padding: '5px', width: '60px' }} />
                    </label>
                    <label style={{ display: 'block', marginBottom: '20px' }}>
                        <input type="checkbox" name="rang_ponderation" checked={enquete.rang_ponderation} onChange={handleEnqueteChange} style={{ marginRight: '10px' }} />
                        Appliquer la pondération par le rang de citation (Méthode de Tri)
                    </label>
                </div>


                {/* Section 3: Questions Contextuelles */}
                <div style={sectionStyle}>
                    <h2>3. Questions Contextuelles (Socio-démographiques, etc.)</h2>
                    {questions.map((q, index) => (
                        <div key={index} style={{ border: '1px dashed #ddd', padding: '10px', marginBottom: '10px' }}>
                            <input name="texte" value={q.texte} onChange={(e) => handleQuestionChange(index, e)} placeholder={`Question ${index + 1} Texte`} required style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
                            <select name="type_question" value={q.type_question} onChange={(e) => handleQuestionChange(index, e)} style={{ padding: '8px', marginRight: '10px' }}>
                                <option value="text">Texte Libre</option>
                                <option value="radio">Choix Multiple (à définir plus tard)</option>
                                <option value="checkbox">Cases à cocher</option>
                            </select>
                            <label style={{ marginRight: '20px' }}>
                                <input type="checkbox" name="is_required" checked={q.is_required} onChange={(e) => handleQuestionChange(index, e)} style={{ marginRight: '5px' }} />
                                Obligatoire
                            </label>
                            <button type="button" onClick={() => removeQuestion(index)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Supprimer</button>
                        </div>
                    ))}
                    <button type="button" onClick={addQuestion} style={{ padding: '10px 15px', marginTop: '10px', backgroundColor: '#ffc107', border: 'none' }}>+ Ajouter une Question</button>
                </div>

                {/* Section 4: Items Stimuli */}
                <div style={sectionStyle}>
                    <h2>4. Items Stimuli (Mots Clés Inducteurs)</h2>
                    {items.map((item, index) => (
                        <div key={index} style={{ border: '1px dashed #ddd', padding: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input name="stimulus" value={item.stimulus} onChange={(e) => handleItemChange(index, e)} placeholder={`Mot Stimulus ${index + 1}`} required style={{ flexGrow: 1, padding: '8px', boxSizing: 'border-box' }} />
                            <label>
                                Séquence:
                                <input type="number" name="sequence" value={item.sequence} onChange={(e) => handleItemChange(index, e)} min="1" required style={{ width: '60px', padding: '8px', marginLeft: '5px' }} />
                            </label>
                            <button type="button" onClick={() => removeItem(index)} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Supprimer</button>
                        </div>
                    ))}
                    <button type="button" onClick={addItem} style={{ padding: '10px 15px', marginTop: '10px', backgroundColor: '#ffc107', border: 'none' }}>+ Ajouter un Stimulus</button>
                </div>


                {/* Bouton de Soumission */}
                <button type="submit" disabled={loading} style={{ padding: '15px 30px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', width: '100%', fontSize: '1.2em' }}>
                    {loading ? 'Création en cours...' : 'Créer l\'Enquête'}
                </button>
            </form>
        </div>
    );
};

export default CreateEnquetePage;
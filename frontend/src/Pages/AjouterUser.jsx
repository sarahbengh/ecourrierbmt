import React, { useState } from 'react';
import axios from 'axios';

const AjouterUser = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    organisation: '',
    identifiant: '',
    motDePasse: '',
  });

  const [message, setMessage] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false); // Pour gérer l'option "Autre"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOrganisationChange = (e) => {
    const value = e.target.value;
    if (value === 'Autre') {
      setIsOtherSelected(true);
      setFormData({ ...formData, organisation: '' });
    } else {
      setIsOtherSelected(false);
      setFormData({ ...formData, organisation: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Appel Axios pour envoyer les données à l'API PHP
    axios.post('http://localhost/EcourrierBMT/backend/api.php', formData)
      .then(response => {
        console.log(response.data);
        if (response.data.status === 'success') {
          setMessage('Utilisateur créé avec succès!');
          setFormData({
            nom: '',
            prenom: '',
            organisation: '',
            identifiant: '',
            motDePasse: '',
          });
        } else {
          setMessage('Erreur lors de la création de l\'utilisateur: ' + response.data.message);
        }
      })
      .catch(error => {
        setMessage('Erreur lors de la création de l\'utilisateur.');
        console.error('Il y a eu une erreur!', error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Ajouter un Utilisateur</h1>
        {message && <div className="mb-4 text-green-600">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="organisation">Organisation</label>
            <select
              id="organisation"
              name="organisation"
              value={formData.organisation}
              onChange={handleOrganisationChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="" disabled>Sélectionnez une organisation</option>
              <option value="DGA">DGA</option>
              <option value="DFC">DFC</option>
              <option value="DO">DO</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Champ d'entrée pour "Autre" si sélectionné */}
          {isOtherSelected && (
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="autreOrganisation">Autre Organisation</label>
              <input
                type="text"
                id="autreOrganisation"
                name="organisation"
                value={formData.organisation}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="identifiant">Identifiant</label>
            <input
              type="text"
              id="identifiant"
              name="identifiant"
              value={formData.identifiant}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="motDePasse">Mot de Passe</label>
            <input
              type="password"
              id="motDePasse"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterUser;

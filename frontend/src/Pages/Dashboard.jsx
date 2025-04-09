import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [user, setUser] = useState({ nom: '', prenom: '' });

  useEffect(() => {
    // Récupérer les informations de l'utilisateur authentifié à partir de la session
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost/EcourrierBMT/backend/login.php'); // Route backend pour obtenir les infos de session
        // axios.post('http://localhost/EcourrierBMT/backend/api.php', formData)

        const data = await response.json();

        if (data.status === 'success') {
          setUser({ nom: data.user.nom, prenom: data.user.prenom });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-1 bg-gray-100 p-8">
        <h1 className="text-4xl font-bold text-blue-700">
          Bienvenu, {user.prenom} {user.nom}
        </h1>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Tableau de bord</h2>
          <p className="mt-4 text-gray-600">
            Ceci est votre tableau de bord où vous pouvez accéder à toutes vos informations importantes et gérer vos tâches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

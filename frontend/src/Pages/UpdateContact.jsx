import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UpdateContact = () => {
  const { id } = useParams();
  const [contact, setContact] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Requête pour récupérer les détails du contact via l'API
    axios
      .get(`http://localhost/EcourrierBMT/backend/getContactById.php?id=${id}`)
      .then((response) => {
        if (response.data.message) {
          setError(response.data.message);
        } else {
          setContact(response.data);
        }
      })
      .catch((err) => {
        setError("Erreur lors de la récupération des détails du contact");
      });
  }, [id]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!contact) {
    return <p>Chargement des détails du contact...</p>;
  }

  return (
    <div>
      <h1>{contact.nom} {contact.prenom}</h1>
      {/* Formulaire de modification des infos ici */}
    </div>
  );
};

export default UpdateContact;

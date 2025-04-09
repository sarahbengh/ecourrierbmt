import React, { useEffect, useState } from "react";
import axios from "axios";

const ListeContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null); // Contact sélectionné pour modification

  useEffect(() => {
    axios
      .get("http://localhost/EcourrierBMT/backend/api.php")
      .then((response) => {
        if (response.data.message) {
          setError(response.data.message);
        } else {
          setContacts(response.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur lors de la récupération des contacts");
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    axios
      .delete("http://localhost/EcourrierBMT/backend/api.php", {
        data: { id }
      })
      .then((response) => {
        if (response.data.status === 'success') {
          setContacts(contacts.filter(contact => contact.id !== id));
        }
        setError(response.data.message);
      })
      .catch((err) => {
        setError("Erreur lors de la suppression du contact");
      });
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact); // Stocker le contact sélectionné
    setIsModalOpen(true); // Ouvrir la modale
  };

  const handleSave = () => {
    // Envoyer les modifications via une requête PUT/POST à l'API
    axios
      .put("http://localhost/EcourrierBMT/backend/api.php", selectedContact)
      .then((response) => {
        if (response.data.status === "success") {
          // Mettre à jour la liste de contacts
          setContacts(contacts.map((contact) => (contact.id === selectedContact.id ? selectedContact : contact)));
          setIsModalOpen(false); // Fermer la modale après l'enregistrement
        } else {
          setError(response.data.message);
        }
      })
      .catch((err) => {
        setError("Erreur lors de la modification du contact");
      });
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Liste des contacts</h2>
      {error && <p className="text-red-600">{error}</p>}
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Nom</th>
            <th className="px-4 py-2 border">Prénom</th>
            <th className="px-4 py-2 border">Organisation</th>
            <th className="px-4 py-2 border">Identifiant</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td className="px-4 py-2 border">{contact.nom}</td>
              <td className="px-4 py-2 border">{contact.prenom}</td>
              <td className="px-4 py-2 border">{contact.organisation}</td>
              <td className="px-4 py-2 border">{contact.identifiant}</td>
              <td className="px-4 py-2 border">
                <button onClick={() => handleDelete(contact.id)} className="text-red-600">Supprimer</button>
                <button onClick={() => handleEdit(contact)} className="text-blue-600 ml-2">Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal pour la modification du contact */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Modifier le contact</h3>

            <form>
              <div className="mb-4">
                <label className="block text-gray-700">Nom</label>
                <input
                  type="text"
                  value={selectedContact.nom}
                  onChange={(e) => setSelectedContact({ ...selectedContact, nom: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Prénom</label>
                <input
                  type="text"
                  value={selectedContact.prenom}
                  onChange={(e) => setSelectedContact({ ...selectedContact, prenom: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Organisation</label>
                <input
                  type="text"
                  value={selectedContact.organisation}
                  onChange={(e) => setSelectedContact({ ...selectedContact, organisation: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Identifiant</label>
                <input
                  type="text"
                  value={selectedContact.identifiant}
                  onChange={(e) => setSelectedContact({ ...selectedContact, identifiant: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg mr-2"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeContacts;

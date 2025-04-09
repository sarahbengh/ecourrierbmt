import React, { useEffect, useState } from 'react';
// import Sidebar from './Sidebar';

const courriers = [
  { id: 1, title: "Invitation à la conférence annuelle du port", status: "Arrivés" },
  { id: 2, title: "Rapport mensuel des activités portuaires", status: "Arrivés" },
  { id: 3, title: "Avis de paiement de la facture N°12345", status: "Arrivés" },
  { id: 4, title: "Requête pour extension de contrat de service", status: "Arrivés" },
  { id: 5, title: "Confirmation de réception des marchandises", status: "Arrivés" },
];

const CourriersArrives = () => {
  const [arrivedCourriers, setArrivedCourriers] = useState([]);

  useEffect(() => {
    // Simuler la récupération des données de la base de données
    const filteredCourriers = courriers.filter(courrier => courrier.status === "Arrivés");
    setArrivedCourriers(filteredCourriers);
  }, []);

  return (
    <div className="flex">
      {/* <Sidebar /> */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Courriers Arrivés</h1>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Rechercher des courriers"
              className="border p-2 rounded"
            />
            <button className="bg-blue-500 text-white p-2 rounded">Rechercher</button>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h2 className="text-xl mb-4">{arrivedCourriers.length} Résultat(s)</h2>
          <ul>
            {arrivedCourriers.map(courrier => (
              <li key={courrier.id} className="bg-white p-4 mb-4 rounded-lg flex justify-between items-center shadow">
                <span>{courrier.title}</span>
                <button className="text-blue-500">a Continuer</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourriersArrives;

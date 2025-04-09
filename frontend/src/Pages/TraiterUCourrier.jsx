import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TraiterUCourrier = () => {
  const [courrier, setCourrier] = useState({
    reponse: '',
    listeDiffusion: [],
    fichier: null,
    nomFichier: ''
  });

  const [diffusionList, setDiffusionList] = useState(["DGA", "DO", "DFC", "DMKT", "DRHM", "DT", "autre"]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // Simuler la récupération des informations du courrier sélectionné
    // axios.get('http://localhost:5000/api/courriers/1')
    //   .then(response => setCourrier(response.data))
    //   .catch(error => console.error(error));

    // Exemple statique pour le test
    setCourrier({
      reponse: '',
      listeDiffusion: [],
      fichier: null,
      nomFichier: 'courrier_exemple.pdf',
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourrier({ ...courrier, [name]: value });
  };

  const handleDiffusionChange = (e) => {
    const { value, checked } = e.target;
    if (value === "autre" && checked) {
      const autre = prompt("Veuillez saisir une entité personnalisée :");
      setDiffusionList([...diffusionList, autre]);
      setCourrier({ ...courrier, listeDiffusion: [...courrier.listeDiffusion, autre] });
    } else if (checked) {
      setCourrier({ ...courrier, listeDiffusion: [...courrier.listeDiffusion, value] });
    } else {
      setCourrier({
        ...courrier,
        listeDiffusion: courrier.listeDiffusion.filter(item => item !== value)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("reponse", courrier.reponse);
    formData.append("listeDiffusion", JSON.stringify(courrier.listeDiffusion));

    axios.post('http://localhost:5000/api/courriers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => alert("Courrier validé et archivé avec succès."))
      .catch(error => console.error(error));
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-[#02A8DB] text-white p-6 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Traiter le courrier </h1>
        <p className="mb-4 text-sm text-gray-200">Dans cette page, vous pouvez rédiger une réponse au courrier sélectionné et choisir les destinataires dans la liste de diffusion. Une fois cela fait, vous pouvez valider et archiver votre réponse.</p>
        <h4 className="text-xl font-bold mb-4">Rédiger une réponse</h4>
        <textarea
          name="reponse"
          rows="10"
          value={courrier.reponse}
          onChange={handleChange}
          placeholder="Écrivez votre réponse ici..."
          className="w-full p-3 bg-white text-black rounded"
        />

        <h3 className="mt-6 mb-2 font-semibold">Liste de diffusion</h3>
        <div className="flex flex-wrap space-y-2">
          {diffusionList.map((item, index) => (
            <div key={index} className="mr-4">
              <label>
                <input
                  type="checkbox"
                  value={item}
                  onChange={handleDiffusionChange}
                  className="form-checkbox text-[#02A8DB] mr-1"
                /> {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2 p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Courrier sélectionné</h1>
        <div className="w-full bg-white p-6 border border-gray-300 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">{courrier.nomFichier}</h3>
          <p className="text-gray-800">Veuillez consulter le courrier joint ci-dessus.</p>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-[#02A8DB] text-white p-3 rounded hover:bg-[#5041BC]"
        >
          Valider et archiver
        </button>
      </div>
    </div>
  );
};

export default TraiterUCourrier;

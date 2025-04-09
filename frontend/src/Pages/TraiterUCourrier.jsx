import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

// fait moi le backend pour cette page avec php 
const TraiterUCourrier = () => {
  const [courrier, setCourrier] = useState({
    type: 'incoming',
    priority: '',
    dateEmail: '',
    arrivalDate: '',
    object: '',
    sender: '',
    initiatrice: '',
    traitante: '',
    listeDiffusion: [],
    file: null,
    fileName: ''
  });

  const [contactList, setContactList] = useState([]);
  const [diffusionList, setDiffusionList] = useState(["DGA", "DO", "DFC", "DMKT", "DRHM", "DT", "autre"]);
  const [userName, setUserName] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    axios.get('/api/user', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(response => setUserName(response.data.name))
      .catch(error => console.error(error));

    axios.get('/api/contacts', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(response => setContactList(response.data))
      .catch(error => console.error(error));
  }, []);

  const handleFileChange = async (file) => {
    if (file) {
      setCourrier({ ...courrier, file, fileName: file.name });

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const text = await pdfDoc.getTextContent();
        setCourrier({ ...courrier, object: text.items[0].str || '' });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourrier({ ...courrier, [name]: value });
  };

  const handleDiffusionChange = (e) => {
    const { value, checked } = e.target;
    if (value === "autre" && checked) {
      const autre = prompt("Veuillez saisir l'entité:");
      setDiffusionList([...diffusionList, autre]);
      setCourrier({ ...courrier, listeDiffusion: [...courrier.listeDiffusion, autre] });
    } else if (checked) {
      setCourrier({ ...courrier, listeDiffusion: [...courrier.listeDiffusion, value] });
    } else {
      setCourrier({ ...courrier, listeDiffusion: courrier.listeDiffusion.filter(item => item !== value) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(courrier).forEach(key => {
      formData.append(key, courrier[key]);
    });

    axios.post('/api/courriers', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' } })
      .then(response => alert('Courrier enregistré avec succès!'))
      .catch(error => console.error(error));
  };

  const handleRemoveFile = () => {
    setCourrier({ ...courrier, file: null, fileName: '' });
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-blue-700 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold">Incoming email (by default)</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label>Type of email</label>
            <select name="type" onChange={handleChange} className="form-select mt-1 block w-full bg-blue-600">
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>
          </div>
          <div>
            <label>Priority</label>
            <select name="priority" onChange={handleChange} className="form-select mt-1 block w-full bg-blue-600">
              <option value="">Choose a value</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label>Date of email</label>
            <input type="date" name="dateEmail" onChange={handleChange} className="form-input mt-1 block w-full bg-blue-600" />
          </div>
          <div>
            <label>Arrival Date</label>
            <input type="date" name="arrivalDate" onChange={handleChange} className="form-input mt-1 block w-full bg-blue-600" />
          </div>
          <div>
            <label>Object</label>
            <input type="text" name="object" onChange={handleChange} value={courrier.object} className="form-input mt-1 block w-full bg-blue-600" />
          </div>
          <div>
            <label>Sender</label>
            <input type="text" name="sender" onChange={handleChange} value={courrier.sender} className="form-input mt-1 block w-full bg-blue-600" />
          </div>
          <div>
            <label>Initiative Entity</label>
            <select name="initiatrice" onChange={handleChange} className="form-select mt-1 block w-full bg-blue-600">
              <option value="">Choose a value</option>
            </select>
          </div>
          <div>
            <label>Treating Entity</label>
            <select name="traitante" onChange={handleChange} className="form-select mt-1 block w-full bg-blue-600">
              <option value="">Choose a value</option>
            </select>
          </div>
          <div>
            <label>Distribution List</label>
            <div className="flex flex-wrap space-y-2">
              {diffusionList.map((item, index) => (
                <div key={index} className="mr-4">
                  <label>
                    <input type="checkbox" value={item} onChange={handleDiffusionChange} className="form-checkbox text-blue-600" /> {item}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-1/2 p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Enregistrer un courrier</h1>
        <div 
          className={`border-dashed border-2 border-blue-500 p-6 w-full h-full flex items-center justify-center relative ${dragging ? 'bg-gray-200' : 'bg-white'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" name="file" onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer w-full h-full flex items-center justify-center absolute inset-0">
            <div className="text-center text-blue-500">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p>Drag and Drop or <span className="text-blue-700 underline">Choose a file</span></p>
            </div>
          </label>
          {courrier.file && (
            <div className="absolute inset-0 p-4 bg-white flex flex-col items-center justify-center">
              <button onClick={handleRemoveFile} className="mb-4 bg-red-500 text-white p-2 rounded">Remove File</button>
              {courrier.file.type === 'application/pdf' ? (
                <iframe src={URL.createObjectURL(courrier.file)} className="w-full h-full" />
              ) : (
                <img src={URL.createObjectURL(courrier.file)} alt="Uploaded file" className="w-full h-full object-contain" />
              )}
            </div>
          )}
        </div>
        <button onClick={handleSubmit} className="mt-6 w-full bg-blue-700 text-white p-3 rounded">Valider le courrier</button>
      </div>
    </div>
  );
};

export default TraiterUCourrier;

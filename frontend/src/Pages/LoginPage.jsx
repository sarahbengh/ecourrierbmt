import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost/EcourrierBMT/backend/login.php', { identifier, password });
      if (response.data.status === 'success') {
        // L'utilisateur est authentifié, redirection vers le tableau de bord
        navigate('/Dashboard', { state: { nom: response.data.nom, prenom: response.data.prenom } });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Erreur lors de la connexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: `url('../../public/login.jpg')`, backgroundSize: 'cover' }}>
      <div className="relative bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="mt-16 text-3xl text-center font-bold text-blue-700">eCourrier BMT</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Identifiant</label>
            <input id="identifier" name="identifier" type="text" required className="block w-full px-3 py-2 border border-gray-300" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="block w-full px-3 py-2 border border-gray-300" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>
          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Se connecter</button>
        </form>
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;

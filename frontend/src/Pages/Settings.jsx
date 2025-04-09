import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaAddressBook, FaUser, FaCog } from 'react-icons/fa';

const Settings = () => {
    const navigate = useNavigate();

    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            <div className="flex gap-8">
                <div onClick={() => navigateTo('/Contacts')} className="cursor-pointer bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
                    <FaAddressBook size={64} className="mb-4 text-blue-500" />
                    <h2 className="text-xl font-semibold">Contacts</h2>
                </div>
                <div onClick={() => navigateTo('/Myprofile')} className="cursor-pointer bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
                    <FaUser size={64} className="mb-4 text-green-500" />
                    <h2 className="text-xl font-semibold">My Profile</h2>
                </div>
                <div onClick={() => navigateTo('/Myaccount')} className="cursor-pointer bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
                    <FaCog size={64} className="mb-4 text-yellow-500" />
                    <h2 className="text-xl font-semibold">My Account</h2>
                </div>
            </div>
        </div>
    );
};

export default Settings;

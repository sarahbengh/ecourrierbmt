import React, { useState } from 'react';
import {  FaFileExport,FaFileImport, FaBars } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { IoIosAddCircleOutline } from "react-icons/io";
import { RiContactsBook2Fill } from "react-icons/ri";
// import { IoSettingsOutline } from "react-icons/io5";


const ContactSidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const menuItem = [
    {
      path: '/AjouterUser',
      name: 'Ajouter',
      icon: <IoIosAddCircleOutline />,
    },
    {
      path: '/',
      name: 'Importer des contacts',
      icon: <FaFileImport />,
    },
 
    {
      path: '/',
      name: 'Exporter des contacts',
      icon: <FaFileExport />,
    },
    {
      path: '/ListeContacts',
      name: 'Liste des contacts',
      icon: <RiContactsBook2Fill />,
    },


  ];

  return (
    <div className="container flex">
      <div
        style={{ width: isOpen ? '250px' : '50px' }}
        className="sidebar bg-teal-800  text-white h-screen transition-all duration-500"
      >
        <div className="top_section flex items-center px-3 py-4">
 
          <h1
            style={{ display: isOpen ? 'block' : 'none' }}
            className="logo text-2xl font-bold"
          >
            ecourrierBMT
          </h1>
          <div
            style={{ marginLeft: isOpen ? '80px' : '0px' }}
            className="bars flex items-center ml-10"
          >
            <FaBars onClick={toggle} className="text-orange-700 text-2xl" />
          </div>
        </div>
        {menuItem.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link flex items-center justify-between text-orange px-3 py-2 gap-2 hover:bg-orange-899 hover:text-black transition-all duration-500"
            activeClassName="active bg-white text-black"
          >
            <div className="icon text-lg">{item.icon}</div>
            <div style={{ display: isOpen ? 'block' : 'none' }} className="link_text">
              {item.name}
            </div>
          </NavLink>
        ))}
      </div>
      <main className="w-full p-4">{children}</main>
    </div>
  );
};

export default ContactSidebar;

import React, { useState } from 'react';
import {   FaBars } from 'react-icons/fa';
import { LuLogOut } from 'react-icons/lu';
import { MdOutlineDateRange } from 'react-icons/md';
import { IoMdTime } from "react-icons/io";
import { NavLink } from 'react-router-dom';
import { CiEdit } from "react-icons/ci";
import { MdOutlineMessage } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { FaRegMessage } from "react-icons/fa6";

const Sidebarpsy = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const menuItem = [
    {
      path: '/Monprofil',
      name: 'Mon Profil',
      icon: <CiEdit />,
    },
    {
      path: '/Mesrendezvousmed',
      name: 'Disponibilité',
      icon: <IoMdTime />,
    },
    {
        path: '/Mesrendezvous',
        name: 'Mes rendez vous',
        icon: <MdOutlineDateRange />,
    },
    {
      path: '/Messagerie',
      name: 'Messagerie',
      icon: <FaRegMessage />,
    },
    {
      path: '/Moncomptepatient',
      name: 'Mon compte',
      icon: <FaRegUser />,
    },
    {
      path: '/Contact',
      name: 'Contact',
      icon: <MdOutlineMessage />,
    },
    {
      path: '/Deconnexion',
      name: 'Se déconnecter',
      icon: <LuLogOut />,
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
            EPSYCARE
          </h1>
          <div
            style={{ marginLeft: isOpen ? '80px' : '0px' }}
            className="bars flex items-center ml-10"
          >
            <FaBars onClick={toggle} className="text-white text-2xl" />
          </div>
        </div>
        {menuItem.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link flex items-center justify-between text-white px-3 py-2 gap-2 hover:bg-white hover:text-black transition-all duration-500"
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

export default Sidebarpsy;

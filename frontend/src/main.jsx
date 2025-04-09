import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";


import LoginPage from './Pages/LoginPage.jsx';

// sidebar
import Dashboard from './Pages/Dashboard.jsx';
import EnregistrerUnCourrier from "./Pages/EnregistrerUnCourrier.jsx"
import TraiterUCourrier from "./Pages/TraiterUCourrier.jsx"
import CourriersArrives from './Pages/CourriersArrives.jsx';
import CourriersDepart from './Pages/CourriersDepart.jsx';
import Settings from './Pages/Settings.jsx';


import AjouterUser from './Pages/AjouterUser.jsx';
import ListeContacts from './Pages/ListeContacts.jsx';
import Myprofile from './Pages/Myprofile.jsx';
import Myaccount from './Pages/Myaccount.jsx';
import Contacts from './Pages/Contacts.jsx';
import UpdateContact from './Pages/UpdateContact.jsx';



import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";

const router = createBrowserRouter([
  {

    path: "/",
    element: <App />,
  },
 
  {
    path: "/LoginPage",
    element: <LoginPage/>,
  },

  //sidebar
  {
    path: "/Dashboard",
    element: <Dashboard/>,
  },
  {
    path: "/Settings",
    element: <Settings/>,
  },
  {
    path: "/EnregistrerUnCourrier",
    element: <EnregistrerUnCourrier/>,
  },
  {
    path: "/TraiterUCourrier",
    element: <TraiterUCourrier/>,
  },
  {
    path: "/CourriersArrives",
    element: <CourriersArrives/>,
  },
  {
    path: "/CourriersDepart",
    element: <CourriersDepart/>,
  },


  {
    path: "/AjouterUser",
    element: <AjouterUser/>,
  },

  {
    path: "/ListeContacts",
    element: <ListeContacts/>,
  },
  {
    path: "/Myprofile",
    element: <Myprofile/>,
  },
  {
    path: "/Myaccount",
    element: <Myaccount/>,
  },
  {
    path: "/Contacts",
    element: <Contacts/>,
  },
  {

    path: "/UpdateContact/:id",
    element: <UpdateContact/>,
  },








]);



ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />

  </React.StrictMode>
);

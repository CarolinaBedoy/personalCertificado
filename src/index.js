import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './index.css';

import Main from './components/Main'

const router = createBrowserRouter([
 {
    path: "/",
    element: <Main/>
  },
 
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
<RouterProvider router={router}/> 
  </React.StrictMode>
);
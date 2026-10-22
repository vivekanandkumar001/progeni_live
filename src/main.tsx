import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes, routerFuture, renderFuture } from './routes';
import './index.css';

const router = createBrowserRouter(routes, { future: routerFuture });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} future={renderFuture} />
  </React.StrictMode>
);

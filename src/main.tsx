import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes, routerFuture, renderFuture } from './routes';
import './index.css';

const router = createBrowserRouter(routes, { future: routerFuture });

hydrateRoot(
  document.getElementById('root')!,
  <React.StrictMode>
    <RouterProvider router={router} future={renderFuture} />
  </React.StrictMode>,
);

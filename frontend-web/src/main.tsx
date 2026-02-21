import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import MainRoutes from './routes.tsx';
import './index.css';
import { Toaster } from 'sonner';

const router = createBrowserRouter(MainRoutes());
const root = document.getElementById('root') as HTMLElement;

if (!root){
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
      <Toaster position='top-right' richColors />
      <RouterProvider router={router} />
  </StrictMode>,
)
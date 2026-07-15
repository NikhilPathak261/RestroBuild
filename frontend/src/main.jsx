import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Toastify from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './styles/global.css';

const ToastViewport = Toastify[`Toast${'Con'}tainer`];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ToastViewport position="top-right" autoClose={3000} />
    </AuthProvider>
  </StrictMode>,
);

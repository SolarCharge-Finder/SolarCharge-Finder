import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Configure axios base URL from Vite env or fallback to local backend
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

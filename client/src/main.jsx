import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Configure axios base URL from Vite env or fallback to local backend
// Ensure we don't end up with duplicate `/api/api` when components use `/api/...` paths.
const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedBase = rawApiUrl ? rawApiUrl.replace(/\/api\/?$/i, '') : 'http://localhost:5001';
axios.defaults.baseURL = normalizedBase;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

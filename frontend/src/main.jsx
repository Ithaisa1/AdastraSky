import 'leaflet/dist/leaflet.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';
import './config/i18n.js';
import { applyStoredNightVision } from './hooks/useNightVision';

// Antes del primer render, para que no haya un destello de luz blanca
applyStoredNightVision();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);


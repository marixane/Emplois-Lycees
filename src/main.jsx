import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './compact-exercise.css';
import './test-title.css';
import './dark-background.css';
import './photo-controls-opaque.css';
import './page-status.css';
import './extra-pages-full-height.css';
import './header-duration-bigger.css';
import './points-buttons-below.css';
import './mobile-responsive.css';
import './bar-mark-vertical.css';
import './bar-mark-click-guard.js';
import './photo-buttons-below-zoom.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

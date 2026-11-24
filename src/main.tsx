import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import './archive-family.css';
import './archive-family-sync-v2.css';
const root = document.getElementById('root');
if (!root) throw new Error('Root container was not found');
ReactDOM.createRoot(root).render(
  <React.StrictMode><App /></React.StrictMode>,
);

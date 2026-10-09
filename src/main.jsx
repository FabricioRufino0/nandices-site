import React from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import './refinements.css';
import './pages.css';
import './experience.css';
import './special-pages.css';

const root=document.getElementById('root');
if(import.meta.env.DEV)createRoot(root).render(<App/>);
else hydrateRoot(root,<App/>);

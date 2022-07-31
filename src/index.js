import React from 'react';
import { createRoot } from 'react-dom/client';
import Shorten from './components/form/Shorten.jsx';

const shorten_container = document.getElementById('shorten');
if (shorten_container) {
    const shorten_root = createRoot(shorten_container);
    shorten_root.render(<Shorten />);
}
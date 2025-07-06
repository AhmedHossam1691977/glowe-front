import { StrictMode } from 'react' // ✨ إعادة StrictMode
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'; // ✨ استيراد HelmetProvider

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode> {/* ✨ تغليف التطبيق بـ StrictMode */}
    <HelmetProvider> {/* ✨ تغليف التطبيق بـ HelmetProvider */}
      <App />
    </HelmetProvider>
  </StrictMode>
)
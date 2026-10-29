import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageLoader from './components/global/PageLoader.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';

gsap.registerPlugin(ScrollTrigger);

// Images/fonts finishing load after mount can shift page height, which
// leaves earlier ScrollTrigger start/end positions stale, refresh once
// everything has settled so scroll-triggered reveals fire at the right spot.
window.addEventListener('load', () => ScrollTrigger.refresh());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <PageLoader>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PageLoader>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

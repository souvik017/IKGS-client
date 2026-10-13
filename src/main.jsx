import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { MotionConfig } from 'framer-motion';

import App from './App';
import BootLoader from './components/ui/BootLoader';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {/* reducedMotion="user" honours the OS/browser preference globally */}
        <MotionConfig reducedMotion="user">
          <SettingsProvider>
            <AuthProvider>
              {/* Fades out the inline boot loader from index.html once ready. */}
              <BootLoader />
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    borderRadius: '12px',
                    background: '#11101F',
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'Manrope, sans-serif',
                  },
                }}
              />
            </AuthProvider>
          </SettingsProvider>
        </MotionConfig>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

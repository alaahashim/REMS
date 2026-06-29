import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './services/apiClient';
import './index.css'; 
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext.jsx'; 
import { LanguageProvider } from './context/LanguageContext'; // <--- استيراد الجديد

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider> {/* <--- تغليف التطبيق هنا */}
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
)

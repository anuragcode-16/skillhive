import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import NavigationProvider from './context/navigation';
import { AuthProvider } from './context/auth';
import { store } from './store';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NavigationProvider>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </GoogleOAuthProvider>
      </Provider>
    </NavigationProvider>
  </React.StrictMode>
);

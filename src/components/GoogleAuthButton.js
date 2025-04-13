import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/auth';
import { useGoogleAuthMutation } from '../store/apis/authApi';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';

const GoogleAuthButton = ({ buttonText = "Sign in with Google", className = "" }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleAuth] = useGoogleAuthMutation();

  // Add a bypass function for direct login
  const bypassGoogleAuth = () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate a delay
    setTimeout(() => {
      const mockUser = {
        id: 'google-mock-id-' + Date.now(),
        name: 'Google User',
        email: 'google-user@example.com',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google'
      };
      
      // Store mock token and login
      const mockToken = 'google-mock-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      login(mockUser);
      
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // TEMPORARY: Bypass actual Google API call for testing
        // Remove in production
        bypassGoogleAuth();
        return;
        
        // Get user info from Google
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`
            }
          }
        );

        const googleUser = {
          googleId: userInfoResponse.data.sub,
          username: userInfoResponse.data.name,
          email: userInfoResponse.data.email,
          picture: userInfoResponse.data.picture
        };

        try {
          // Send user data to backend
          const response = await googleAuth(googleUser).unwrap();
          
          const userData = {
            id: response.user.id,
            name: response.user.username,
            email: response.user.email,
            picture: response.user.picture || null,
            provider: 'google'
          };
          
          // Store token and login via AuthContext
          localStorage.setItem('authToken', response.token);
          login(userData);
        } catch (err) {
          console.error('Error authenticating with Google on server:', err);
          setError(err.data?.message || 'Error authenticating with Google. Please try again.');
        }
        
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setError('Error getting Google user info. Please try again.');
        console.error('Error getting user info:', error);
      }
    },
    onError: (errorResponse) => {
      setIsLoading(false);
      setError('Google login failed. Please try again.');
      console.error('Google Login Failed:', errorResponse);
    }
  });

  return (
    <div className="w-full">
      <button
        onClick={() => bypassGoogleAuth()}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      >
        <FcGoogle className="text-xl" />
        <span className="text-gray-700 font-medium">
          {isLoading ? "Signing in..." : buttonText}
        </span>
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default GoogleAuthButton; 
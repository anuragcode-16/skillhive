import { useEffect } from 'react';
import { useAuth } from '../context/auth';
import { useNavigationContext } from '../context/navigation';

const ProtectedRoute = ({ children, path }) => {
  const { currentUser } = useAuth();
  const { currentPath, navigate } = useNavigationContext();

  // Check if the current path matches the path prop
  const isCurrentPath = currentPath === path;

  useEffect(() => {
    if (isCurrentPath && !currentUser) {
      // If user is not logged in, redirect to login page
      navigate('/');
    }
  }, [currentUser, isCurrentPath, navigate]);

  // Only render children if the current path matches and user is authenticated
  return isCurrentPath && currentUser ? children : null;
};

export default ProtectedRoute; 
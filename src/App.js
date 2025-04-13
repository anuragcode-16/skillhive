import { useEffect } from 'react';
import { useAuth } from './context/auth';
import { useNavigationContext } from './context/navigation';
import Route from './features/Route';
import ProtectedRoute from './features/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Learning from './pages/Learning';
import Navbar from './components/Navbar';
// import useNavigation from './hooks/useNavigation';
import Profile from './pages/Profile';
import Podcasts from './pages/Podcasts';
import Jobs from './pages/Jobs';
import Timetable from './pages/Timetable';
import Admin from './pages/Admin';

function App() {
  const { currentUser, loading } = useAuth();
  const { currentPath, navigate } = useNavigationContext();
  
  useEffect(() => {
    // If user is logged in and on the root path, redirect to dashboard
    if (currentUser && currentPath === '/') {
      navigate('/dashboard');
    }
  }, [currentUser, currentPath, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {/* Public Routes */}
        <Route path="/">
          {!currentUser ? <Login /> : null}
        </Route>
        
        {/* Protected Routes */}
        <ProtectedRoute path="/dashboard">
          <Dashboard />
        </ProtectedRoute>
        <ProtectedRoute path="/about">
          <About />
        </ProtectedRoute>
        <ProtectedRoute path="/learning">
          <Learning />
        </ProtectedRoute>
        <ProtectedRoute path="/profile">
          <Profile />
        </ProtectedRoute>
        <ProtectedRoute path="/podcasts">
          <Podcasts />
        </ProtectedRoute>
        <ProtectedRoute path="/jobs">
          <Jobs />
        </ProtectedRoute>
        <ProtectedRoute path="/timetable">
          <Timetable />
        </ProtectedRoute>
        <ProtectedRoute path="/admin">
          <Admin />
        </ProtectedRoute>
      </main>
    </div>
  );
}

export default App; 
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { SpotifyAuthProvider } from './context/SpotifyAuthContext';
import { PlayerCoordinatorProvider } from './context/PlayerCoordinatorContext';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { AuthPage } from './pages/AuthPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LikedPage } from './pages/LikedPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminUploadPage } from './pages/AdminUploadPage';
import { AdminContentPage } from './pages/AdminContentPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { SpotifyCallbackPage } from './pages/SpotifyCallbackPage';
import { Sidebar } from './components/Sidebar';
import { MobileMenu } from './components/MobileMenu';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { SpotifyPlayer } from './components/SpotifyPlayer';
import { LoadingAnimation } from './components/LoadingAnimation';
import { authService } from '../services/authService';

type UserType = 'premium' | 'regular';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState<UserType>('regular');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.role === 'admin');
          setUserType(userData.userType || 'regular');
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setUserType(userData.userType || 'regular');
    setIsAdmin(false);
    navigate('/');
    toast.success('Welcome back!');
  };

  const handleAdminLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(true);
    setUserType('premium');
    navigate('/admin');
    toast.success('Admin login successful!');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserType('regular');
      setUser(null);
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  const handleNavigate = (page: string) => {
    const routeMap: { [key: string]: string } = {
      'home': '/',
      'search': '/search',
      'liked': '/liked',
      'playlists': '/playlists',
      'profile': '/profile',
      'settings': '/settings',
      'admin-overview': '/admin',
      'admin-upload': '/admin/upload',
      'admin-content': '/admin/content',
      'admin-users': '/admin/users',
      'admin-profile': '/admin/profile',
    };
    navigate(routeMap[page] || '/');
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search') return 'search';
    if (path === '/liked') return 'liked';
    if (path.startsWith('/playlists')) return 'playlists';
    if (path === '/profile') return 'profile';
    if (path === '/settings') return 'settings';
    if (path === '/admin') return 'admin-overview';
    if (path === '/admin/upload') return 'admin-upload';
    if (path === '/admin/content') return 'admin-content';
    if (path === '/admin/users') return 'admin-users';
    if (path === '/admin/profile') return 'admin-profile';
    return 'home';
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  // Show admin login page if accessing /admin route
  if (location.pathname.startsWith('/admin') && !isAuthenticated) {
    return <AdminLoginPage onAdminLogin={handleAdminLogin} onBackToHome={() => navigate('/')} />;
  }

  // Show regular login page for non-authenticated users
  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <PlayerCoordinatorProvider>
      <PlayerProvider>
        <div className="min-h-screen bg-black text-white">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              currentPage={getCurrentPage()}
              onNavigate={handleNavigate}
              isAdmin={isAdmin}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            currentPage={getCurrentPage()}
            onNavigate={handleNavigate}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />

          {/* Main Content */}
          <main className="lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8" key={location.pathname}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage userType={userType} />} />
              <Route path="/liked" element={<LikedPage />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
              <Route path="/profile" element={<UserProfilePage userType={userType} />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/spotify/callback" element={<SpotifyCallbackPage />} />
              {isAdmin && (
                <>
                  <Route path="/admin" element={<AdminOverviewPage />} />
                  <Route path="/admin/upload" element={<AdminUploadPage />} />
                  <Route path="/admin/content" element={<AdminContentPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/profile" element={<AdminProfilePage />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Players */}
          <MiniPlayer />
          <FullPlayer />
          <SpotifyPlayer />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              },
            }}
          />
        </div>
      </PlayerProvider>
    </PlayerCoordinatorProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SpotifyAuthProvider>
        <AppContent />
      </SpotifyAuthProvider>
    </BrowserRouter>
  );
}

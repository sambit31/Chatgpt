import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/base.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Navigation from './pages/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {

  const location = useLocation();

  const hideNavigation = location.pathname === '/chat';
  return (
    <ThemeProvider>
      <AuthProvider>
         {!hideNavigation && <Navigation />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/*<Route element={<ProtectedRoute />}>*/}
            <Route path="/chat" element={<Chat />} />
          {/*</Route>*/}
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

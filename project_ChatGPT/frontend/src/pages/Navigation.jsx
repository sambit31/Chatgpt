import React from 'react';
import { Link } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import Button from '../ui/Button';
import '../styles/navigation.css';

const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">MyApp</Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-link">Register</Link>
            </>
          ) : (
            <>
              <span className="navbar-user">Hello, {user?.name}</span>
              <Button variant="ghost" size="small" onClick={logout}>
                Logout
              </Button>
            </>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

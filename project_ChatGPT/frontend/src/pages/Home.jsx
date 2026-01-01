import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/base.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="page">
      <div className="page-container">
        <h1>Welcome to MyApp</h1>
        {isAuthenticated ? (
          <div className="card">
            <h2>Hello, {user?.name}! 👋</h2>
            <p>You are successfully logged in.</p>
          </div>
        ) : (
          <div className="card">
            <h2>Get Started</h2>
            <p>Please login or register to continue.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Link to="/login">
                <Button>Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">Register</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/base.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    const success = login(email, password);
    if (!success) {
      setError('Login failed. Please try again.');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  axios.post('http://localhost:5000/api/auth/login',{
    email: email,
    password: password
  },{withCredentials:true}).then((res)=>{
    console.log(res);
    Navigate("/");
  }).catch((err)=>{
    console.log(err);
  });

  return (
    <div className="page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Login</h1>
          <p className="auth-subtitle">Welcome back! Please login to your account.</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="auth-button">Login</Button>
          </form>
          
          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
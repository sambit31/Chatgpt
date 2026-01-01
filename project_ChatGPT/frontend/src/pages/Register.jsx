import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';  
import '../styles/base.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { isAuthenticated } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    const success = register(formData);
    if (!success) {
      setError('Registration failed. Please try again.');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Register</h1>
          <p className="auth-subtitle">Create your account to get started.</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="auth-button">Register</Button>
          </form>
          
          <p className="auth-link">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;
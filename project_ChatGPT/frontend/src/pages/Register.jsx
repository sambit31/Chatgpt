import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../styles/registration.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
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

    try {
      setLoading(true);

      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          email: formData.email,
          password: formData.password,
          fullName: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
        },
        { withCredentials: true }
      );


      // update auth context with backend response
      register(res.data.user);

      navigate('/login');
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email already registered. Please login.');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/login" replace />;
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

            <Button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
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

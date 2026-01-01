import React, { createContext, useState, useContext } from 'react';
import '../styles/base.css';


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email, password) => {
    // Simple mock authentication
    if (email && password) {
      setUser({ email, name: email.split('@')[0] });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const register = (data) => {
    if (data.email && data.password) {
      setUser({ 
        email: data.email, 
        name: `${data.firstName} ${data.lastName}` 
      });
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
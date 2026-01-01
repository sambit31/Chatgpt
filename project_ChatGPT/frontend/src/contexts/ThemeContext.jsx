import React, { createContext, useContext, useState, useEffect } from 'react';
import '../styles/base.css';

// ============================================
// THEME CONTEXT
// ============================================
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = sessionStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { ThemeProvider, useTheme, ThemeContext };
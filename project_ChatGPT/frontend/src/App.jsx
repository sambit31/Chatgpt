import { Routes, Route } from 'react-router-dom';
import './styles/base.css';


import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Navigation from './pages/Navigation';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

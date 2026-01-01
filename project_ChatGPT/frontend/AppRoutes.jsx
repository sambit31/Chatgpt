import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './src/pages/Register';
import Login from './src/pages/Login';
import Home from './src/pages/Home';

const AppRoutes = () => {
  return (
     <BrowserRouter>
    <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/Register' element={<Register />}/>
        <Route path='/login' element={<Login />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
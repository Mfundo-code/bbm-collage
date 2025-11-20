// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import AutoLogin from './pages/AutoLogin';
import Home from './pages/Home';
import Suggestions from './pages/Suggestions';
import Announcements from './pages/Announcements';
import Testimonies from './pages/Testimonies';
import SundayServices from './pages/SundayServices';
import Missionaries from './pages/Missionaries';
import Alumni from './pages/Alumni';
import Homiletics from './pages/Homiletics';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auto-login" element={<AutoLogin />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Home />} />
        <Route path="suggestions" element={<Suggestions />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="testimonies" element={<Testimonies />} />
        <Route path="sunday-services" element={<SundayServices />} />
        <Route path="missionaries" element={<Missionaries />} />
        <Route path="alumni" element={<Alumni />} />
        <Route path="homiletics" element={<Homiletics />} />
      </Route>

      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

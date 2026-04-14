import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import Chat from './pages/Chat';

// This MAGIC code automatically attaches your secure login token to every backend request!
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('drishyamitra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Protects pages so you can't see them if not logged in
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('drishyamitra_token');
  return token ? children : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
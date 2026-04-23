import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/pages/Login';
import Register from './components/pages/Registration';
import { Dashboard } from './components/pages/Dashboard';
import { HistoryPage } from './components/pages/HistoryPage';
import './index.css';

import { SupportPage } from './components/pages/SupportPage';
import { AdminDashboard } from './components/pages/AdminDashboard';

// Enhanced Protected Route Component for Role-Based Access
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: React.ReactNode; 
  allowedRole: 'user' | 'admin' 
}) => {
  const isAuthenticated = localStorage.getItem('auth_token') === 'session_active';
  const userRole = localStorage.getItem('user_role');

  // 1. If not logged in, always go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the user's role doesn't match the required role for this page
  if (userRole !== allowedRole) {
    // Kick them to their appropriate dashboard instead of just login
    return <Navigate to={userRole === 'admin' ? '/admin' : '/home'} replace />;
  }

  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Only Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRole="user">
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute allowedRole="user">
              <SupportPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all for 404s or unauthorized access */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
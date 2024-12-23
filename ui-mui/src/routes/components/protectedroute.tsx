import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token'); // Check for token in localStorage

  if (!token) {
    // Redirect to login page if token is not found
    return <Navigate to="/sign-in" replace />;
  }

  // Render the children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check local storage for the token
  const token = localStorage.getItem('token');
  
  // If no token, kick them to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, let them see the page
  return children;
};

export default PrivateRoute;
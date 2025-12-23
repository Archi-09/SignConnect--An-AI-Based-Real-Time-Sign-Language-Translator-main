
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if a token exists in local storage.
    // In a real app, you might also verify if the token is not expired.
    const token = localStorage.getItem("token");

    if (!token) {
        // If no token found, redirect to the login page immediately.
        // replace={true} prevents them from clicking "back" to return here.
        return <Navigate to="/login" replace={true} />;
    }

    // If token exists, render the child route (the protected page).
    return <Outlet />;
};

export default ProtectedRoute;
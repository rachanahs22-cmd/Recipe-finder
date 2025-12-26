import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading auth status...</div>;
    }

    if (!user) {
        // Redirect to Home page if not logged in (as requested)
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, allowedRoles, children }) {
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Rolü uygun değilse login veya başka sayfaya yönlendir
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;

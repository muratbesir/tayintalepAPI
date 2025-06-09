import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import KullaniciTaleplerPage from "./components/KullaniciTaleplerPage";
import YeniTalep from "./components/YeniTalepForm";
import YoneticiTalepler from "./components/YoneticiTalepler";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    const [user, setUser] = useState(undefined);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                setUser({
                    id: decoded.nameid || decoded.sub,
                    role:
                        decoded.role ||
                        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                        "", // null kontrolü
                });
                setToken(storedToken);
            } catch (err) {
                console.error("Token decode error:", err);
                setUser(null);
                setToken(null);
                localStorage.removeItem("token");
            }
        } else {
            setUser(null);
        }
    }, []);

    if (user === undefined) return <div>Yükleniyor...</div>;

    const handleLogin = (token, userData) => {
        localStorage.setItem("token", token);
        setToken(token);
        setUser(userData);
    };

    return (
        <Routes>
            <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
            />

            <Route
                path="/"
                element={
                    user ? (
                        <Layout />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route
                    index
                    element={
                        <Navigate
                            to={user?.role === "Yonetici" ? "/yonetici/talepler" : "/dashboard"}
                            replace
                        />
                    }
                />

                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute user={user} allowedRoles={["Personel"]}>
                            <Dashboard userId={user?.id} token={token} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="taleplerim"
                    element={
                        <ProtectedRoute user={user} allowedRoles={["Personel"]}>
                            <KullaniciTaleplerPage userId={user?.id} token={token} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="yeni-talep"
                    element={
                        <ProtectedRoute user={user} allowedRoles={["Personel"]}>
                            <YeniTalep userId={user?.id} token={token} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="yonetici/talepler"
                    element={
                        <ProtectedRoute user={user} allowedRoles={["Yonetici"]}>
                            <YoneticiTalepler token={token} />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;

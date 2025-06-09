import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout = () => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setUserRole(storedRole.trim());
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
        window.location.reload();
    };

    return (
        <div>
            <header className="bg-primary text-white p-3">
                <h1 className="text-center">Adalet Bakanlığı Tayin Sistemi</h1>
            </header>

            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to="/dashboard">Ana Sayfa</Link>
                    <div>
                        <ul className="navbar-nav me-auto">
                            {/* Yalnızca Yonetici DEĞİLSE menüleri göster */}
                            {userRole !== 'Yonetici' && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/taleplerim">Taleplerim</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/yeni-talep">Yeni Talep</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/profil">Profil</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                    <button className="btn btn-outline-danger" onClick={handleLogout}>
                        Çıkış Yap
                    </button>
                </div>
            </nav>

            <main className="container my-4">
                <Outlet />
            </main>

            <footer className="bg-dark text-white text-center py-3 mt-auto">
                © 2025 T.C. Adalet Bakanlığı
            </footer>
        </div>
    );
};

export default Layout;

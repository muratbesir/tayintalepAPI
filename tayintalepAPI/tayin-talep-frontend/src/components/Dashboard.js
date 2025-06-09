import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [profil, setProfil] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Giriş yapılmamışsa login sayfasına yönlendir
            return;
        }

        axios.get('https://localhost:7161/api/kullanici/profil', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setProfil(res.data);
            })
            .catch(err => {
                setError('Bilgiler alınamadı: ' + (err.response?.data || err.message));
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h2>Hoş geldiniz</h2>
            <div className="card p-4 shadow-sm mt-3">
                <p><strong>Ad Soyad:</strong> {profil.adSoyad}</p>
                <p><strong>Sicil No:</strong> {profil.sicilNo}</p>
                <p><strong>Unvan:</strong> {profil.unvan}</p>
            </div>

            <div className="mt-4">
                <Link to="/yeni-talep" className="btn btn-primary">Tayin Talebi Oluştur</Link>
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profil = () => {
    const [profil, setProfil] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Giriş yapılmamış.');
            setLoading(false);
            return;
        }

        axios.get('https://localhost:7161/api/kullanici/profil', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setProfil(res.data);
            })
            .catch(err => {
                const errMsg = err.response?.data || err.message;
                setError('Bilgiler alınamadı: ' + errMsg);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Yükleniyor...</p>;
    if (error) return <p className="text-danger">{error}</p>;

    return (
        <div className="container mt-4">
            <h2 className="mb-3">Profil Bilgileri</h2>
            <div className="card p-4 shadow-sm mt-3">
                <p><strong>Ad Soyad:</strong> <span className="text-primary">{profil.adSoyad}</span></p>
                <p><strong>Sicil No:</strong> <span className="text-primary">{profil.sicilNo}</span></p>
                <p><strong>Unvan:</strong> <span className="text-primary">{profil.unvan}</span></p>
            </div>


            <div className="mt-4 text-end">
                <a href="/yeni-talep" className="btn btn-primary">Tayin Talebi Oluştur</a>
            </div>
        </div>
    );
};

export default Profil;

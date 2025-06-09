import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const Taleplerim = () => {
    const [talepler, setTalepler] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTalepler();
    }, []);

    const fetchTalepler = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('https://localhost:7161/api/talep/kullanici', {
                headers: getAuthHeaders(),
            });
            setTalepler(response.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                // Token geçersiz veya süresi dolmuş olabilir, çıkış yap ve login sayfasına yönlendir
                handleLogout();
            } else {
                setError('Talepler getirilemedi: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="container mt-5">
            <h2>Taleplerim</h2>

            <div className="d-flex justify-content-between mb-3">
                <button onClick={handleLogout} className="btn btn-secondary">
                    Çıkış Yap
                </button>

                <Link to="/yeni-talep" className="btn btn-primary">
                    Yeni Talep Oluştur
                </Link>
            </div>

            {loading && <p>Yükleniyor...</p>}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                           
                            <th>Başlık</th>
                            <th>Talep Türü</th>
                            <th>Hedef Adliye</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {talepler.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    Henüz talebiniz bulunmamaktadır.
                                </td>
                            </tr>
                        ) : (
                            talepler.map((talep) => (
                                <tr key={talep.id}>
                                    
                                    <td>{talep.baslik}</td>
                                    <td>{talep.talepTuru}</td>
                                    <td>{talep.hedefAdliye}</td>
                                    <td>{talep.durum}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Taleplerim;

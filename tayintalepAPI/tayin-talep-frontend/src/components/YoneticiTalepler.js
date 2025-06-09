import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, isAuthenticated, handleApiError } from '../utils/auth';

const YoneticiTalepler = () => {
    const [talepler, setTalepler] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        fetchTalepler();
    }, [navigate]);

    const fetchTalepler = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7161/api/yonetici/talepler', {
                headers: getAuthHeaders(),
            });
            setTalepler(response.data);
            setError('');
        } catch (err) {
            const errorMessage = handleApiError(err);
            if (errorMessage) {
                setError('Talepler getirilemedi: ' + errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const setButtonLoading = (id, isLoading) => {
        setActionLoading(prev => ({
            ...prev,
            [id]: isLoading
        }));
    };

    const onayla = async (id) => {
        try {
            setButtonLoading(id, true);
            setError('');

            await axios.post(`https://localhost:7161/api/yonetici/talep-onayla/${id}`, null, {
                headers: getAuthHeaders(),
            });

            await fetchTalepler();
        } catch (err) {
            const errorMessage = handleApiError(err);
            if (errorMessage) {
                setError('Onaylama başarısız: ' + errorMessage);
            }
        } finally {
            setButtonLoading(id, false);
        }
    };

    const reddet = async (id) => {
        if (!window.confirm('Bu talebi reddetmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            setButtonLoading(id, true);
            setError('');

            await axios.post(`https://localhost:7161/api/yonetici/talep-reddet/${id}`, null, {
                headers: getAuthHeaders(),
            });

            await fetchTalepler();
        } catch (err) {
            const errorMessage = handleApiError(err);
            if (errorMessage) {
                setError('Reddetme başarısız: ' + errorMessage);
            }
        } finally {
            setButtonLoading(id, false);
        }
    };

    const getStatusBadge = (durum) => {
        const statusClasses = {
            'Beklemede': 'bg-warning text-dark',
            'Onaylandı': 'bg-success',
            'Reddedildi': 'bg-danger'
        };

        return (
            <span className={`badge ${statusClasses[durum] || 'bg-secondary'}`}>
                {durum}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p className="mt-2">Talepler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Yönetici Talepler</h2>
                <button
                    className="btn btn-outline-primary"
                    onClick={fetchTalepler}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Yenile
                </button>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError('')}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    {talepler.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <h4 className="mt-3 text-muted">Talep Bulunamadı</h4>
                            <p className="text-muted">Henüz işlem bekleyen talep bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Ad Soyad</th>
                                        <th>Başlık</th>
                                        <th>Talep Türü</th>
                                        <th>Hedef Adliye</th>
                                        <th>Durum</th>
                                        <th width="200">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {talepler.map(talep => (
                                        <tr key={talep.id}>
                                            <td><strong>{talep.adSoyad}</strong></td>
                                            <td>{talep.baslik}</td>
                                            <td><span className="badge bg-info">{talep.talepTuru}</span></td>
                                            <td>{talep.hedefAdliye}</td>
                                            <td>{getStatusBadge(talep.durum)}</td>
                                            <td>
                                                {talep.durum === 'Beklemede' ? (
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => onayla(talep.id)}
                                                            disabled={actionLoading[talep.id]}
                                                        >
                                                            {actionLoading[talep.id] ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    Onaylanıyor...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-check-lg me-1"></i>
                                                                    Onayla
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => reddet(talep.id)}
                                                            disabled={actionLoading[talep.id]}
                                                        >
                                                            {actionLoading[talep.id] ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    Reddediliyor...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-x-lg me-1"></i>
                                                                    Reddet
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">İşlem tamamlandı</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YoneticiTalepler;

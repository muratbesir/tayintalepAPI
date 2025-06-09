import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, logout, handleApiError } from '../utils/auth';

const YeniTalepForm = () => {
    const [baslik, setBaslik] = useState('');
    const [talepTuru, setTalepTuru] = useState('');
    const [hedefAdliye, setHedefAdliye] = useState('');
    const [adliyeler, setAdliyeler] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [adliyeLoading, setAdliyeLoading] = useState(true);
    const [adSoyad, setAdSoyad] = useState(''); // Yeni: AdSoyad state
    const navigate = useNavigate();

    useEffect(() => {
        setAdliyeLoading(true);
        axios.get('https://localhost:7161/api/adliye/liste', {
            headers: getAuthHeaders(),
        })
            .then(res => {
                setAdliyeler(res.data);
                setError('');
            })
            .catch(err => {
                const errorMessage = handleApiError(err);
                if (errorMessage) {
                    setError('Adliye listesi yüklenemedi: ' + errorMessage);
                }
            })
            .finally(() => setAdliyeLoading(false));

        // Yeni: Eğer kullanıcı bilgisi backend'den alınacaksa, ya burada ya başka endpointten çekebilirsiniz.
        // Örnek:
        axios.get('https://localhost:7161/api/kullanici/bilgiler', {
            headers: getAuthHeaders(),
        }).then(res => {
            setAdSoyad(res.data.adSoyad || '');
        }).catch(() => {
            // Hata durumunda boş bırakabiliriz ya da logout yapılabilir
        });
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!baslik.trim()) errors.baslik = 'Başlık gerekli';
        if (!talepTuru.trim()) errors.talepTuru = 'Talep türü gerekli';
        if (!hedefAdliye) errors.hedefAdliye = 'Adliye seçimi gerekli';
        if (!adSoyad.trim()) errors.adSoyad = 'Ad Soyad gerekli';  // Yeni validasyon

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(
                'https://localhost:7161/api/talep',
                {
                    Baslik: baslik.trim(),
                    TalepTuru: talepTuru.trim(),
                    HedefAdliye: hedefAdliye,
                    AdSoyad: adSoyad.trim(),  // Yeni alanı backend'e gönderiyoruz
                },
                {
                    headers: getAuthHeaders(),
                }
            );

            navigate('/taleplerim');
        } catch (error) {
            const errorMessage = handleApiError(error);
            if (errorMessage) {
                setError(`Talep oluşturulamadı: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (adliyeLoading) {
        return (
            <div className="container mt-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p className="mt-2">Adliye listesi yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Yeni Tayin Talebi</h2>

            <button onClick={handleLogout} className="btn btn-secondary mb-3">
                Geri Dön
            </button>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Ad Soyad: <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        value={adSoyad}
                        onChange={(e) => setAdSoyad(e.target.value)}
                        placeholder="Ad Soyad giriniz"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Başlık: <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        value={baslik}
                        onChange={(e) => setBaslik(e.target.value)}
                        placeholder="Talep başlığını giriniz"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Talep Türü: <span className="text-danger">*</span></label>
                    <select
                        className="form-select"
                        value={talepTuru}
                        onChange={(e) => setTalepTuru(e.target.value)}
                        disabled={loading}
                        required
                    >
                        <option value="">-- Talep Türü Seçiniz --</option>
                        <option value="Tayin">Tayin</option>
                        <option value="Nakil">Nakil</option>
                        <option value="Görevlendirme">Görevlendirme</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Adliye Tercihi: <span className="text-danger">*</span></label>
                    <select
                        className="form-select"
                        value={hedefAdliye}
                        onChange={(e) => setHedefAdliye(e.target.value)}
                        disabled={loading}
                        required
                    >
                        <option value="">-- Adliye Seçiniz --</option>
                        {adliyeler.map((adliye, index) => (
                            <option key={index} value={adliye}>
                                {adliye}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Gönderiliyor...
                        </>
                    ) : (
                        'Talep Gönder'
                    )}
                </button>
            </form>
        </div>
    );
};

export default YeniTalepForm;

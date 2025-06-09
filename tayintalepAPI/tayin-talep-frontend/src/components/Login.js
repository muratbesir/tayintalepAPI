import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLogin }) => {
    const [sicilNo, setSicilNo] = useState('');
    const [sifre, setSifre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!sicilNo.trim()) {
            setError('Sicil No boş olamaz.');
            return;
        }
        if (!sifre.trim()) {
            setError('Şifre boş olamaz.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/kullanici/giris', {
                SicilNo: sicilNo,
                Sifre: sifre
            });

            const { token } = response.data;

            if (!token) {
                setError('Token bilgisi eksik.');
                setLoading(false);
                return;
            }

            const decoded = jwtDecode(token);
            const role =
                decoded.role ||
                decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const userId =
                decoded.id ||
                decoded.nameid ||
                decoded.sub ||
                decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            if (!role || !userId) {
                setError('JWT içinden rol veya kullanıcı bilgisi çözülemedi.');
                setLoading(false);
                return;
            }

            // ✅ Token ve Rol bilgisini localStorage'a yaz
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // App.js'e bildir
            if (onLogin) {
                onLogin(token, { id: userId, role });
            }

            // Role göre yönlendir
            if (role === 'Yonetici') {
                navigate('/yonetici/talepler');
            } else {
                navigate('/taleplerim');
            }

        } catch (err) {
            setError('Giriş başarısız: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="text-center mb-4">Bilgilerinizi Giriniz</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Personel Sicil No:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={sicilNo}
                        onChange={(e) => setSicilNo(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Şifre:</label>
                    <input
                        type="password"
                        className="form-control"
                        value={sifre}
                        onChange={(e) => setSifre(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
        </div>
    );
};

export default Login;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdliyeSelect from './AdliyeSelect';

const talepTurleri = ['tayin', 'yer değişikliği', 'Eş Sebebi', 'Diğer'];

const KullaniciTaleplerPage = () => {
    const [talepler, setTalepler] = useState([]);
    const [error, setError] = useState(null);

    const [formVisible, setFormVisible] = useState(false);
    const [baslik, setBaslik] = useState('');
    const [talepTuru, setTalepTuru] = useState(talepTurleri[0]);
    const [hedefAdliye, setHedefAdliye] = useState(''); // burada backend ile isim uyumu
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('/api/talep', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setTalepler(res.data))
            .catch(err => setError(err.response?.data || err.message || 'Talepler alınamadı'));
    }, []);

    const handleTalepEkle = () => {
        if (!baslik.trim()) {
            setError('Başlık boş olamaz');
            return;
        }
        if (!hedefAdliye) {
            setError('Adliye seçimi zorunludur');
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        axios.post('/api/talep', {
            baslik,
            talepTuru,
            hedefAdliye // backend ile eşleşen alan adı
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setTalepler([...talepler, res.data]);
                setBaslik('');
                setTalepTuru(talepTurleri[0]);
                setHedefAdliye('');
                setFormVisible(false);
            })
            .catch(err => {
                const data = err.response?.data;
                setError(typeof data === 'string' ? data : JSON.stringify(data));
            })
            .finally(() => setLoading(false));
    };

    if (error) {
        const errorMessage = typeof error === 'string'
            ? error
            : error?.title || JSON.stringify(error);
        return <div className="alert alert-danger">Hata: {errorMessage}</div>;
    }

    return (
        <div>
            <h2>Benim Taleplerim</h2>
            <ul>
                {talepler.map(t => (
                    <li key={t.id}>{t.baslik} - {t.durum}</li>
                ))}
            </ul>

            {!formVisible && (
                <button onClick={() => setFormVisible(true)} className="btn btn-primary mt-3">
                    Yeni Talep Oluştur
                </button>
            )}

            {formVisible && (
                <div className="mt-3">
                    <input
                        type="text"
                        value={baslik}
                        onChange={e => setBaslik(e.target.value)}
                        placeholder="Talep Başlığı"
                        className="form-control mb-2"
                        disabled={loading}
                    />

                    <select
                        value={talepTuru}
                        onChange={e => setTalepTuru(e.target.value)}
                        className="form-select mb-2"
                        disabled={loading}
                    >
                        {talepTurleri.map(tur => (
                            <option key={tur} value={tur}>{tur}</option>
                        ))}
                    </select>

                    <AdliyeSelect
                        value={hedefAdliye}
                        onChange={setHedefAdliye}
                    />

                    <button
                        onClick={handleTalepEkle}
                        disabled={loading}
                        className="btn btn-success me-2 mt-2"
                    >
                        {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                    </button>
                    <button
                        onClick={() => setFormVisible(false)}
                        disabled={loading}
                        className="btn btn-secondary mt-2"
                    >
                        İptal
                    </button>
                </div>
            )}
        </div>
    );
};

export default KullaniciTaleplerPage;

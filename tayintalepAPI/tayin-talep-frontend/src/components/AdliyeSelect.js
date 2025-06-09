import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdliyeSelect = ({ value, onChange }) => {
    const [adliyeler, setAdliyeler] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const url = 'https://localhost:7161/api/adliye/liste';
        axios.get(url)
            .then(res => setAdliyeler(res.data))
            .catch(err => setError('Adliyeler yüklenemedi: ' + err.message));
    }, []);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <label htmlFor="adliye">Adliye Seç:</label>
            <select
                id="adliye"
                value={value}
                onChange={e => onChange(e.target.value)}

            >
                <option value="" disabled>Bir adliye seçin</option>
                {adliyeler.map(adliye => (
                    <option key={adliye} value={adliye}>{adliye}</option>
                ))}
            </select>
        </div>
    );
};
export default AdliyeSelect;

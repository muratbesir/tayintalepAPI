// src/utils/errorHandler.js
export const handleApiError = (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }
    return error.response?.data?.message || error.message || 'Bir hata oluştu';
};

// Ek olarak başka hata türleri için de fonksiyonlar ekleyebilirsiniz
export const handleNetworkError = (error) => {
    if (!navigator.onLine) {
        return 'İnternet bağlantınızı kontrol edin';
    }
    return handleApiError(error);
};
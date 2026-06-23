import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// CẤU HÌNH INTERCEPTOR: Tự động cấu hình đính kèm mã JWT cho mọi request
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Gửi yêu cầu quên mật khẩu để Backend gửi mail
export const forgotPassword = (email) => api.post(`/auth/forgot-password?email=${email}`);

// Gửi mã Token xác thực kèm mật khẩu mới để cập nhật
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });

// Cổng API xử lý đổi mật khẩu
export const changePassword = (userId, oldPassword, newPassword) =>
    api.post('/auth/change-password', { userId, oldPassword, newPassword });

export default api;
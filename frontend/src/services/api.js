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

// Lấy thông tin cá nhân hiện tại
export const getUserProfile = (userId) => api.get(`/auth/profile/${userId}`);

// Cập nhật thông tin cá nhân mới
export const updateUserProfile = (userId, fullName, email) =>
    api.put(`/auth/profile/${userId}`, { fullName, email });

// ==================== UC04: QUẢN LÝ VÍ & NGUỒN TIỀN ====================

// 1. Lấy danh sách ví theo Id người dùng (GET)
export const getWalletsByUserId = (userId) => api.get(`/wallets/user/${userId}`);

// 2. Thêm ví mới (POST)
export const createWallet = (walletData) => api.post('/wallets', walletData);

// 3. Sửa thông tin ví (PUT)
export const updateWallet = (walletId, walletData) => api.put(`/wallets/${walletId}`, walletData);

// 4. Xóa ví hệ thống (DELETE)
export const deleteWallet = (walletId) => api.delete(`/wallets/${walletId}`);

export default api;
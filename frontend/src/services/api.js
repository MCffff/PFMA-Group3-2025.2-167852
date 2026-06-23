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
export const getWalletsByUserId = (userId) =>
    axios.get(`http://localhost:8080/api/wallets/user/${userId}`);

// 2. Thêm ví mới (POST)
export const createWallet = (walletData) =>
    axios.post('http://localhost:8080/api/wallets', walletData);

// 3. Sửa thông tin ví (PUT)
export const updateWallet = (walletId, walletData) =>
    axios.put(`http://localhost:8080/api/wallets/${walletId}`, walletData);

// 4. Xóa ví hệ thống (DELETE)
export const deleteWallet = (walletId) =>
    axios.delete(`http://localhost:8080/api/wallets/${walletId}`);

// ==================== UC05: QUẢN LÝ GIAO DỊCH & DANH MỤC ====================

// 1. Lấy danh sách danh mục theo Id người dùng (GET)
export const getCategoriesByUserId = (userId) => api.get(`/transactions/categories/${userId}`);

// 2. Thêm nhanh danh mục mới (POST)
export const createCategory = (categoryData) => api.post('/transactions/categories', categoryData);

// 3. Khởi tạo giao dịch mới (POST) - Tự động cộng/trừ số dư ví dưới DB
export const createTransaction = (transactionData) => api.post('/transactions', transactionData);

export default api;
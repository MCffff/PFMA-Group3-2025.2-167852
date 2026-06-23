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

// 1. Lấy danh mục cho dropdown trang Giao dịch
export const getCategoriesByUserId = (userId) =>
    axios.get(`http://localhost:8080/api/transactions/categories/${userId}`);

// 2. Lấy lịch sử giao dịch đổ vào bảng
export const getTransactionsByUserId = (userId) =>
    axios.get(`http://localhost:8080/api/transactions/user/${userId}`);

// 3. Thêm nhanh danh mục
export const createCategory = (categoryData) =>
    axios.post('http://localhost:8080/api/transactions/categories', categoryData);

// 4. Tạo giao dịch mới
export const createTransaction = (transactionData) =>
    axios.post('http://localhost:8080/api/transactions', transactionData);

// ==================== UC06: QUẢN LÝ DANH MỤC (CATEGORIES) ====================

/**
 * 1. Lấy toàn bộ danh mục hiển thị lên bảng quản lý (Hệ thống + Tự tạo)
 */
export const getCategoriesManagement = (userId) =>
    axios.get(`http://localhost:8080/api/categories/user/${userId}`);

/**
 * 2. Thêm danh mục mới tự chọn tại trang Quản lý danh mục
 */
export const createCategoryManagement = (categoryData) =>
    axios.post('http://localhost:8080/api/categories', categoryData);

/**
 * 3. Sửa thông tin danh mục tự chọn (PUT)
 */
export const updateCategoryManagement = (categoryId, categoryData) =>
    axios.put(`http://localhost:8080/api/categories/${categoryId}`, categoryData);

/**
 * 4. Xóa danh mục tự chọn (DELETE)
 */
export const deleteCategoryManagement = (categoryId) =>
    axios.delete(`http://localhost:8080/api/categories/${categoryId}`);

export default api;
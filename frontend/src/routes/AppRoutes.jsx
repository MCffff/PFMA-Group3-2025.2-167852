// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import DashboardView from "../views/Dashboard/DashboardView";
import TransactionsView from '../views/Transactions/TransactionsView';
import BudgetsView from '../views/Budgets/BudgetsView';
import AnalyticsView from '../views/Analytics/AnalyticsView';
import LoginView from '../views/Auth/LoginView';
import RegisterView from '../views/Auth/RegisterView';
import ChangePasswordView from '../views/Profile/ChangePasswordView';

// CHIẾC KHÓA BẢO MẬT (ProtectedRoute)
const ProtectedRoute = ({ children }) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* ================= VÙNG CÔNG CỘNG (PUBLIC ROUTES) ================= */}
            {/* Người dùng chưa đăng nhập bắt buộc phải đi qua vùng này trước */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />

            {/* ================= VÙNG BẢO MẬT (PROTECTED ROUTES) ================= */}
            {/* Ép toàn bộ hệ thống MainLayout phải được kiểm tra Token qua ProtectedRoute */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                {/* Tự động chuyển hướng từ trang chủ vào Dashboard nếu đã đăng nhập hợp lệ */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardView />} />
                <Route path="transactions" element={<TransactionsView />} />

                {/* Đấu nối trực tiếp vào các File View đã tạo */}
                <Route path="analytics" element={<AnalyticsView />} />
                <Route path="budgets" element={<BudgetsView />} />

                {/* Thêm đường dẫn cho UC03: Đổi mật khẩu cá nhân */}
                <Route path="profile/change-password" element={<ChangePasswordView />} />
            </Route>

            {/* Bắt lỗi nếu người dùng gõ sai URL hoặc chưa đăng nhập mà đòi truy cập lén */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;
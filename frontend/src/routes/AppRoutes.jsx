import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-slate-800">Dashboard Tổng quan (UC07)</h1>
    <p className="text-slate-600">Nơi hiển thị số dư, chế độ ẩn/hiện bảo mật và widget giao dịch gần đây.</p>
  </div>
);

const Transactions = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-slate-800">Quản lý Giao dịch (UC05)</h1>
    <p className="text-slate-600">Danh sách thu chi và form Thêm/Sửa/Xóa giao dịch.</p>
  </div>
);

const Analytics = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-slate-800">Báo cáo & Phân tích (UC08, UC11)</h1>
    <p className="text-slate-600">Biểu đồ cơ cấu Thu/Chi và đường nét đứt dự báo tài chính tương lai.</p>
  </div>
);

const Budgets = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-slate-800">Ngân sách & Hạn mức (UC09)</h1>
    <p className="text-slate-600">Thiết lập hạn mức chi tiêu theo danh mục và tính năng lặp lại hàng tháng.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Tất cả các trang chính được bọc trong MainLayout để dùng chung Sidebar */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} /> 
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="budgets" element={<Budgets />} />
      </Route>
      
      {/* Bắt lỗi nếu người dùng gõ sai URL */}
      <Route path="*" element={<div className="p-10 text-center font-bold text-red-500">404 - Không tìm thấy trang</div>} />
    </Routes>
  );
};

export default AppRoutes;
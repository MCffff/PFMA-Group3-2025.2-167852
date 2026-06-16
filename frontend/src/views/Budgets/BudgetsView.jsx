// src/views/Budgets/BudgetsView.jsx
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Wallet, Plus, Loader2 } from 'lucide-react';
import api from '../../services/api';

const BudgetsView = () => {
    // 1. State lưu danh sách ngân sách lấy từ Database thật
    const [budgets, setBudgets] = useState([]);
    // 2. State quản lý trạng thái đang tải dữ liệu
    const [loading, setLoading] = useState(true);
    // 3. State quản lý thông báo lỗi nếu không kết nối được server
    const [error, setError] = useState(null);

    const currentUserId = 1;

    // 4. Hàm gọi API sang Spring Boot bằng Axios
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                setLoading(true);
                // Gọi đến endpoint: http://localhost:8080/api/budgets/user/1
                const response = await api.get(`/budgets/user/${currentUserId}`);
                setBudgets(response.data);
                setError(null);
            } catch (err) {
                console.error("Lỗi kết nối API Spring Boot:", err);
                setError("Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra server Backend!");
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, []);

    // 5. Hàm helper quyết định màu sắc và icon dựa trên phần trăm chi tiêu
    const getBudgetStatus = (percentage) => {
        if (percentage >= 100) {
            return {
                colorClass: 'bg-rose-500',
                bgClass: 'bg-rose-50',
                textClass: 'text-rose-700',
                borderClass: 'border-rose-100',
                icon: <XCircle className="text-rose-500" size={18} />,
                message: 'Đã vượt hạn mức!'
            };
        } else if (percentage >= 80) {
            return {
                colorClass: 'bg-amber-500',
                bgClass: 'bg-amber-50',
                textClass: 'text-amber-700',
                borderClass: 'border-amber-100',
                icon: <AlertTriangle className="text-amber-500" size={18} />,
                message: 'Sắp chạm ngưỡng!'
            };
        } else {
            return {
                colorClass: 'bg-emerald-500',
                bgClass: 'bg-emerald-50',
                textClass: 'text-emerald-700',
                borderClass: 'border-emerald-100',
                icon: <CheckCircle2 className="text-emerald-500" size={18} />,
                message: 'Kiểm soát tốt'
            };
        }
    };

    // --- HIỂN THỊ TRẠNG THÁI ĐANG LOAD ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-emerald-500 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang tải ngân sách từ hệ thống...</p>
            </div>
        );
    }

    // --- HIỂN THỊ TRẠNG THÁI LỖI MẤT KẾT NỐI SERVER ---
    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* --- TIÊU ĐỀ TRANG --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý ngân sách </h1>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm transition-all text-sm opacity-50 cursor-not-allowed" disabled>
                    <Plus size={18} />
                    Tạo hạn mức mới
                </button>
            </div>

            {/* --- DANH SÁCH THÈ NGÂN SÁCH TỪ DATABASE --- */}
            {budgets.length === 0 ? (
                <div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    Chưa có cấu hình ngân sách nào dưới Database cho User này.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {budgets.map((budget) => {
                        // Kiểm tra an toàn dữ liệu đề phòng Backend trả về null
                        const limitAmount = budget.amount || 0;
                        const spentAmount = budget.spent || 0;
                        // Ánh xạ an toàn tên danh mục từ Object lồng nhau (budget.category.name)
                        const categoryName = budget.category?.name || "Chưa phân loại";
                        const periodText = `${budget.startDate} đến ${budget.endDate}`;

                        // Tính phần trăm chi tiêu
                        const percentage = limitAmount > 0 ? Math.min((spentAmount / limitAmount) * 100, 120) : 0;
                        const realPercentage = limitAmount > 0 ? ((spentAmount / limitAmount) * 100).toFixed(1) : "0.0";
                        const status = getBudgetStatus(Number(realPercentage));

                        return (
                            <div
                                key={budget.id}
                                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all hover:shadow-md flex flex-col justify-between space-y-4"
                            >
                                {/* Header Thẻ */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-base">{categoryName}</h3>
                                            <p className="text-xs text-slate-400 font-medium">{periodText}</p>
                                        </div>
                                    </div>
                                    {/* Tag Trạng thái thông minh */}
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bgClass} ${status.textClass} ${status.borderClass}`}>
                                        {status.icon}
                                        {status.message}
                                    </div>
                                </div>

                                {/* Số liệu thống kê */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-400">
                                        <span>Đã tiêu: <strong className="text-slate-700">{spentAmount.toLocaleString()} đ</strong></span>
                                        <span>Hạn mức: {limitAmount.toLocaleString()} đ</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1.5">
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative border border-slate-100">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out ${status.colorClass}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium">Tiến độ chi tiêu</span>
                                        <span className={`font-bold ${status.textClass}`}>{realPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BudgetsView;
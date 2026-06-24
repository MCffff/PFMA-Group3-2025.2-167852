import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Loader2, AlertCircle, PieChart as PieIcon } from 'lucide-react';

const DashboardView = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('id');

    useEffect(() => {
        const loadDashboardData = async () => {
            // 🟢 ĐÃ FIX: Đẩy phòng thủ vào trong luồng async để cô lập luồng đổi State
            if (!currentUserId) {
                setError("Không tìm thấy thông tin đăng nhập của người dùng!");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await getDashboardStats(currentUserId);
                setStats(data);
                setError('');
            } catch (err) {
                console.error("Lỗi tải số liệu Dashboard:", err);
                setError("Không thể đồng bộ số liệu tổng quan từ máy chủ!");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [currentUserId]);

    // Bảng màu rực rỡ để tô điểm cho các miếng bánh biểu đồ danh mục
    const COLORS = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
                <Loader2 className="animate-spin text-indigo-600" size={36} />
                <p className="text-sm text-slate-500 font-medium">Hệ thống đang tính toán số liệu tổng quan...</p>
            </div>
        );
    }

    // Format tiền tệ chuẩn VND
    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="text-slate-700" size={22} /> Tổng quan tài chính tháng này
                </h2>
                <p className="text-xs text-slate-400 mt-1">Báo cáo tổng hợp thu chi thực tế đối soát tự động từ cơ sở dữ liệu MySQL.</p>
            </div>

            {/* Thông báo lỗi nếu có */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* 3 THÈ KPI SỐ LIỆU TỔNG QUAN THỜI GIAN THỰC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tổng Thu */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng thu tháng này</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowUpRight size={18} /></div>
                    </div>
                    <p className="text-2xl font-bold font-mono text-emerald-600">+{formatVND(stats?.totalIncome)}</p>
                </div>

                {/* Tổng Chi */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng chi tháng này</span>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><ArrowDownRight size={18} /></div>
                    </div>
                    <p className="text-2xl font-bold font-mono text-rose-600">-{formatVND(stats?.totalExpense)}</p>
                </div>

                {/* Tích lũy ròng (Số dư thuần) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tích lũy ròng</span>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Wallet size={18} /></div>
                    </div>
                    <p className={`text-2xl font-bold font-mono ${stats?.netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {formatVND(stats?.netBalance)}
                    </p>
                </div>
            </div>

            {/* KHU VỰC ĐỒ THỊ VÀ CHI TIẾT THEO HẠNG MỤC */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* 1. Khối vẽ biểu đồ hình quạt Recharts (Chiếm 3 cột) */}
                <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                        <PieIcon size={14} /> Cơ cấu chi tiêu theo hạng mục
                    </h3>

                    {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.categoryStats}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="totalAmount"
                                        nameKey="categoryName"
                                    >
                                        {stats.categoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatVND(value)} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            Chưa phát sinh dữ liệu chi tiêu trong tháng này để phân tích cơ cấu!
                        </div>
                    )}
                </div>

                {/* 2. Khối bảng tiến trình chi tiết số liệu (Chiếm 2 cột) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết hạn mức tiêu dùng</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                            stats.categoryStats.map((item, index) => (
                                <div key={index} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                        <span>{item.categoryName}</span>
                                        <span className="font-mono">{formatVND(item.totalAmount)} ({item.percentage?.toFixed(1) || 0}%)</span>
                                    </div>
                                    {/* Thanh Progress bar mô tả trực quan thị phần chi tiêu */}
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${item.percentage || 0}%`,
                                                backgroundColor: COLORS[index % COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center pt-12 text-xs text-slate-400 font-medium">
                                Danh sách phân tách trống.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
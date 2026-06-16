import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const DashboardView = () => {
    const [summary, setSummary] = useState({ balance: 0, income: 0, expense: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = 1;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Tận dụng API báo cáo tháng để tính toán số liệu tổng quan tháng hiện tại
                const response = await api.get(`/reports/monthly/${currentUserId}`);
                const monthlyList = response.data;

                if (monthlyList && monthlyList.length > 0) {
                    // Lấy bản ghi của tháng muộn nhất (tháng hiện tại)
                    const currentMonthData = monthlyList.sort((a, b) => a.month - b.month)[monthlyList.length - 1];

                    const totalIncome = currentMonthData.totalIncome || 0;
                    const totalExpense = currentMonthData.totalExpense || 0;

                    setSummary({
                        income: totalIncome,
                        expense: totalExpense,
                        balance: totalIncome - totalExpense
                    });
                }
                setError(null);
            } catch (err) {
                console.error("Lỗi tải dữ liệu tổng quan:", err);
                setError("Không thể tải dữ liệu tổng quan Dashboard.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-emerald-500 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang tổng hợp số dư ví...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Tổng quan tài chính</h1>
                <p className="text-sm text-slate-500 mt-1">Báo cáo tổng hợp số dư thời gian thực từ cơ sở dữ liệu.</p>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2"><AlertCircle size={18} /> {error}</div>
            )}

            {/* CÁC THẺ SỐ LIỆU TỔNG QUAN THẬT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TỔNG SỐ DƯ */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số dư</span>
                        <h3 className="text-2xl font-bold text-slate-800">{summary.balance.toLocaleString()} đ</h3>
                    </div>
                    <div className="p-3 bg-slate-900 text-white rounded-xl"><Wallet size={24} /></div>
                </div>

                {/* TỔNG THU NHẬP */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng thu tháng này</span>
                        <h3 className="text-2xl font-bold text-emerald-600">+{summary.income.toLocaleString()} đ</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowUpRight size={24} /></div>
                </div>

                {/* TỔNG CHI TIÊU */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng chi tháng này</span>
                        <h3 className="text-2xl font-bold text-rose-600">-{summary.expense.toLocaleString()} đ</h3>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><ArrowDownLeft size={24} /></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
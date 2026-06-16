import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Chart, Pie } from 'react-chartjs-2';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsView = () => {
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = 1; // Giả định User ID = 1

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                // Gọi đồng thời cả 2 API từ ReportController
                const [catRes, monthRes] = await Promise.all([
                    api.get(`/reports/category/${currentUserId}`),
                    api.get(`/reports/monthly/${currentUserId}`)
                ]);
                setCategoryData(catRes.data);
                setMonthlyData(monthRes.data);
                setError(null);
            } catch (err) {
                console.error("Lỗi tải báo cáo:", err);
                setError("Không thể tải dữ liệu báo cáo. Vui lòng kiểm tra ReportController!");
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-emerald-500 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang phân tích số liệu tài chính...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6"><div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2"><AlertCircle size={18} /> {error}</div></div>
        );
    }

    // SỬ LÝ LOGIC BIỂU ĐỒ CỘT HỖN HỢP & DỰ BÁO AI
    // Sắp xếp dữ liệu theo tháng tăng dần (đề phòng Backend trả về lộn xộn)
    const sortedMonths = [...monthlyData].sort((a, b) => a.month - b.month);

    const labels = sortedMonths.map(m => `Tháng ${m.month}`);
    const incomeData = sortedMonths.map(m => m.totalIncome || 0);
    const expenseData = sortedMonths.map(m => m.totalExpense || 0);

    // Thuật toán Dự báo: Lấy trung bình chi tiêu của tối đa 3 tháng gần nhất để dự báo tháng sau
    let forecastExpense = 0;
    if (expenseData.length > 0) {
        const recentExpenses = expenseData.slice(-3);
        const sum = recentExpenses.reduce((acc, curr) => acc + curr, 0);
        forecastExpense = Math.round(sum / recentExpenses.length);
    }

    // Thêm cột giả định cho tháng tiếp theo vào biểu đồ để hiển thị đường nét đứt dự báo
    const nextMonthLabel = monthlyData.length > 0 ? `Tháng ${sortedMonths[sortedMonths.length - 1].month + 1} (Dự báo)` : 'Tháng sau (Dự báo)';
    const extendedLabels = [...labels, nextMonthLabel];

    // Đường dự báo chi tiêu chạy dọc qua các tháng cũ và kéo dài sang tháng tương lai
    const forecastLineData = [...expenseData, forecastExpense];

    const mixedChartData = {
        labels: extendedLabels,
        datasets: [
            {
                type: 'line',
                label: 'Đường dự báo chi tiêu ',
                data: forecastLineData,
                borderColor: '#6366f1', // Tím Indigo
                borderWidth: 2.5,
                borderDash: [6, 6], // Hiệu ứng nét đứt thông minh
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4,
                fill: false,
            },
            {
                type: 'bar',
                label: 'Thu nhập thật',
                data: [...incomeData, 0], // Tháng dự báo chưa có thu nhập thật nên để = 0
                backgroundColor: '#10b981', // Xanh lá
                borderRadius: 6,
            },
            {
                type: 'bar',
                label: 'Chi tiêu thật',
                data: [...expenseData, 0], // Tháng dự báo chưa có chi tiêu thật nên để = 0
                backgroundColor: '#f43f5e', // Đỏ Rose
                borderRadius: 6,
            }
        ]
    };

    // --- XỬ LÝ LOGIC BIỂU ĐỒ TRÒN DANH MỤC ---
    const pieLabels = categoryData.map(c => c.categoryName || `Danh mục ${c.categoryId}`);
    const pieValues = categoryData.map(c => c.totalAmount || 0);

    const pieChartData = {
        labels: pieLabels,
        datasets: [
            {
                data: pieValues,
                backgroundColor: ['#f43f5e', '#3b82f6', '#eab308', '#a855f7', '#10b981', '#64748b'],
                borderWidth: 1,
            }
        ]
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Báo cáo & Phân tích xu hướng</h1>
                <p className="text-sm text-slate-500 mt-1">Số liệu trực quan hóa từ ReportService phối hợp thuật toán dự báo chi tiêu.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* BIỂU ĐỒ CỘT XU HƯỚNG & DỰ BÁO XU HƯỚNG */}
                <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <BarChart3 className="text-indigo-500" size={20} />
                        <h2>So sánh Thu - Chi & Dự báo tháng tiếp theo</h2>
                    </div>
                    <div className="h-72 w-full relative">
                        {monthlyData.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">Chưa có dữ liệu giao dịch các tháng.</div>
                        ) : (
                            <Chart type="bar" data={mixedChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        )}
                    </div>
                </div>

                {/* BIỂU ĐỒ TRÒN PHÂN PHỐI DANH MỤC */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <PieIcon className="text-rose-500" size={20} />
                        <h2>Cơ cấu chi tiêu theo danh mục</h2>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center relative">
                        {categoryData.length === 0 ? (
                            <div className="text-sm text-slate-400">Chưa có dữ liệu chi tiêu theo danh mục.</div>
                        ) : (
                            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
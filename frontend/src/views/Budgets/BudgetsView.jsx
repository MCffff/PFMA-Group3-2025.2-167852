import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Wallet, Plus, Loader2, X } from 'lucide-react';
import api from '../../services/api';

const BudgetsView = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State quản lý việc đóng/mở Modal Form tạo hạn mức mới
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State quản lý dữ liệu nhập vào từ Form
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '1', // ID danh mục mặc định
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0] // Mặc định cuối tháng hiện tại
    });

    const currentUserId = 1;

    // Hàm tải dữ liệu ngân sách từ Backend Spring Boot
    const fetchBudgets = async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        fetchBudgets();
    }, []);

    // Xử lý nhập liệu trong Form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Hàm xử lý gửi dữ liệu POST sang Spring Boot (UC06 - Thêm hạn mức)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount) {
            alert('Vui lòng nhập số tiền hạn mức!');
            return;
        }

        // Thiết lập cấu hình Object chuẩn khớp 100% với file Budget.java của Backend
        const budgetRequestPayload = {
            amount: Number(formData.amount),
            spent: 0.0, // Ngân sách mới tạo thì số tiền đã tiêu mặc định bằng 0
            startDate: formData.startDate,
            endDate: formData.endDate,
            user: { id: currentUserId }, // Liên kết đối tượng User
            category: { id: Number(formData.categoryId) } // Liên kết đối tượng Category
        };

        try {
            // Gửi lệnh POST sang đường dẫn http://localhost:8080/api/budgets
            await api.post('/budgets', budgetRequestPayload);

            // Tải lại danh sách mới để cập nhật giao diện
            await fetchBudgets();

            // Đóng cửa sổ nhập liệu và reset ô số tiền
            setIsModalOpen(false);
            setFormData({
                ...formData,
                amount: ''
            });
        } catch (err) {
            console.error("Lỗi khi tạo hạn mức mới:", err);
            alert("Lỗi hệ thống: Không thể thêm hạn mức. Hãy kiểm tra xem bạn Backend đã tạo sẵn bảng dữ liệu tương ứng chưa!");
        }
    };

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-emerald-500 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang tải ngân sách từ hệ thống...</p>
            </div>
        );
    }

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
            {/* --- TIÊU ĐỀ & NÚT MỞ FORM ĐÃ ĐƯỢC MỞ KHÓA --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý ngân sách (Dữ liệu thật)</h1>
                    <p className="text-sm text-slate-500 mt-1">Dữ liệu được đồng bộ trực tiếp từ cơ sở dữ liệu MySQL.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                >
                    <Plus size={18} />
                    Tạo hạn mức mới
                </button>
            </div>

            {/* --- HIỂN THỊ DANH SÁCH THẺ NGÂN SÁCH --- */}
            {budgets.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium text-sm">
                    Chưa có cấu hình ngân sách nào dưới Database cho User này. Bạn hãy bấm "Tạo hạn mức mới" ở trên để kiểm tra nhé!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {budgets.map((budget) => {
                        const limitAmount = budget.amount || 0;
                        const spentAmount = budget.spent || 0;
                        const categoryName = budget.category?.name || "Danh mục";
                        const periodText = `${budget.startDate} đến ${budget.endDate}`;

                        const percentage = limitAmount > 0 ? Math.min((spentAmount / limitAmount) * 100, 120) : 0;
                        const realPercentage = limitAmount > 0 ? ((spentAmount / limitAmount) * 100).toFixed(1) : "0.0";
                        const status = getBudgetStatus(Number(realPercentage));

                        return (
                            <div
                                key={budget.id}
                                className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between space-y-4"
                            >
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
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bgClass} ${status.textClass} ${status.borderClass}`}>
                                        {status.icon}
                                        {status.message}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-slate-400">
                                        <span>Đã tiêu: <strong className="text-slate-700">{spentAmount.toLocaleString()} đ</strong></span>
                                        <span>Hạn mức: {limitAmount.toLocaleString()} đ</span>
                                    </div>
                                </div>

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

            {/* --- FORM MODAL BẬT LÊN ĐỂ TẠO NGÂN SÁCH --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">Cài đặt hạn mức mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {/* Nhập số tiền hạn mức */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Số tiền giới hạn (đ)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Ví dụ: 2000000"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-semibold"
                                    required
                                />
                            </div>

                            {/* Chọn ID Danh mục để liên kết (Mồi trước ID từ 1 đến 3 tương ứng các danh mục) */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Chọn ID danh mục liên kết</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-700 font-medium"
                                >
                                    <option value="1">Danh mục số 1 (Ăn uống)</option>
                                    <option value="2">Danh mục số 2 (Giải trí)</option>
                                    <option value="3">Danh mục số 3 (Đi lại)</option>
                                </select>
                            </div>

                            {/* Chọn Ngày bắt đầu */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày áp dụng</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Chọn Ngày kết thúc */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày hết hạn</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Nút hành động */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-bold bg-emerald-500 text-slate-900 hover:bg-emerald-600 rounded-xl shadow-sm"
                                >
                                    Lưu xuống Database
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetsView;
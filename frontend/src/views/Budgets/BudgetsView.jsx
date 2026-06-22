// src/views/Budgets/BudgetsView.jsx
import { useState, useEffect } from 'react';
import { Loader2, Plus, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const BudgetsView = () => {
    // ============================================================================
    // 1. KHỞI TẠO STATE TIÊU CHUẨN & TRẠNG THÁI SUY DIỄN (DERIVED STATE)
    // ============================================================================
    const [currentUserId] = useState(() => sessionStorage.getItem('userId'));
    const [budgets, setBudgets] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hasValidUser = currentUserId && currentUserId !== 'undefined' && currentUserId !== 'null';
    const error = hasValidUser ? null : "Không tìm thấy phiên đăng nhập hợp lệ. Vui lòng đăng nhập lại!";

    // Trạng thái Loading xoay vòng
    const [loading, setLoading] = useState(() => !!hasValidUser);

    // State quản lý Form tạo ngân sách mới
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '1',
        startDate: '',
        endDate: ''
    });

    // ============================================================================
    // 2. EFFECT TỰ ĐỘNG TẢI DỮ LIỆU THEO USER ID CHUẨN (BƯỚC 3)
    // ============================================================================
    useEffect(() => {
        if (!hasValidUser) return;

        const loadInitialBudgets = async () => {
            try {
                const response = await api.get(`/budgets/user/${currentUserId}`);
                setBudgets(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Lỗi lấy danh sách ngân sách:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialBudgets();
    }, [currentUserId, hasValidUser]);

    const refreshBudgets = async () => {
        if (!currentUserId) return;
        try {
            const response = await api.get(`/budgets/user/${currentUserId}`);
            setBudgets(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Lỗi làm mới ngân sách:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ============================================================================
    // 3. HÀM GỬI LỆNH TẠO PAYLOAD
    // ============================================================================
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || !formData.startDate || !formData.endDate) {
            return alert("Vui lòng điền đầy đủ thông tin hạn mức và ngày tháng!");
        }
        if (!currentUserId) return alert("Phiên đăng nhập hết hạn!");

        const rawAmount = formData.amount.toString().replace(/\D/g, '');
        const parsedAmount = Number(rawAmount + ".0");

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return alert("Số tiền nhập vào không hợp lệ!");
        }

        // ĐÓNG GÓI PAYLOAD CHUẨN CHỈNH THEO ĐÚNG CẤU TRÚC LỒNG CỦA BACKEND
        const budgetPayload = {
            amount: parsedAmount,
            startDate: formData.startDate,
            endDate: formData.endDate,
            user: {
                id: Number(currentUserId)
            },
            category: {
                id: Number(formData.categoryId)
            }
        };

        console.log("👉 DỮ LIỆU ĐANG GỬI ĐI ĐÂY:", JSON.stringify(budgetPayload, null, 2));
        alert("Kiểm tra Console xem log JSON!");

        try {
            await api.post('/budgets', budgetPayload);
            await refreshBudgets();
            setIsModalOpen(false);
            setFormData({ amount: '', categoryId: '1', startDate: '', endDate: '' });
            alert("🎉 Kích hoạt hạn mức ngân sách thành công!");
        } catch (err) {
            console.error("Lỗi sập luồng hệ thống:", err);
            // Cẩm nang vạch trần lỗi thực tế qua F12
            alert("Lỗi đồng bộ dữ liệu! Khiêm hãy xem tab Network -> Response xem cấu trúc gửi lên bị sai ở đâu nhé.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-indigo-500 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang tải cấu hình ngân sách từ hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Ngân sách</h1>
                    <p className="text-sm text-slate-500 mt-1">Thiết lập hạn mức chi tiêu độc lập bảo mật theo từng tài khoản.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                >
                    <Plus size={18} /> Thiết lập hạn mức mới
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {budgets.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium text-sm">
                    Tài khoản của bạn chưa thiết lập hạn mức ngân sách nào cho tháng này.
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <th className="p-4">Danh mục áp dụng</th>
                                <th className="p-4">Hạn mức tối đa</th>
                                <th className="p-4">Đã chi tiêu</th>
                                <th className="p-4">Ngày bắt đầu</th>
                                <th className="p-4">Ngày kết thúc</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {budgets.map((b, index) => {
                                if (!b) return null;
                                return (
                                    <tr key={b.id || index} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 text-slate-900 font-bold">
                                            {b.category?.name || `Danh mục #${b.categoryId || ''}`}
                                        </td>
                                        <td className="p-4 text-slate-700">{(b.amount || 0).toLocaleString()} đ</td>
                                        <td className="p-4 text-rose-600">{(b.spent || 0).toLocaleString()} đ</td>
                                        <td className="p-4 text-slate-400 text-xs">{b.startDate || '—'}</td>
                                        <td className="p-4 text-slate-400 text-xs">{b.endDate || '—'}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL ĐĂNG KÝ HẠN MỨC */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">Cấu hình hạn mức chi tiêu mới</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Số tiền hạn mức (đ)</label>
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
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Chọn danh mục quản lý</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-700 font-medium"
                                >
                                    <option value="1">Danh mục số 1 (Ăn uống - CHI)</option>
                                    <option value="2">Danh mục số 2 (Giải trí - CHI)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày kết thúc</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-900"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 mt-5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl">Hủy bỏ</button>
                                <button type="submit" className="px-5 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm">Kích hoạt hạn mức</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetsView;
import { useState, useEffect } from 'react';
import api, { getBudgetsByUserId, updateBudget, deleteBudget, getCategoriesByUserId } from '../../services/api';
import { ShieldCheck, Plus, Pencil, Trash2, Loader2, AlertCircle, CheckCircle2, DollarSign, Tag, X } from 'lucide-react';

const BudgetsView = () => {
    // ============================================================================
    // 1. KHỞI TẠO STATE TIÊU CHUẨN
    // ============================================================================
    const [currentUserId] = useState(() => sessionStorage.getItem('userId') || sessionStorage.getItem('id'));
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]); // 🟢 BỔ SUNG: Quản lý danh sách danh mục động
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal Thêm mới
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // State phục vụ modal chỉnh sửa nhanh hạn mức
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [newAmount, setNewAmount] = useState('');

    // State quản lý Form tạo ngân sách mới
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    // ============================================================================
    // 2. LUỒNG 1: TẢI ĐỒNG THỜI NGÂN SÁCH VÀ DANH MỤC TỪ BACKEND
    // ============================================================================
    useEffect(() => {
        const loadInitialData = async () => {
            const hasValidUser = currentUserId && currentUserId !== 'undefined' && currentUserId !== 'null';

            if (!hasValidUser) {
                setError("Không tìm thấy phiên đăng nhập hợp lệ. Vui lòng đăng nhập lại!");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const [budgetsRes, categoriesRes] = await Promise.all([
                    getBudgetsByUserId(currentUserId),
                    getCategoriesByUserId(currentUserId) // ◄── Không được để trống ngoặc ông nhé!
                ]);

                // Bóc tách mảng ngân sách an toàn
                const bData = budgetsRes?.data || budgetsRes || [];
                setBudgets(Array.isArray(bData) ? bData : []);

                // Bóc tách mảng danh mục an toàn
                const cData = categoriesRes?.data || categoriesRes || [];
                setCategories(Array.isArray(cData) ? cData : []);

                setError('');
            } catch (err) {
                console.error("Lỗi lấy dữ liệu hệ thống ngân sách:", err);
                setError("Không thể đồng bộ danh sách dữ liệu từ máy chủ MySQL!");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [currentUserId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ============================================================================
    // 3. LUỒNG 2: XỬ LÝ GỬI FORM THÊM MỚI NGÂN SÁCH (POST)
    // ============================================================================
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!formData.categoryId) {
            return alert("Vui lòng chọn danh mục áp dụng hạn mức!");
        }
        if (!formData.amount || !formData.startDate || !formData.endDate) {
            return alert("Vui lòng điền đầy đủ thông tin hạn mức và ngày tháng!");
        }

        const rawAmount = formData.amount.toString().replace(/\D/g, '');
        const parsedAmount = Number(rawAmount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return alert("Số tiền nhập vào không hợp lệ!");
        }

        const budgetPayload = {
            amount: parsedAmount,
            startDate: formData.startDate,
            endDate: formData.endDate,
            user: { id: Number(currentUserId) },
            category: { id: Number(formData.categoryId) }
        };

        try {
            setLoading(true);
            await api.post('/budgets', budgetPayload);
            setMessage("🎉 Kích hoạt hạn mức ngân sách mới thành công!");
            setIsModalOpen(false);
            setFormData({ amount: '', categoryId: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });

            // Làm mới danh sách bảng sau khi thêm
            const response = await getBudgetsByUserId(currentUserId);
            const data = response?.data || response || [];
            setBudgets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi tạo ngân sách:", err);
            setError(err.response?.data?.message || "Lỗi đồng bộ dữ liệu tạo ngân sách!");
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // 4. LUỒNG 3: XỬ LÝ CẬP NHẬT NHANH SỐ TIỀN HẠN MỨC (PUT)
    // ============================================================================
    const openEditModal = (budget) => {
        setSelectedBudget(budget);
        setNewAmount(budget.amount || '');
        setIsEditModalOpen(true);
    };

    const handleUpdateAmount = async (e) => {
        e.preventDefault();
        if (!newAmount || Number(newAmount) <= 0) {
            alert("Hạn mức ngân sách phải lớn hơn 0đ ông nhé!");
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');

            await updateBudget(selectedBudget.id, { amount: Number(newAmount) });
            setMessage("🎉 Cập nhật hạn mức ngân sách thành công!");
            setIsEditModalOpen(false);

            const response = await getBudgetsByUserId(currentUserId);
            const data = response?.data || response || [];
            setBudgets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi sửa ngân sách:", err);
            setError(err.response?.data?.message || "Lỗi khi chỉnh sửa hạn mức!");
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // 5. LUỒNG 4: XỬ LÝ XÓA NGÂN SÁCH (DELETE)
    // ============================================================================
    const handleDeleteBudget = async (id) => {
        if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa hạn mức ngân sách của danh mục này không?")) return;

        try {
            setLoading(true);
            setError('');
            setMessage('');

            await deleteBudget(id);
            setMessage("🗑️ Xóa hạn mức ngân sách thành công khỏi hệ thống!");

            const response = await getBudgetsByUserId(currentUserId);
            const data = response?.data || response || [];
            setBudgets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi khi xóa ngân sách:", err);
            setError(err.response?.data?.message || "Lỗi khi xóa hạn mức ngân sách!");
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    if (loading && budgets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-indigo-600 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang tải cấu hình ngân sách từ hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-slate-700" size={22} /> Quản lý Ngân sách
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Thiết lập hạn mức chi tiêu độc lập bảo mật theo từng tài khoản.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                    <Plus size={14} /> Thiết lập hạn mức mới
                </button>
            </div>

            {/* Trạng thái Alerts */}
            {message && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} /> <span>{message}</span>
                </div>
            )}
            {error && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} /> <span>{error}</span>
                </div>
            )}

            {/* BẢNG BIỂU NGÂN SÁCH ĐỘNG */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                        <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                            <th className="p-4">Danh mục áp dụng</th>
                            <th className="p-4">Hạn mức tối đa</th>
                            <th className="p-4">Đã chi tiêu</th>
                            <th className="p-4">Ngày bắt đầu</th>
                            <th className="p-4">Ngày kết thúc</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {budgets.length > 0 ? (
                            budgets.map((b, index) => {
                                if (!b) return null;
                                return (
                                    <tr key={b.id || index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                                            <Tag size={14} className="text-slate-400" />
                                            {b.category?.categoryName || `Danh mục #${b.categoryId || ''}`}
                                        </td>
                                        <td className="p-4 font-bold font-mono text-slate-800">{formatVND(b.amount)}</td>
                                        <td className={`p-4 font-bold font-mono ${b.spent > b.amount ? 'text-rose-600 bg-rose-50/30' : 'text-slate-600'}`}>
                                            {formatVND(b.spent)}
                                        </td>
                                        <td className="p-4 text-slate-400 text-xs font-mono">{b.startDate || '—'}</td>
                                        <td className="p-4 text-slate-400 text-xs font-mono">{b.endDate || '—'}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(b)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                                    title="Sửa hạn mức"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBudget(b.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Xóa hạn mức"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-slate-400 font-medium bg-white">
                                    Tài khoản của bạn chưa thiết lập hạn mức ngân sách nào cho tháng này.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL 1: ĐĂNG KÝ HẠN MỨC MỚI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Cấu hình hạn mức chi tiêu mới</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Số tiền hạn mức (đ)</label>
                                <input
                                    type="number" name="amount" placeholder="Ví dụ: 2000000"
                                    value={formData.amount} onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-semibold text-slate-800"
                                    required
                                />
                            </div>

                            {/* Ô THẢ XUỐNG CHỌN DANH MỤC ĐỘNG LỌC LOẠI EXPENSE */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Chọn danh mục quản lý</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 text-slate-700 font-bold"
                                >
                                    <option value="">-- Chọn danh mục chi tiêu --</option>
                                    {categories
                                        .filter(c => c.type && c.type.toUpperCase() === 'EXPENSE')
                                        .map(c => (
                                            <option key={c.id} value={c.id}>
                                                💸 {c.categoryName}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày bắt đầu</label>
                                    <input
                                        type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-900 font-semibold"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày kết thúc</label>
                                    <input
                                        type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-slate-900 font-semibold"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 mt-5">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Hủy bỏ</button>
                                <button type="submit" className="px-5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm">Kích hoạt hạn mức</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: SỬA HẠN MỨC (PUT) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 bg-slate-50 -m-5 p-4 rounded-t-2xl">
                            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                                <Pencil size={14} /> Sửa hạn mức chi tiêu
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateAmount} className="space-y-4 pt-4">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                    Hạng mục: {selectedBudget?.category?.categoryName || "Danh mục hệ thống"}
                                </label>
                                <div className="relative flex items-center">
                                    <DollarSign size={14} className="absolute left-3 text-slate-400" />
                                    <input
                                        type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} required
                                        className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-slate-900 font-bold font-mono text-slate-800"
                                        placeholder="Nhập số tiền hạn mức mới..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button" onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-bold transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                                >
                                    Xác nhận cập nhật
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
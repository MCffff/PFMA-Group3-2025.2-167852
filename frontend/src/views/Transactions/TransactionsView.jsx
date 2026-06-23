import { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, FolderPlus, Loader2, CheckCircle2, AlertCircle, Calendar, Wallet, Tag, DollarSign, FileText } from 'lucide-react';
import { getWalletsByUserId, getCategoriesByUserId, createCategory, createTransaction, getTransactionsByUserId } from '../../services/api';

const TransactionsView = () => {
    // Quản lý dữ liệu động từ Backend
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactionsList, setTransactionsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // State biểu mẫu Giao dịch chính
    const [formData, setFormData] = useState({
        amount: '',
        type: 'EXPENSE',
        categoryId: '',
        walletId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        description: ''
    });

    // State luồng rẽ nhánh: Thêm nhanh danh mục mới
    const [showQuickCategory, setShowQuickCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const currentUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('id');

    // LUỒNG 1: LOAD ĐỒNG THỜI 3 API (VÍ, DANH MỤC, LỊCH SỬ) KHI TẢI TRANG
    useEffect(() => {
        if (!currentUserId) return;

        const loadInitData = async () => {
            // Luồng 1: Nạp dữ liệu cứng cho các ô chọn (Ví và Danh mục)
            try {
                setIsLoading(true);
                const [walletsRes, categoriesRes] = await Promise.all([
                    getWalletsByUserId(currentUserId),
                    getCategoriesByUserId(currentUserId)
                ]);
                setWallets(walletsRes.data || []);
                setCategories(categoriesRes.data || []);
                setError(''); // Xóa thông báo lỗi nếu nạp thành công
            } catch (err) {
                console.error("Lỗi tải option form:", err);
                setError("Không thể đồng bộ danh sách ví hoặc danh mục tài khoản!");
            } finally {
                setIsLoading(false);
            }

            // Luồng 2: Nạp lịch sử giao dịch độc lập (Lỗi luồng này không làm sập luồng trên)
            try {
                const transactionsRes = await getTransactionsByUserId(currentUserId);
                const txData = transactionsRes.data?.data || transactionsRes.data || transactionsRes || [];
                setTransactionsList(Array.isArray(txData) ? txData : []);
            } catch (err) {
                console.error("Lỗi tải lịch sử giao dịch:", err);
                // Không set setError chung để tránh làm hiện thông báo đỏ vô lý trên giao diện
            }
        };

        loadInitData();
    }, [currentUserId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // LUỒNG 2: XỬ LÝ THÊM NHANH DANH MỤC (NÚT DẤU CỘNG +)
    const handleQuickCategorySubmit = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            setIsLoading(true);
            setError('');

            const response = await createCategory({
                userId: Number(currentUserId),
                categoryName: newCategoryName.trim(),
                type: formData.type
            });

            setMessage(response.data?.message || "Thêm danh mục mới thành công!");

            const createdCat = response.data?.data;
            if (createdCat) {
                setCategories([...categories, createdCat]);
                setFormData({ ...formData, categoryId: createdCat.id });
            }

            setNewCategoryName('');
            setShowQuickCategory(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Lỗi tạo nhanh danh mục!");
        } finally {
            setIsLoading(false);
        }
    };

    // LUỒNG 3: NÚT LƯU FORM GIAO DỊCH CHÍNH
    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!formData.walletId) {
            setError('Vui lòng chọn ví nguồn tiền thực hiện giao dịch!');
            return;
        }
        if (!formData.categoryId) {
            setError('Vui lòng chọn danh mục phân loại thu chi!');
            return;
        }

        const payload = {
            amount: Number(formData.amount),
            type: formData.type,
            categoryId: Number(formData.categoryId),
            walletId: Number(formData.walletId),
            transactionDate: formData.transactionDate,
            description: formData.description
        };

        try {
            setIsLoading(true);
            await createTransaction(payload);

            setMessage("🎉 Giao dịch đã được ghi nhận thành công!");

            // Xóa sạch dữ liệu ô tiền và ghi chú sau khi lưu thành công
            setFormData({
                ...formData,
                amount: '',
                description: '',
                categoryId: ''
            });

            // Tự động gọi lại API bốc lịch sử mới nhất về cập nhật bảng ngay lập tức
            const updatedTxRes = await getTransactionsByUserId(currentUserId);
            const txData = updatedTxRes.data?.data || updatedTxRes.data || updatedTxRes || [];
            setTransactionsList(Array.isArray(txData) ? txData : []);

            // Tiện tay nạp lại ví để số dư trên dropdown trừ tiền theo thời gian thực luôn
            const updatedWallets = await getWalletsByUserId(currentUserId);
            setWallets(updatedWallets.data || []);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Có lỗi xảy ra, không thể lưu giao dịch!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-2">
            {/* PHẦN BIỂU MẪU NHẬP GIAO DỊCH */}
            <div className="space-y-6 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ArrowLeftRight className="text-slate-700" size={22} /> Ghi chép giao dịch tài chính
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Lập biểu mẫu thu chi phát sinh thực tế. Hệ thống sẽ tự động cộng hoặc trừ tiền trực tiếp vào số dư ví tương ứng.</p>
                </div>

                {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{message}</span>
                    </div>
                )}
                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleTransactionSubmit} className="space-y-4 bg-white p-2">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Loại phát sinh</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'EXPENSE', categoryId: '' })}
                                className={`py-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                    formData.type === 'EXPENSE'
                                        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm font-extrabold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                💸 Khoản Chi ra (Expense)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'INCOME', categoryId: '' })}
                                className={`py-3 rounded-xl text-sm font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                    formData.type === 'INCOME'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm font-extrabold'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                💰 Khoản Thu vào (Income)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <DollarSign size={13} /> Số tiền giao dịch (đ)
                            </label>
                            <input
                                type="number" name="amount" placeholder="Ví dụ: 50000"
                                value={formData.amount} onChange={handleInputChange} required disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-bold font-mono text-slate-800"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Calendar size={13} /> Ngày phát sinh
                            </label>
                            <input
                                type="date" name="transactionDate"
                                value={formData.transactionDate} onChange={handleInputChange} required disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Wallet size={13} /> Chọn ví thanh toán
                            </label>
                            <select
                                name="walletId" value={formData.walletId} onChange={handleInputChange} required disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium text-slate-700"
                            >
                                <option value="">-- Chọn ví nguồn tiền --</option>
                                {wallets.map(w => (
                                    <option key={w.id} value={w.id}>
                                        {w.walletName} (Dư: {new Intl.NumberFormat('vi-VN').format(w.balance)}đ)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Tag size={13} /> Chọn hạng mục danh mục</span>
                                <button
                                    type="button"
                                    onClick={() => setShowQuickCategory(!showQuickCategory)}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-0.5"
                                >
                                    <Plus size={12} /> Thêm nhanh mục
                                </button>
                            </label>

                            <div className="flex gap-2">
                                <select
                                    name="categoryId" value={formData.categoryId} onChange={handleInputChange} required disabled={isLoading}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium text-slate-700"
                                >
                                    <option value="">-- Chọn danh mục phân loại --</option>
                                    {categories
                                        .filter(c => c.type && c.type.toUpperCase() === formData.type.toUpperCase())
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {showQuickCategory && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                    <FolderPlus size={12} /> Nhập tên danh mục mới muốn tạo ({formData.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'})
                                </label>
                                <button type="button" onClick={() => setShowQuickCategory(false)} className="text-xs text-slate-400 hover:text-slate-600">Hủy</button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text" placeholder="Ví dụ: Tiền trà sữa, Tiền lương tháng..."
                                    value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} disabled={isLoading}
                                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                                />
                                <button
                                    type="button" onClick={handleQuickCategorySubmit} disabled={isLoading || !newCategoryName.trim()}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl transition-all"
                                >
                                    Xác nhận thêm
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <FileText size={13} /> Nội dung / Ghi chú chi tiết
                        </label>
                        <textarea
                            name="description" rows="2" placeholder="Ví dụ: Mua sắm nhu yếu phẩm, ăn tối cùng gia đình..."
                            value={formData.description} onChange={handleInputChange} disabled={isLoading}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={16} />}
                            Lưu và Khấu trừ giao dịch hệ thống
                        </button>
                    </div>
                </form>
            </div>

            {/* PHẦN BẢNG LỊCH SỬ GIAO DỊCH */}
            <div className="space-y-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
                <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        📋 Lịch sử biến động số dư gần đây
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Danh sách các khoản thu/chi động đã được đối soát vào cơ sở dữ liệu MySQL.</p>
                </div>

                {transactionsList.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
                        Chưa phát sinh bản ghi giao dịch nào trong hệ thống!
                    </div>
                ) : (
                    <div className="overflow-hidden border border-slate-100 rounded-xl shadow-sm">
                        <table className="w-full border-collapse text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">Ví nguồn</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">Hạng mục</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">Ghi chú</th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Biến động số dư</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                            {transactionsList.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                                    <td className="px-4 py-3.5 font-mono text-slate-500">
                                        {t.transactionDate}
                                    </td>
                                    <td className="px-4 py-3.5 font-semibold text-slate-600">
                                        {/* Bốc đúng trường walletName từ Object wallet lồng bên trong */}
                                        {t.wallet?.walletName || 'Ví không xác định'}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {/* Bốc chuẩn thuộc tính categoryName mới tinh */}
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md">
                                                {t.category?.categoryName || 'Chưa phân loại'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-slate-400 truncate max-w-[150px]" title={t.description}>
                                        {t.description || '...'}
                                    </td>
                                    <td className="px-4 py-3.5 text-right font-black text-sm">
                                        {t.type === 'EXPENSE' ? (
                                            <span className="text-rose-600">
                                                    -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                                                </span>
                                        ) : (
                                            <span className="text-emerald-600">
                                                    +{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount)}
                                                </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsView;
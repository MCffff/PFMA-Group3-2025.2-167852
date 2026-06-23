import { useState, useEffect } from 'react';
import { ArrowLeftRight, Plus, FolderPlus, Loader2, CheckCircle2, AlertCircle, Calendar, Wallet, Tag, DollarSign, FileText } from 'lucide-react';
import { getWalletsByUserId, getCategoriesByUserId, createCategory, createTransaction } from '../../services/api';

const TransactionsView = () => {
    // Quản lý dữ liệu động từ Backend
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
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

    // LUỒNG 1: LOAD TOÀN BỘ VÍ ĐỘNG VÀ DANH MỤC ĐỘNG KHI TẢI TRANG
    useEffect(() => {
        if (!currentUserId) return;

        const loadInitData = async () => {
            try {
                setIsLoading(true);
                // Gọi song song cả 2 API để tối ưu hóa thời gian phản hồi
                const [walletsRes, categoriesRes] = await Promise.all([
                    getWalletsByUserId(currentUserId),
                    getCategoriesByUserId(currentUserId)
                ]);

                setWallets(walletsRes.data || []);
                setCategories(categoriesRes.data || []);
            } catch (err) {
                console.error("Lỗi tải dữ liệu khởi tạo:", err);
                setError("Không thể đồng bộ danh sách ví hoặc danh mục tài khoản!");
            } finally {
                setIsLoading(false);
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
                type: formData.type // Ăn theo loại Thu hay Chi đang chọn ở form
            });

            setMessage(response.data?.message || "Thêm danh mục mới thành công!");

            // 🔄 Tự động cập nhật danh mục mới vào danh sách lựa chọn trên UI
            const createdCat = response.data?.data;
            if (createdCat) {
                setCategories([...categories, createdCat]);
                setFormData({ ...formData, categoryId: createdCat.id }); // Tự chọn luôn danh mục vừa tạo
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

        // Phòng thủ Frontend dữ liệu bắt buộc
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
            const response = await createTransaction(payload);

            setMessage(response.data?.message || "🎉 Giao dịch đã được ghi nhận thành công!");

            // Xóa sạch dữ liệu ô tiền và ghi chú sau khi lưu thành công
            setFormData({
                ...formData,
                amount: '',
                description: '',
                categoryId: ''
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Có lỗi xảy ra, không thể lưu giao dịch!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-2">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ArrowLeftRight className="text-slate-700" size={22} /> Ghi chép giao dịch tài chính
                </h2>
                <p className="text-xs text-slate-400 mt-1">Lập biểu mẫu thu chi phát sinh thực tế. Hệ thống sẽ tự động cộng hoặc trừ tiền trực tiếp vào số dư ví tương ứng.</p>
            </div>

            {/* Thông báo trạng thái */}
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

            {/* BIỂU MẪU CHÍNH */}
            <form onSubmit={handleTransactionSubmit} className="space-y-4 bg-white p-2">
                {/* 1. Chọn loại giao dịch */}
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
                    {/* 2. Nhập số tiền */}
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

                    {/* 3. Chọn ngày giao dịch */}
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
                    {/* 4. Thả xuống chọn Ví Động (UC04 mapped) */}
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

                    {/* 5. Thả xuống chọn Danh mục Động + Nút thêm nhanh */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1"><Tag size={13} /> Chọn hạng mục danh mục</span>

                            {/* NÚT TÍNH NĂNG RẼ NHÁNH: BẤM MỞ FORM THÊM NHANH DANH MỤC */}
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
                                    .filter(c => c.type === formData.type) // Chỉ hiện danh mục tương ứng với loại thu/chi đang chọn
                                    .map(c => (
                                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* FORM THÊM NHANH DANH MỤC HIỆN RA KHI BẤM NÚT + */}
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

                {/* 6. Nhập mô tả */}
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

                {/* Nút bấm Submit form chính */}
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
    );
};

export default TransactionsView;
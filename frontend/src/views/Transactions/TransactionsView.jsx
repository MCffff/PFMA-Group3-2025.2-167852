import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Loader2, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const TransactionsView = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentUserId = sessionStorage.getItem('userId');

    // State quản lý Form nhập liệu giao dịch mới
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        categoryId: '1', // Mặc định ID danh mục số 1
        walletId: '1'    // Mặc định ID ví tiền số 1
    });

    // 1. Hàm GET: Tải danh sách giao dịch RIÊNG BIỆT của tài khoản đăng nhập
    const fetchTransactions = async () => {
        if (!currentUserId) {
            setError("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại!");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Gọi chính xác cổng API lọc theo User ID
            const response = await api.get(`/transactions/user/${currentUserId}`);
            setTransactions(response.data);
            setError(null);
        } catch (err) {
            console.error("Lỗi lấy danh sách giao dịch:", err);
            setError("Không thể kết nối dữ liệu giao dịch. Hãy kiểm tra server Backend!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentUserId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 2. Hàm POST: Thêm mới một giao dịch gắn liền với tài khoản đang đăng nhập
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount) return alert("Vui lòng nhập số tiền!");

        // Đóng gói cấu trúc payload truyền sang cho lớp TransactionRequest DTO nhận diện
        const transactionRequestPayload = {
            amount: Number(formData.amount),
            description: formData.description,
            walletId: Number(formData.walletId),
            categoryId: Number(formData.categoryId),
            userId: Number(currentUserId) // Bổ sung trường userId vào Payload để Backend biết giao dịch này của ai
        };

        try {
            // Gửi lệnh POST sang đường dẫn http://localhost:8080/api/transactions
            const response = await api.post('/transactions', transactionRequestPayload);

            // [UC10] Kiểm tra an toàn xem Backend có bắn kèm tin nhắn cảnh báo hạn mức thông minh về không
            if (response.data && response.data.alertMessage) {
                alert(`⚠️ CẢNH BÁO HỆ THỐNG: ${response.data.alertMessage}`);
            }

            await fetchTransactions(); // Tải lại danh sách mới để cập nhật bảng dữ liệu
            setIsModalOpen(false);     // Đóng modal Form nhập liệu
            setFormData({ amount: '', description: '', categoryId: '1', walletId: '1' }); // Reset form sạch sẽ
        } catch (err) {
            console.error("Lỗi khi thêm giao dịch thật:", err);
            alert("Thêm giao dịch thất bại! Hãy chắc chắn ID ví và ID danh mục đã tồn tại trong MySQL, hoặc kiểm tra lại cấu trúc thuộc tính của TransactionRequest DTO.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <Loader2 className="text-emerald-500 animate-spin" size={40} />
                <p className="text-slate-500 font-medium text-sm">Đang tải lịch sử giao dịch từ MySQL...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* HEADER TRANG */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Lịch sử giao dịch thật</h1>
                    <p className="text-sm text-slate-500 mt-1">Dữ liệu thu chi được cập nhật thời gian thực theo từng tài khoản riêng biệt.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                >
                    <Plus size={18} />
                    Ghi chép giao dịch mới
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* DANH SÁCH BẢNG GIAO DỊCH LẤY TỪ DATABASE */}
            {transactions.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium text-sm">
                    Chưa có giao dịch nào được ghi nhận cho tài khoản này. Hãy bấm nút phía trên để tạo giao dịch thật nhé!
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                                <th className="p-4">Kiểu</th>
                                <th className="p-4">Số tiền</th>
                                <th className="p-4">Danh mục</th>
                                <th className="p-4">Ghi chú / Mô tả</th>
                                <th className="p-4">Thời gian</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {transactions.map((tx) => {
                                const isExpense = tx.category?.type === 'EXPENSE';
                                const formattedDate = tx.transactionDate ? new Date(tx.transactionDate).toLocaleString('vi-VN') : 'Vừa xong';

                                return (
                                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                isExpense ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                                            }`}>
                                              {isExpense ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                {isExpense ? 'Khoản Chi' : 'Thu Nhập'}
                                            </span>
                                        </td>
                                        <td className={`p-4 font-bold ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {isExpense ? '-' : '+'}{tx.amount?.toLocaleString()} đ
                                        </td>
                                        <td className="p-4 text-slate-900">{tx.category?.name || `Danh mục #${tx.category?.id}`}</td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">{tx.description || '—'}</td>
                                        <td className="p-4 text-slate-400 text-xs">{formattedDate}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL FORM GHI CHÉP GIAO DỊCH */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">Ghi chép giao dịch mới</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Số tiền (đ)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Ví dụ: 50000"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-semibold"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nội dung / Ghi chú</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Ví dụ: Ăn trưa với nhóm bạn"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Chọn danh mục thu chi</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-700 font-medium"
                                >
                                    <option value="1">Danh mục số 1 (Ăn uống - CHI)</option>
                                    <option value="2">Danh mục số 2 (Giải trí - CHI)</option>
                                    <option value="3">Danh mục số 3 (Lương đi làm - THU)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Chọn ví thanh toán</label>
                                <select
                                    name="walletId"
                                    value={formData.walletId}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-700 font-medium"
                                >
                                    <option value="1">Ví chính (Tiền mặt)</option>
                                    <option value="2">Tài khoản ngân hàng</option>
                                </select>
                            </div>

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
                                    className="px-5 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm"
                                >
                                    Ghi sổ giao dịch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionsView;
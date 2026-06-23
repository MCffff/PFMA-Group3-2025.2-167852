import { useState, useEffect } from 'react';
import { Wallet, Plus, Edit2, Trash2, Loader2, CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { getWalletsByUserId, createWallet, updateWallet, deleteWallet } from '../../services/api';

const WalletsView = () => {
    const [wallets, setWallets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // State quản lý đóng/mở Modal và Form dữ liệu
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState(null); // null = Thêm mới, có Object = Sửa ví
    const [formData, setFormData] = useState({ walletName: '', balance: '', description: '' });

    const currentUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('id');

    // LUỒNG 1: LOAD DANH SÁCH VÍ KHI TẢI TRANG
    const fetchWallets = async () => {
        if (!currentUserId) return;
        try {
            setIsLoading(true);
            const response = await getWalletsByUserId(currentUserId);
            setWallets(response.data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách ví:", err);
            setError("Không thể đồng bộ danh sách ví từ máy chủ!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("Giá trị currentUserId hiện tại là:", currentUserId);
        const loadData = async () => {
            if (currentUserId) {
                await fetchWallets();
            }
        };
        loadData();
    }, [currentUserId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Mở Modal (Thêm hoặc Sửa)
    const openModal = (wallet = null) => {
        setError('');
        setMessage('');
        if (wallet) {
            setEditingWallet(wallet);
            setFormData({
                walletName: wallet.walletName,
                balance: wallet.balance,
                description: wallet.description || ''
            });
        } else {
            setEditingWallet(null);
            setFormData({ walletName: '', balance: '', description: '' });
        }
        setIsModalOpen(true);
    };

    // LUỒNG 2 & 3: XỬ LÝ SUBMIT (THÊM MỚI HOẶC SỬA VÍ)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const payload = {
            walletName: formData.walletName,
            balance: Number(formData.balance),
            description: formData.description
        };

        try {
            setIsLoading(true);
            if (editingWallet) {
                // Luồng Sửa Ví (PUT)
                const response = await updateWallet(editingWallet.id, payload);
                setMessage(response.data?.message || "Cập nhật ví thành công!");
            } else {
                // Luồng Thêm Ví Mới (POST)
                const response = await createWallet({ ...payload, userId: Number(currentUserId) });
                setMessage(response.data?.message || "Thêm ví thành công!");
            }

            setIsModalOpen(false);
            fetchWallets(); // 🔄 Tải lại danh sách ví theo dặn dò của Cường Backend
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Thao tác ví thất bại, vui lòng kiểm tra lại!");
        } finally {
            setIsLoading(false);
        }
    };

    // LUỒNG 4: XỬ LÝ XÓA VÍ
    const handleDeleteWallet = async (walletId, walletName) => {
        if (!window.confirm(`⚠️ Ông có chắc chắn muốn xóa ví "${walletName}" không?\nTất cả dữ liệu số dư liên quan sẽ bị xóa sạch khỏi MySQL!`)) {
            return;
        }

        try {
            setIsLoading(false);
            const response = await deleteWallet(walletId);
            setMessage(response.data?.message || "Xóa ví thành công!");
            fetchWallets(); // 🔄 Cập nhật lại UI sau khi xóa thành công
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Lỗi hệ thống, không thể xóa ví lúc này!");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header phân hệ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Wallet className="text-slate-700" size={22} /> Quản lý ví & Nguồn tiền
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Khởi tạo và cấu hình các dòng tiền lưu chuyển (Tiền mặt, ATM, Ví Momo...)</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                    <Plus size={16} /> Thêm ví nguồn tiền mới
                </button>
            </div>

            {/* Khối thông báo Trạng thái */}
            {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{message}</span>
                </div>
            )}
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Danh sách Ví dưới dạng Card lưới */}
            {isLoading && wallets.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
                    <Loader2 className="animate-spin" size={18} /> Đang đồng bộ nguồn tiền từ Database...
                </div>
            ) : wallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-12 h-12 bg-white border border-slate-100 flex items-center justify-center text-slate-400 rounded-xl mb-3 shadow-sm">
                        <Wallet size={24} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Chưa có ví nguồn tiền nào!</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">Bấm nút góc trên bên phải để tạo ngay ví đầu tiên (Ví dụ: Tiền mặt) để theo dõi số dư nhé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallets.map((wallet) => (
                        <div key={wallet.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between relative group">
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        <Wallet size={18} />
                                    </div>
                                    {/* Bộ nút Thao tác (Sửa/Xóa) */}
                                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => openModal(wallet)}
                                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                                            title="Sửa thông tin ví"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWallet(wallet.id, wallet.walletName)}
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Xóa ví nguồn"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">{wallet.walletName}</h3>
                                {wallet.description && (
                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mb-3">
                                        <Info size={12} className="shrink-0 text-slate-300" /> {wallet.description}
                                    </p>
                                )}
                            </div>
                            <div className="pt-3 border-t border-slate-100 mt-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Số dư hiện tại</p>
                                <p className="text-lg font-black text-slate-900 mt-0.5">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet.balance)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ================= MODAL LÊN FORM THÊM / SỬA VÍ ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 relative animate-in zoom-in-95 duration-150 space-y-4">
                        <button
                            type="button" onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                {editingWallet ? 'Cập nhật thông tin ví' : 'Thêm ví nguồn tiền mới'}
                            </h3>
                            <p className="text-[11px] text-slate-400">Thiết lập cấu hình dòng tiền đối soát thu chi.</p>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên ví / Tên tài khoản ngân hàng</label>
                                <input
                                    type="text" name="walletName" placeholder="Ví dụ: Ví điện tử Momo, Thẻ Vietcombank..."
                                    value={formData.walletName} onChange={handleInputChange} required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Số dư khởi tạo (đ)</label>
                                <input
                                    type="number" name="balance" placeholder="Nhập số dư ban đầu, ví dụ: 500000"
                                    value={formData.balance} onChange={handleInputChange} required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mô tả / Ghi chú ngắn (Không bắt buộc)</label>
                                <textarea
                                    name="description" rows="2" placeholder="Ví dụ: Tiền tiết kiệm, tài khoản nhận lương..."
                                    value={formData.description} onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                type="button" onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit" disabled={isLoading}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={14} />}
                                {editingWallet ? 'Lưu cập nhật' : 'Xác nhận tạo ví'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default WalletsView;
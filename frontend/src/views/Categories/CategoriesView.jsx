import { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { getCategoriesManagement, createCategoryManagement, updateCategoryManagement, deleteCategoryManagement } from '../../services/api';

const CategoriesView = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // State quản lý Modal và Form dữ liệu
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null); // null = Thêm mới, có Object = Sửa
    const [formData, setFormData] = useState({ categoryName: '', type: 'EXPENSE' });

    const currentUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('id');

    // 🟢 LUỒNG 1: TẢI DANH SÁCH DANH MỤC KHI VÀO TRANG
    const fetchCategories = async () => {
        if (!currentUserId) return;
        try {
            setIsLoading(true);
            const response = await getCategoriesManagement(Number(currentUserId));
            setCategories(response.data || []);
        } catch (err) {
            console.error("Lỗi tải danh mục:", err);
            setError("Không thể đồng bộ danh sách danh mục từ máy chủ!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (currentUserId) {
                await fetchCategories();
            }
        };
        loadData();
    }, [currentUserId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (category = null) => {
        setError('');
        setMessage('');
        if (category) {
            setEditingCategory(category);
            setFormData({ categoryName: category.categoryName, type: category.type });
        } else {
            setEditingCategory(null);
            setFormData({ categoryName: '', type: 'EXPENSE' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ categoryName: '', type: 'EXPENSE' });
    };

    // 🟢 LUỒNG 2 & 3: XỬ LÝ LƯU FORM (THÊM HOẶC SỬA)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!formData.categoryName.trim()) return;

        const payload = {
            categoryName: formData.categoryName.trim(),
            type: formData.type,
            userId: Number(currentUserId)
        };

        try {
            setIsLoading(true);
            if (editingCategory) {
                // Luồng Sửa Danh Mục (PUT)
                const response = await updateCategoryManagement(editingCategory.id, payload);
                setMessage(response.data?.message || "Cập nhật danh mục thành công!");
            } else {
                // Luồng Thêm Mới (POST)
                const response = await createCategoryManagement(payload);
                setMessage(response.data?.message || "Thêm danh mục mới thành công!");
            }
            closeModal(); // 🟢 ĐÃ TỐI ƯU: Clear trạng thái và đóng modal an toàn
            fetchCategories(); // 🔄 Tải lại danh sách mới
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Thao tác thất bại, vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    // 🟢 LUỒNG 4: XỬ LÝ XÓA DANH MỤC (CÓ PHÒNG THỦ KHÓA NGOẠI)
    const handleDeleteCategory = async (category) => {
        if (category.userId === null || category.isSystem) {
            alert("🔒 Đây là danh mục mặc định của hệ thống đồ án, không được phép xóa ông nhé!");
            return;
        }

        if (!window.confirm(`⚠️ Ông có chắc muốn xóa danh mục tự chọn "${category.categoryName}" không?`)) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setMessage('');
            const response = await deleteCategoryManagement(category.id);
            setMessage(response.data?.message || "Xóa danh mục thành công!");
            fetchCategories();
        } catch (err) {
            console.error("Lỗi xóa danh mục:", err);
            if (err.response && err.response.status === 500) {
                setError(`❌ Không thể xóa danh mục này vì ông đã sử dụng nó để ghi chép một số Giao dịch trước đó. Hãy xóa các giao dịch liên quan trước nhé!`);
            } else {
                setError(err.response?.data?.message || "Có lỗi xảy ra khi thực hiện xóa!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header phân hệ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Tag className="text-slate-700" size={22} /> Quản lý danh mục chi tiêu
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Cấu hình phân loại các khoản tiền vào/ra (Ăn uống, Tiền lương, Quỹ đen...) để lập báo cáo phân tích.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                    <Plus size={16} /> Thêm danh mục tự chọn
                </button>
            </div>

            {/* Khối hiển thị thông báo */}
            {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{message}</span>
                </div>
            )}
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                </div>
            )}

            {/* BẢNG DANH SÁCH DANH MỤC */}
            {isLoading && categories.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
                    <Loader2 className="animate-spin" size={18} /> Đang đồng bộ danh mục từ MySQL...
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Tên hạng mục</th>
                            <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Loại phân tách</th>
                            <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider">Nguồn gốc</th>
                            <th className="px-6 py-3.5 font-bold text-xs uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                        {categories.map((cat) => {
                            const isSystem = cat.userId === null || cat.isSystem;
                            return (
                                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{cat.categoryName}</td>
                                    <td className="px-6 py-4">
                                        {cat.type === 'EXPENSE' ? (
                                            <span className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold rounded-lg">💸 Khoản Chi ra</span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg">💰 Khoản Thu vào</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isSystem ? (
                                            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">🔒 Hệ thống khóa cứng</span>
                                        ) : (
                                            <span className="text-indigo-600 text-xs font-bold">👤 Cá nhân tự tạo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!isSystem && (
                                            <div className="inline-flex items-center gap-1">
                                                <button
                                                    onClick={() => openModal(cat)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                                    title="Sửa danh mục"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Xóa danh mục"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= MODAL THÊM / SỬA DANH MỤC ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 p-6 relative animate-in zoom-in-95 duration-150 space-y-4">
                        <button
                            type="button" onClick={closeModal}
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full"
                        >
                            <X size={14} />
                        </button>

                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                {editingCategory ? 'Cập nhật danh mục' : 'Tạo thêm danh mục mới'}
                            </h3>
                            <p className="text-[11px] text-slate-400">Phân tách rõ ràng dòng tiền giúp đồ án chạy chuẩn xác.</p>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tên hạng mục</label>
                                <input
                                    type="text" name="categoryName" placeholder="Ví dụ: Quỹ đen, Săn deal trà sữa..."
                                    value={formData.categoryName} onChange={handleInputChange} required
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Loại danh mục</label>
                                <select
                                    name="type" value={formData.type} onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-bold text-slate-700"
                                >
                                    <option value="EXPENSE">💸 Khoản Chi ra (Expense)</option>
                                    <option value="INCOME">💰 Khoản Thu vào (Income)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <button
                                type="button" onClick={closeModal}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit" disabled={isLoading}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={14} />}
                                {editingCategory ? 'Lưu cập nhật' : 'Xác nhận tạo'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CategoriesView;
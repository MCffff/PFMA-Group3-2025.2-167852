import { useState } from 'react';
import { Plus, Trash2, Search, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockRecentTransactions } from '../../services/mockData';

const TransactionsView = () => {
    // 1. State quản lý danh sách giao dịch (để có thể thêm/xóa động)
    const [transactions, setTransactions] = useState(mockRecentTransactions);

    // 2. State quản lý việc đóng/mở Modal Form thêm mới
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 3. State quản lý tìm kiếm/bộ lọc
    const [searchTerm, setSearchTerm] = useState('');

    // 4. State quản lý dữ liệu nhập vào từ Form
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: 'Ăn uống',
        date: new Date().toISOString().split('T')[0],
        note: ''
    });

    // Hàm xử lý thay đổi dữ liệu trong ô nhập
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Hàm xử lý Thêm giao dịch mới khi nhấn Submit Form
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.note) {
            alert('Vui lòng điền đầy đủ số tiền và ghi chú!');
            return;
        }

        const newTransaction = {
            id: `tx-${Date.now()}`, // tạo id duy nhất
            type: formData.type,
            amount: Number(formData.amount).toLocaleString('vi-VN'),
            category: formData.category,
            date: formData.date,
            note: formData.note
        };

        // Cập nhật lên đầu danh sách giao dịch
        setTransactions([newTransaction, ...transactions]);

        // Reset form và đóng modal
        setFormData({
            type: 'expense',
            amount: '',
            category: 'Ăn uống',
            date: new Date().toISOString().split('T')[0],
            note: ''
        });
        setIsModalOpen(false);
    };

    // Hàm xử lý Xóa giao dịch
    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
            setTransactions(transactions.filter(tx => tx.id !== id));
        }
    };

    // Lọc danh sách giao dịch theo từ khóa tìm kiếm (Ghi chú hoặc Danh mục)
    const filteredTransactions = transactions.filter(tx =>
        tx.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 relative">
            {/* --- TIÊU ĐỀ & NÚT THÊM MỚI --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý giao dịch</h1>
                    <p className="text-sm text-slate-500 mt-1">Ghi chép và theo dõi các khoản thu chi của bạn.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-semibold rounded-xl shadow-md shadow-emerald-500/10 transition-all"
                >
                    <Plus size={20} />
                    Thêm giao dịch
                </button>
            </div>

            {/* --- THANH TÌM KIẾM --- */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 max-w-md shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo ghi chú, danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-sm text-slate-700 bg-transparent focus:outline-none"
                />
            </div>

            {/* --- BẢNG DANH SÁCH LỊCH SỬ GIAO DỊCH --- */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                            <th className="py-4 px-6">Loại</th>
                            <th className="py-4 px-6">Danh mục</th>
                            <th className="py-4 px-6">Ghi chú</th>
                            <th className="py-4 px-6">Ngày</th>
                            <th className="py-4 px-6 text-right">Số tiền</th>
                            <th className="py-4 px-6 text-center">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">
                                    Không tìm thấy giao dịch nào tương ứng.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        {tx.type === 'income' ? (
                                            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg inline-block">
                          <ArrowUpRight size={16} />
                        </span>
                                        ) : (
                                            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg inline-block">
                          <ArrowDownRight size={16} />
                        </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
                        {tx.category}
                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 max-w-[220px] truncate">{tx.note}</td>
                                    <td className="py-4 px-6 text-slate-400">{tx.date}</td>
                                    <td className={`py-4 px-6 text-right font-bold text-base ${
                                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount} đ
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button
                                            onClick={() => handleDelete(tx.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                            title="Xóa giao dịch"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- CỬA SỔ BẬT LÊN (MODAL FORM POP-UP) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animated fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
                        {/* Header Modal */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">Thêm biến động số dư</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form nội dung */}
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {/* Chọn Loại Giao Dịch */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Loại giao dịch</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                                        className={`py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                                            formData.type === 'expense'
                                                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        Chi tiêu (-)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'income' })}
                                        className={`py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                                            formData.type === 'income'
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        Thu nhập (+)
                                    </button>
                                </div>
                            </div>

                            {/* Nhập số tiền */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Số tiền (đ)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Ví dụ: 50000"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
                                    required
                                />
                            </div>

                            {/* Chọn Danh Mục */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Danh mục</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-medium text-slate-700"
                                >
                                    {formData.type === 'expense' ? (
                                        <>
                                            <option value="Ăn uống">Ăn uống</option>
                                            <option value="Tiền nhà">Tiền nhà</option>
                                            <option value="Đi lại">Đi lại</option>
                                            <option value="Học tập">Học tập</option>
                                            <option value="Giải trí">Giải trí</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Việc làm thêm">Việc làm thêm</option>
                                            <option value="Được tặng">Được tặng</option>
                                            <option value="Học bổng">Học bổng</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Chọn Ngày tháng */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ngày thực hiện</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-600"
                                    required
                                />
                            </div>

                            {/* Nhập Ghi chú */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ghi chú / Mô tả</label>
                                <textarea
                                    name="note"
                                    placeholder="Nhập nội dung chi tiết..."
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-slate-700 placeholder:text-slate-400"
                                    required
                                />
                            </div>

                            {/* Nút hành động */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm transition-colors"
                                >
                                    Lưu giao dịch
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
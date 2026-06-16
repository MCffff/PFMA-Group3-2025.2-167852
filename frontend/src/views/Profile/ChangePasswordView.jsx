import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ChangePasswordView = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId'); // Lấy ID của User đang đăng nhập

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) return alert("Vui lòng nhập đủ các trường!");

        setLoading(true);
        setError('');

        try {
            await api.put(`/users/change-password/${currentUserId}`, { oldPassword, newPassword });
            alert("🔒 Đổi mật khẩu thành công!");

            // Xóa sạch session ngắn hạn
            sessionStorage.clear();
            navigate('/login');
        } catch (err) {
            console.error("Lỗi đổi mật khẩu:", err);
            setError(err.response?.data?.message || "Mật khẩu cũ không chính xác. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <KeyRound className="text-indigo-500" size={24} />
                    Bảo mật tài khoản
                </h1>
                <p className="text-sm text-slate-500 mt-1">Thay đổi mật khẩu đăng nhập định kỳ để bảo vệ dữ liệu ví.</p>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Mật khẩu cũ đang sử dụng</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Mật khẩu mới muốn thay đổi</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                            placeholder="Tối thiểu 6 ký tự để bảo mật"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Cập nhật mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordView;
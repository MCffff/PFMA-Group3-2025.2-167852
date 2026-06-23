import { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { changePassword } from '../../services/api';

const ChangePasswordView = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Lấy Id người dùng đang đăng nhập từ sessionStorage
    const currentUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('id');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // 1. Kiểm tra phiên đăng nhập
        if (!currentUserId || currentUserId === 'undefined' || currentUserId === 'null') {
            setError('Không tìm thấy phiên đăng nhập hợp lệ. Vui lòng thử đăng nhập lại!');
            return;
        }

        // 2. Kiểm tra nhanh ở Frontend: Mật khẩu mới có khớp ô xác nhận không
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
            return;
        }

        // 3. Kiểm tra độ dài mật khẩu theo nghiệp vụ hệ thống
        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải từ 6 ký tự trở lên để đảm bảo tính an toàn!');
            return;
        }

        try {
            setIsLoading(true); // Bật loading chống click spam

            // Gửi Object phẳng lên đúng Endpoint http://localhost:8080/api/auth/change-password
            const response = await changePassword(
                Number(currentUserId), // Ép kiểu số nguyên cho chuẩn DB
                formData.oldPassword,
                formData.newPassword
            );

            // 🟢 Hứng response.data.message ("Đổi mật khẩu thành công!") theo tài liệu Backend
            setMessage(response.data?.message || 'Đổi mật khẩu thành công!');

            // Xóa sạch các ô nhập liệu sau khi đổi thành công
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            console.error("Lỗi xử lý đổi mật khẩu từ server:", err);

            // 🟢 Bắt chuẩn xác Object lỗi của Cường: err.response.data.message
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Ví dụ: "Mật khẩu hiện tại không chính xác!"
            } else {
                setError('Có lỗi xảy ra khi kết nối đến máy chủ API!');
            }
        } finally {
            setIsLoading(false); // Tắt hiệu ứng quay tròn
        }
    };

    return (
        <div className="max-w-md p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
                    <ShieldAlert size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Đổi mật khẩu hệ thống</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">Vui lòng nhập đúng mật khẩu hiện tại để xác thực danh tính chủ tài khoản trước khi đổi.</p>

            {/* Khối thông báo thành công xanh rờn */}
            {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl mb-4 flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Khối thông báo thất bại đỏ hồng */}
            {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl mb-4 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        name="oldPassword"
                        placeholder="Nhập mật khẩu cũ để đối soát BCrypt"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium disabled:opacity-60"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mật khẩu mới</label>
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="Đặt mật khẩu mới từ 6 ký tự trở lên"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium disabled:opacity-60"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Gõ lại mật khẩu mới để kiểm tra trùng khớp"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium disabled:opacity-60"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Đang xử lý đối soát mã hóa...
                        </>
                    ) : 'Cập nhật mật khẩu'}
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordView;
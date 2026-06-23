// src/views/Auth/ForgotPasswordView.jsx
import { useState } from 'react';
import { Mail, KeyRound, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 🟢 1. IMPORT ĐIỀU HƯỚNG
import { forgotPassword, resetPassword } from '../../services/api';

const ForgotPasswordView = () => { // 🟢 Bỏ cái prop cũ đi
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // 🟢 2. KHỞI TẠO HÀM ĐIỀU HƯỚNG

    // Xử lý Bước 1: Yêu cầu Backend gửi mã Token về Gmail
    const handleRequestToken = async (e) => {
        e.preventDefault();
        if (!email) return;

        try {
            setError('');
            setMessage('');
            setIsLoading(true);

            await forgotPassword(email);

            setMessage('Mã xác thực khôi phục mật khẩu đã được gửi vào hòm thư Gmail của bạn!');
            setStep(2);
        } catch (err) {
            console.error("Lỗi yêu cầu gửi Token:", err);
            setError(err.response?.data || 'Email không tồn tại hoặc hệ thống gửi mail đang bận!');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý Bước 2: Đổi mật khẩu mới lên hệ thống
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!token || !newPassword) return;

        try {
            setError('');
            setIsLoading(true);

            await resetPassword(token, newPassword);

            alert('🎉 Chúc mừng! Đặt lại mật khẩu mới thành công. Hãy quay lại đăng nhập.');
            navigate('/login'); // 🟢 3. ĐỔI XONG TỰ ĐỘNG ĐẨY VỀ TRANG LOGIN
        } catch (err) {
            console.error("Lỗi đặt lại mật khẩu:", err);
            setError(err.response?.data || 'Mã xác thực không chính xác hoặc đã hết hạn sử dụng!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-200 transition-all duration-300">
                {/* Header Form */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                        {step === 1 ? <Mail className="text-slate-700" size={24} /> : <KeyRound className="text-emerald-600" size={24} />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Khôi phục mật khẩu</h2>
                    <p className="text-sm text-slate-500 mt-1">Hệ thống quản lý tài chính cá nhân thông minh HUST</p>
                </div>

                {/* Khối hiển thị thông báo Trạng thái */}
                {message && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl mb-4 flex items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl mb-4 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Biểu mẫu Step 1: Nhập Email */}
                {step === 1 ? (
                    <form onSubmit={handleRequestToken} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email tài khoản</label>
                            <input
                                type="email"
                                placeholder="Nhập email của bạn (Ví dụ: cuonghust@gmail.com)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium disabled:opacity-60"
                            />
                            <p className="text-xs text-slate-400 leading-relaxed">Hệ thống sẽ tự động quét cơ sở dữ liệu MySQL và gửi một mã Token bảo mật có thời hạn qua Gmail để xác thực danh tính của ông.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Đang mã hóa & gửi Mail...
                                </>
                            ) : 'Gửi mã xác nhận khôi phục'}
                        </button>
                    </form>
                ) : (
                    /* Biểu mẫu Step 2: Nhập Token từ Email + Mật khẩu mới */
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Mã Token xác thực từ Gmail</label>
                            <input
                                type="text"
                                placeholder="Dán chuỗi ký tự Token nhận được trong email"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-mono font-semibold tracking-wide text-slate-800"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Thiết lập mật khẩu mới</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu an toàn mới của bạn"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 font-medium"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Đang ghi đè dữ liệu mật khẩu...
                                </>
                            ) : 'Xác nhận cập nhật mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Nút quay lại trang Đăng nhập */}
                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/login')} // 🟢 4. ĐƯỜNG DẪN ROUTE QUAY VỀ LOGIN
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft size={14} /> Quay lại màn hình đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
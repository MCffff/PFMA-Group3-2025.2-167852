import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const RegisterView = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // LOGIC KIỂM TRA ĐỊNH DẠNG NGAY TẠI FORM
    const isEmailValid = (emailStr) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const isPasswordMatch = password === confirmPassword && password.length > 0;
    const isFormValid = username.length >= 3 && isEmailValid(email) && isPasswordMatch;

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setError('');

        try {
            // Gửi POST request chứa 3 trường thông tin chuẩn chỉ lên Backend
            await api.post('/auth/register', { username, email, password });
            setSuccess(true);
            // Tự động điều hướng về trang Đăng nhập sau 2 giây thành công
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            setError(err.response?.data?.message || "Đăng ký thất bại. Email hoặc tài khoản đã tồn tại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h1>
                    <p className="text-sm text-slate-500">Đăng ký để trải nghiệm Quản lý tài chính thông minh</p>
                </div>

                {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={18} /> Đăng ký thành công! Đang chuyển hướng về trang đăng nhập...
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-center gap-2">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tên tài khoản</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                            placeholder="Ít nhất 3 ký tự"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Địa chỉ Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                                email.length > 0 && !isEmailValid(email) ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'
                            }`}
                            placeholder="cuong.tm@sis.hust.edu.vn"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nhập lại mật khẩu</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none ${
                                confirmPassword.length > 0 && !isPasswordMatch ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'
                            }`}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`w-full font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 ${
                            isFormValid && !loading
                                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Xác nhận đăng ký'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterView;
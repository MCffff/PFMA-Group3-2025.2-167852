import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';

const LoginView = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [inlineError, setInlineError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setInlineError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { username, password });

            // Hứng trường 'id' từ Backend trả về (Tránh bị undefined)
            const { token, id, username: resUsername } = response.data;

            // LƯU BẰNG SESSIONSTORAGE
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('userId', id);
            sessionStorage.setItem('username', resUsername);

            navigate('/dashboard');
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            if (err.response && err.response.status === 401) {
                setInlineError("Username hoặc mật khẩu không đúng. Vui lòng thử lại.");
            } else {
                setInlineError("Hệ thống bận hoặc mất kết nối server Backend.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Đăng nhập Personal Finance Pro</h1>
                    <p className="text-sm text-slate-500">Nhập tài khoản của bạn để bắt đầu</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tên tài khoản (Username)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                            placeholder="Ví dụ: cuongmanh"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold uppercase text-slate-500">Mật khẩu</label>

                            {/* 🟢 CHÈN NÚT QUÊN MẬT KHẨU VÀO ĐÂY */}
                            <Link
                                to="/forgot-password"
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900"
                            placeholder="••••••••"
                            required
                        />
                        {inlineError && (
                            <p className="text-xs text-rose-600 font-medium mt-1.5 bg-rose-50 p-2 rounded-lg border border-rose-100">
                                {inlineError}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Đăng nhập'}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100 text-sm text-slate-500">
                    Chưa có tài khoản hệ thống?{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
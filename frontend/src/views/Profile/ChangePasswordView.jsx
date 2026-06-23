import { useState, useEffect } from 'react';
import { User, ShieldAlert, CheckCircle2, AlertCircle, Loader2, UserCheck, Settings } from 'lucide-react';
import { getUserProfile, updateUserProfile, changePassword } from '../../services/api';

const ChangePasswordView = () => {
    // 1. Quản lý State cho Form Thông tin cá nhân (Đã đổi sang fullName)
    const [profileData, setProfileData] = useState({ fullName: '', email: '' });
    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // 2. Quản lý State cho Form Đổi mật khẩu
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    // Bốc Id người dùng đang đăng nhập từ phiên làm việc
    const currentUserId = sessionStorage.getItem('userId') || sessionStorage.getItem('id');

    // LUỒNG 1: Tự động đổ dữ liệu cũ từ MySQL lên Form khi vừa mở trang
    useEffect(() => {
        if (!currentUserId) return;
        getUserProfile(currentUserId)
            .then(res => {
                // 👉 ĐÃ SỬA: Đổi từ res.data.username thành res.data.fullName theo yêu cầu của Cường
                setProfileData({
                    fullName: res.data.fullName || '',
                    email: res.data.email || ''
                });
            })
            .catch(err => {
                console.error("Lỗi tải thông tin:", err);
                setProfileErr("Không thể bốc dữ liệu thông tin cá nhân từ Server!");
            });
    }, [currentUserId]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    // LUỒNG 2: Xử lý khi nhấn nút "Lưu thay đổi" thông tin cá nhân
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileErr('');
        setProfileMsg('');

        try {
            setIsProfileLoading(true);

            const response = await updateUserProfile(currentUserId, profileData.fullName, profileData.email);

            setProfileMsg(response.data?.message || "Cập nhật thông tin thành công!");

            // Ghi đè tên mới vào sessionStorage để Header bốc theo thời gian thực
            if (response.data?.data?.fullName) {
                sessionStorage.setItem('username', response.data.data.fullName);
                window.dispatchEvent(new Event('storage'));
            }
        } catch (err) {
            console.error(err);
            setProfileErr(err.response?.data?.message || "Lỗi ghi đè thông tin mới!");
        } finally {
            setIsProfileLoading(false);
        }
    };

    // LUỒNG 3: Xử lý đổi mật khẩu (Giữ nguyên cơ chế bảo mật POST)
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPasswordErr('');
        setPasswordMsg('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordErr('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordErr('Mật khẩu mới phải từ 6 ký tự trở lên!');
            return;
        }

        try {
            setIsPasswordLoading(true);
            const response = await changePassword(Number(currentUserId), passwordData.oldPassword, passwordData.newPassword);

            setPasswordMsg(response.data?.message || 'Đổi mật khẩu thành công!');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            if (err.response?.data?.message) {
                setPasswordErr(err.response.data.message);
            } else {
                setPasswordErr('Có lỗi xảy ra khi kết nối đối soát máy chủ API!');
            }
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

            {/* ================= TIÊU ĐỀ TỔNG CỦA MODAL NỔI ================= */}
            <div className="flex items-center gap-2.5 mb-2 border-b border-slate-100 pb-3">
                <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
                    <Settings size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Cài đặt tài khoản</h2>
                    <p className="text-xs text-slate-400">Quản lý thông tin hồ sơ và cấu hình bảo mật cá nhân</p>
                </div>
            </div>

            {/* ================= PHẦN TRÊN: QUẢN LÝ THÔNG TIN CÁ NHÂN ================= */}
            <div className="p-2 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
                        <User size={18} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Thông tin cá nhân</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">Chỉnh sửa họ tên hiển thị và email liên kết của tài khoản.</p>

                {profileMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl mb-3 flex items-center gap-2">
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>{profileMsg}</span>
                    </div>
                )}
                {profileErr && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl mb-3 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{profileErr}</span>
                    </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Họ và tên</label>
                            <input
                                type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required disabled={isProfileLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Hòm thư Email</label>
                            <input
                                type="email" name="email" value={profileData.email} onChange={handleProfileChange} required disabled={isProfileLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium"
                            />
                        </div>
                    </div>
                    <button
                        type="submit" disabled={isProfileLoading}
                        className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        {isProfileLoading ? <Loader2 className="animate-spin" size={14} /> : <UserCheck size={14} />}
                        Lưu thay đổi thông tin
                    </button>
                </form>
            </div>

            <hr className="border-slate-100" />

            {/* ================= PHẦN DƯỚI: ĐỔI MẬT KHẨU TÀI KHOẢN ================= */}
            <div className="p-2 bg-white rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg border border-slate-100">
                        <ShieldAlert size={18} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Đổi mật khẩu bảo mật</h3>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">Nhập mật khẩu hiện tại để thực hiện ghi đè chuỗi băm bảo mật mới.</p>

                {passwordMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl mb-3 flex items-center gap-2">
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>{passwordMsg}</span>
                    </div>
                )}
                {passwordErr && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl mb-3 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{passwordErr}</span>
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mật khẩu hiện tại</label>
                        <input
                            type="password" name="oldPassword" placeholder="Nhập mật khẩu cũ" value={passwordData.oldPassword} onChange={handlePasswordChange} required disabled={isPasswordLoading}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mật khẩu mới</label>
                            <input
                                type="password" name="newPassword" placeholder="Tối thiểu 6 ký tự" value={passwordData.newPassword} onChange={handlePasswordChange} required disabled={isPasswordLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Xác nhận mật khẩu mới</label>
                            <input
                                type="password" name="confirmPassword" placeholder="Nhập lại mật khẩu mới" value={passwordData.confirmPassword} onChange={handlePasswordChange} required disabled={isPasswordLoading}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-900 bg-slate-50/30 font-medium"
                            />
                        </div>
                    </div>
                    <button
                        type="submit" disabled={isPasswordLoading}
                        className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                        {isPasswordLoading ? 'Đang cập nhật chuỗi băm...' : 'Cập nhật mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordView;
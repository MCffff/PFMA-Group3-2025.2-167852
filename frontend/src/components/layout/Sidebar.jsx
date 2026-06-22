import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PieChart, Wallet, ShieldCheck, LogOut } from 'lucide-react';

const Sidebar = () => {
    // Danh sách các mục menu ứng với các Use Case chính
    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/transactions', name: 'Giao dịch', icon: <ArrowLeftRight size={20} /> },
        { path: '/analytics', name: 'Báo cáo & Phân tích', icon: <PieChart size={20} /> },
        { path: '/budgets', name: 'Hạn mức chi tiêu', icon: <Wallet size={20} /> },
    ];

    const handleLogout = () => {
        // 1. Xóa sạch bách mã Token và User ID khỏi bộ nhớ trình duyệt
        sessionStorage.clear();

        // 2. Đá người dùng quay trở lại màn hình Đăng nhập ngay lập tức
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
            {/* Phần Logo ứng dụng */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg text-slate-900">
                    <ShieldCheck size={24} className="font-bold" />
                </div>
                <div>
                    <h2 className="text-xl font-black tracking-wider text-emerald-400">PFMA</h2>
                    <p className="text-xs text-slate-400">Personal Finance Pro</p>
                </div>
            </div>

            {/* Danh sách Menu điều hướng */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                                isActive
                                    ? 'bg-emerald-500 text-slate-900 font-semibold shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                        <span>{item.name}</span>
                    </NavLink>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-medium rounded-lg transition-all duration-200 group text-left mt-4"
                >
          <span className="transition-transform group-hover:translate-x-1">
            <LogOut size={20} />
          </span>
                    <span>Đăng xuất</span>
                </button>
            </nav>

            {/* Phần Footer của Sidebar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-500 text-center">
                <p className="font-medium text-slate-400">HUST Project - Group 3</p>
                <p className="mt-1">v1.0.0 · Tuần 1 Foundation</p>
            </div>
        </aside>
    );
};

export default Sidebar;
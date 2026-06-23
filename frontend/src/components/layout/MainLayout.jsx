import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, KeyRound, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import ChangePasswordView from '../../views/Profile/ChangePasswordView'; // 🟢 Nhớ check đúng đường dẫn đến file UC03 của ông nhé

const MainLayout = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đóng dropdown tự động khi click ra vùng ngoài không gian Menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý đăng xuất hệ thống
  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/login');
  };

  return (
      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex">
        {/* Sidebar cố định bên trái */}
        <Sidebar />

        {/* Vùng nội dung bên phải (Dịch lùi vào ml-64 do chiều rộng của Sidebar là w-64) */}
        <div className="flex-1 ml-64 flex flex-col min-h-screen">

          {/* Header trên cùng */}
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-end px-8 sticky top-0 z-10 shadow-sm">

            {/* 🟢 KHỐI USER MENU THẢ XUỐNG (DROPDOWN) */}
            <div className="relative" ref={dropdownRef}>
              <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-all text-left focus:outline-none"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">Mạnh Cường</p>
                  <p className="text-xs text-slate-400">Sinh viên năm 2 - Bách Khoa</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
                  MC
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* THANH MENU CON THẢ XUỐNG KHI CLICK */}
              {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                    <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                    >
                      <KeyRound size={15} className="text-slate-400" />
                      ⚙️ Đổi mật khẩu
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut size={15} />
                      🚪 Đăng xuất
                    </button>
                  </div>
              )}
            </div>

          </header>

          {/* Khung chứa nội dung chính của các Use Case */}
          <main className="flex-1 p-8 bg-slate-50">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-10.5rem)] p-2">
              <Outlet />
            </div>
          </main>
        </div>

        {/* 🟢 KHỐI MODAL NỔI LÊN TRÊN MÀN HÌNH CHỨA FORM ĐỔI MẬT KHẨU */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 relative animate-in zoom-in-95 duration-150">

                {/* Nút Đóng Modal bo tròn đặt góc phải */}
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                  ✕
                </button>

                {/* Nhúng thẳng file Đổi mật khẩu đã gài Axios POST chuẩn tài liệu HTML */}
                <div className="mt-2">
                  <ChangePasswordView />
                </div>

              </div>
            </div>
        )}

      </div>
  );
};

export default MainLayout;
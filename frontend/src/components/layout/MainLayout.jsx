import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Vùng nội dung bên phải (Dịch lùi vào ml-64 do chiều rộng của Sidebar là w-64) */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header trên cùng */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-end px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">Mạnh Cường</p>
              <p className="text-xs text-slate-400">Sinh viên năm 2 - Bách Khoa</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              MC
            </div>
          </div>
        </header>

        {/* Khung chứa nội dung chính của các Use Case */}
        <main className="flex-1 p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-10.5rem)] p-2">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
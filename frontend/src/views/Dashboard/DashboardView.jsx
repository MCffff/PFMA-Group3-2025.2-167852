import React, { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, ShoppingBag } from 'lucide-react';
import { mockFinancialSummary, mockRecentTransactions } from '../../services/mockData';

const DashboardView = () => {
    const [showBalance, setShowBalance] = useState(true);

    return (
        <div className="p-6 space-y-8">
            {/* 1. Tiêu đề trang & Nút ẩn/hiện bảo mật */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tổng quan tài chính</h1>
                    <p className="text-sm text-slate-500 mt-1">Chào mừng bạn trở lại, Mạnh Cường.</p>
                </div>
                <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all duration-200"
                >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showBalance ? "Ẩn số dư" : "Hiện số dư"}
                </button>
            </div>

            {/* 2. Grid 3 Thẻ hiển thị dòng tiền */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Thẻ Số dư hiện tại */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-md relative overflow-hidden">
                    <div className="absolute right-[-20px] bottom-[-20px] text-slate-700/20 pointer-events-none">
                        <ShoppingBag size={140} />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Số dư hiện tại</p>
                    <p className="text-3xl font-bold mt-3 tracking-wide transition-all">
                        {showBalance ? `${mockFinancialSummary.balance} đ` : "•••••• đ"}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Tài khoản chính ổn định
                    </div>
                </div>

                {/* Thẻ Tổng Thu nhập */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Tổng thu tháng này</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">
                            {showBalance ? `+${mockFinancialSummary.income} đ` : "•••••• đ"}
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <ArrowUpRight size={24} />
                    </div>
                </div>

                {/* Thẻ Tổng Chi tiêu */}
                <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Tổng chi tháng này</p>
                        <p className="text-2xl font-bold text-rose-600 mt-2">
                            {showBalance ? `-${mockFinancialSummary.expense} đ` : "•••••• đ"}
                        </p>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                        <ArrowDownRight size={24} />
                    </div>
                </div>
            </div>

            {/* 3. Widget Giao dịch gần đây (Table) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Giao dịch gần đây</h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            5 biến động mới nhất
          </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                            <th className="py-4 px-6">Danh mục</th>
                            <th className="py-4 px-6">Ghi chú</th>
                            <th className="py-4 px-6">Ngày</th>
                            <th className="py-4 px-6 text-right">Số tiền</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {mockRecentTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-900">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tx.category}
                    </span>
                                </td>
                                <td className="py-4 px-6 text-slate-500 max-w-[200px] truncate">{tx.note}</td>
                                <td className="py-4 px-6 text-slate-400">{tx.date}</td>
                                <td className={`py-4 px-6 text-right font-bold ${
                                    tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                }`}>
                                    {tx.type === 'income' ? '+' : '-'}{tx.amount} đ
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
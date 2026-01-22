import React, { useState } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

const HistorySection = ({ hideFilters, t }) => {
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const historyData = [
        { id: 'TXN001', date: '2026-01-21 14:30', item: 'Kottu Roti x2', amount: 2500, type: 'Dine-in', status: 'Completed' },
        { id: 'TXN002', date: '2026-01-21 14:45', item: 'Cheese Burger x1', amount: 1200, type: 'Delivery', status: 'Completed' },
        { id: 'TXN003', date: '2026-01-21 15:10', item: 'Pasta Carbonara x1', amount: 1800, type: 'Dine-in', status: 'Cancelled' },
        { id: 'TXN004', date: '2026-01-21 15:20', item: 'Chicken Fried Rice x3', amount: 4500, type: 'Takeaway', status: 'Completed' },
        { id: 'TXN005', date: '2026-01-21 15:45', item: 'Iced Coffee x5', amount: 3500, type: 'Dine-in', status: 'Completed' },
        { id: 'TXN006', date: '2026-01-21 16:00', item: 'Pizza Margherita x2', amount: 3200, type: 'Delivery', status: 'Refunded' },
    ];

    return (
        <div className="space-y-6">
            {!hideFilters && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border-none bg-slate-100 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-dashboard-blue"
                            />
                        </div>
                        <span className="text-slate-400">{t.to || 'to'}</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border-none bg-slate-100 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-dashboard-blue"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            <Filter className="w-4 h-4" />
                            {t.filter || 'Filter'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-dashboard-blue text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            {t.export}
                        </button>
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.txnId}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.dateTime}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.orderDetails}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.amount}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.type}</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historyData.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{row.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{row.item}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'Dine-in' ? 'bg-blue-100 text-blue-700' :
                                            row.type === 'Delivery' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {row.type === 'Dine-in' ? t.dineIn : row.type === 'Delivery' ? t.delivery : t.takeaway}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                            row.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {row.status === 'Completed' ? t.completed : row.status === 'Cancelled' ? t.cancelled : t.refunded}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <p>{t.showing.replace('{start}', '1').replace('{end}', '6').replace('{total}', '258')}</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>{t.previous}</button>
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white">{t.next}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorySection;

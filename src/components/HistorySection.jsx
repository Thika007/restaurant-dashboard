import React, { useState } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

const HistorySection = ({ hideFilters, t, data }) => {
    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const historyData = data || [];

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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historyData.map((row, index) => (
                                <tr key={row.TransID || index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.Bill_Id}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(row.TransDate).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{row.Item_Name} x{row.Qty}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.LineTotal.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700`}>
                                            {t.completed}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <p>
                        {t.showing
                            .replace('{start}', historyData.length > 0 ? '1' : '0')
                            .replace('{end}', historyData.length.toString())
                            .replace('{total}', historyData.length.toString())}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>{t.previous}</button>
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50" disabled>{t.next}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorySection;

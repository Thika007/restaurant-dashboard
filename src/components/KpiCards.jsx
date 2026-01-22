import React from 'react';
import { TrendingUp, CreditCard, CircleAlert, RefreshCcw, Wallet, Globe } from 'lucide-react';

// eslint-disable-next-line react/prop-types, no-unused-vars
const KpiCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card p-6 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}/10 flex items-center justify-center`}>
            {Icon && <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />}
        </div>
    </div>
);

const KpiCards = ({ isHistory, t, stats }) => {
    const kpis = [
        {
            title: isHistory ? t.totalRevenue : t.todayRevenue,
            value: stats?.total_revenue !== undefined ? stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            icon: TrendingUp,
            color: 'bg-dashboard-blue'
        },
        {
            title: isHistory ? t.totalBills : t.todayBills,
            value: stats?.bill_count !== undefined ? stats.bill_count.toLocaleString() : '0',
            icon: CreditCard,
            color: 'bg-indigo-500'
        },
        {
            title: isHistory ? t.totalCancelled : t.todayCancelled,
            value: stats?.cancelled_count !== undefined ? stats.cancelled_count.toLocaleString() : '0',
            icon: CircleAlert,
            color: 'bg-dashboard-red'
        },
        {
            title: isHistory ? t.totalRefunds : t.todayRefunds,
            value: '0.00',
            icon: RefreshCcw,
            color: 'bg-orange-500'
        },
        {
            title: isHistory ? t.pendingCash : t.upcomingCash,
            value: '0.00',
            icon: Wallet,
            color: 'bg-dashboard-green'
        },
        {
            title: isHistory ? t.totalOnline : t.todayOnline,
            value: '0',
            icon: Globe,
            color: 'bg-cyan-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {kpis.map((kpi, index) => (
                <KpiCard key={index} {...kpi} />
            ))}
        </div>
    );
};

export default KpiCards;

import React from 'react';
import { TrendingUp, CreditCard, CircleAlert, RefreshCcw, Wallet, Globe } from 'lucide-react';

// eslint-disable-next-line react/prop-types, no-unused-vars
const KpiCard = ({ title, value, icon: Icon, color, trend, trendText }) => (
    <div className="glass-card p-6 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend && (
                <p className={`text-xs mt-2 font-medium ${trend > 0 ? 'text-dashboard-green' : 'text-dashboard-red'}`}>
                    {trend > 0 ? '+' : ''}{trend}% {trendText}
                </p>
            )}
        </div>
        <div className={`p-3 rounded-xl ${color}/10 flex items-center justify-center`}>
            {Icon && <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />}
        </div>
    </div>
);

const KpiCards = ({ isHistory, t }) => {
    const kpis = [
        {
            title: isHistory ? t.totalRevenue : t.todayRevenue,
            value: isHistory ? '12,450,300.00' : '1,245,300.00',
            icon: TrendingUp,
            color: 'bg-dashboard-blue',
            trend: 12.5
        },
        {
            title: isHistory ? t.totalBills : t.todayBills,
            value: isHistory ? '4,582' : '458',
            icon: CreditCard,
            color: 'bg-indigo-500',
            trend: 8.2
        },
        {
            title: isHistory ? t.totalCancelled : t.todayCancelled,
            value: isHistory ? '124' : '12',
            icon: CircleAlert,
            color: 'bg-dashboard-red',
            trend: -4.1
        },
        {
            title: isHistory ? t.totalRefunds : t.todayRefunds,
            value: isHistory ? '154,000.00' : '15,400.00',
            icon: RefreshCcw,
            color: 'bg-orange-500',
            trend: 2.3
        },
        {
            title: isHistory ? t.pendingCash : t.upcomingCash,
            value: isHistory ? '450,600.00' : '45,600.00',
            icon: Wallet,
            color: 'bg-dashboard-green',
            trend: 15.7
        },
        {
            title: isHistory ? t.totalOnline : t.todayOnline,
            value: isHistory ? '1,245' : '124',
            icon: Globe,
            color: 'bg-cyan-500',
            trend: 10.1
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {kpis.map((kpi, index) => (
                <KpiCard key={index} {...kpi} trendText={isHistory ? t.vsPrevious : t.fromYesterday} />
            ))}
        </div>
    );
};

export default KpiCards;

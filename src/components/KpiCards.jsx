import React from 'react';
import {
    TrendingUp, CreditCard, CircleAlert, RefreshCcw, Wallet, Users,
    Trash2, Gift, UserCheck, Tag
} from 'lucide-react';

// eslint-disable-next-line react/prop-types, no-unused-vars
const KpiCard = ({ title, value, icon: Icon, color, subValue, lang }) => (
    <div className="glass-card p-4 sm:p-6 flex flex-col h-full min-h-[110px] sm:min-h-[130px] transition-all hover:shadow-md overflow-hidden">
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
            <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-sm font-medium text-slate-500 leading-snug truncate">
                    {title}
                </p>
                {subValue !== undefined && (
                    <p className="text-[9px] sm:text-[11px] font-bold text-dashboard-blue mt-0.5 uppercase tracking-wider">
                        {subValue} {lang === 'si' ? 'බිල්පත්' : 'Bills'}
                    </p>
                )}
            </div>
            {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 flex-shrink-0 mt-0.5" />}
        </div>
        <div className="mt-auto">
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 break-words">{value}</h3>
        </div>
    </div>
);

const KpiCards = ({ isHistory, t, stats, lang }) => {
    // Large Top Row Metrics
    const topRowKpis = [
        {
            title: isHistory ? t.totalRevenue : t.todayRevenue,
            value: stats?.total_revenue !== undefined ? stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.bill_count,
            icon: TrendingUp,
            color: 'bg-dashboard-blue'
        },
        {
            title: isHistory ? t.totalNetRevenue : t.todayNetRevenue,
            value: stats?.net_revenue !== undefined ? stats.net_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.bill_count,
            icon: Wallet,
            color: 'bg-dashboard-green'
        },
        {
            title: t.serviceCharge,
            value: stats?.total_service_charge !== undefined ? stats.total_service_charge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            icon: Wallet,
            color: 'bg-blue-600'
        },
        {
            title: t.totalDiscount,
            value: stats?.total_discount !== undefined ? stats.total_discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            icon: Tag,
            color: 'bg-pink-500'
        },
        {
            title: isHistory ? t.totalRefunds : t.todayRefunds,
            value: '0.00',
            icon: RefreshCcw,
            color: 'bg-orange-500'
        }
    ];

    // Smaller Bottom Row Metrics
    const bottomRowKpis = [
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
            title: t.numberOfGuests,
            value: stats?.guest_count !== undefined ? stats.guest_count.toLocaleString() : '0',
            icon: Users,
            color: 'bg-cyan-500'
        },
        {
            title: t.voidBills,
            value: stats?.void_amount !== undefined ? stats.void_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.void_count,
            icon: Trash2,
            color: 'bg-rose-500'
        },
        {
            title: t.complimentary,
            value: stats?.complimentary_amount !== undefined ? stats.complimentary_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.complimentary_count,
            icon: Gift,
            color: 'bg-purple-500'
        },
        {
            title: t.staff,
            value: stats?.staff_amount !== undefined ? stats.staff_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.staff_count,
            icon: UserCheck,
            color: 'bg-amber-500'
        }
    ];

    return (
        <div className="space-y-4 sm:space-y-6 mb-8">
            {/* Top Row - Financials (5 Columns) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                {topRowKpis.map((kpi, index) => (
                    <KpiCard key={`top-${index}`} {...kpi} lang={lang} />
                ))}
            </div>

            {/* Bottom Row - Activity (6 Columns) */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
                {bottomRowKpis.map((kpi, index) => (
                    <KpiCard key={`bottom-${index}`} {...kpi} lang={lang} />
                ))}
            </div>
        </div>
    );
};

export default KpiCards;

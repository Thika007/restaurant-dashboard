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
                        {subValue}
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

const DetailedKpiCard = ({ title, metrics, icon: Icon, color, lang }) => (
    <div className="glass-card p-4 sm:p-6 transition-all hover:shadow-md overflow-hidden flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
            {Icon && <Icon className="w-5 h-5 text-slate-700" />}
        </div>
        <div className="space-y-3">
            {metrics.map((m, i) => (
                <div key={i} className="flex justify-between items-center text-xs sm:text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 font-medium">{m.label}</span>
                    <span className="text-slate-900 font-bold">{m.value}</span>
                </div>
            ))}
        </div>
    </div>
);

const KpiCards = ({ isHistory, t, stats, lang, orderTypeLabels }) => {
    const billsSuffix = lang === 'si' ? 'බිල්පත්' : 'Bills';
    const ratioSuffix = lang === 'si' ? 'අනුපාතය' : 'RATIO';

    const getRatio = (amount) => {
        if (!stats?.net_revenue || !amount) return "";
        const ratio = (amount / stats.net_revenue) * 100;
        return ` | ${ratio.toFixed(2)}% ${ratioSuffix}`;
    };

    // Large Top Row Metrics
    const topRowKpis = [
        {
            title: isHistory ? t.totalRevenue : t.todayRevenue,
            value: stats?.total_revenue !== undefined ? stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.bill_count !== undefined ? `${stats.bill_count} ${billsSuffix}` : undefined,
            icon: TrendingUp,
            color: 'bg-dashboard-blue'
        },
        {
            title: isHistory ? t.totalNetRevenue : t.todayNetRevenue,
            value: stats?.net_revenue !== undefined ? stats.net_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.bill_count !== undefined ? `${stats.bill_count} ${billsSuffix}` : undefined,
            icon: Wallet,
            color: 'bg-dashboard-green'
        },
        {
            title: t.serviceCharge,
            value: stats?.total_service_charge !== undefined ? stats.total_service_charge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.service_charge_count !== undefined ? `${stats.service_charge_count} ${billsSuffix}` : undefined,
            icon: Wallet,
            color: 'bg-blue-600'
        },
        {
            title: t.totalDiscount,
            value: stats?.total_discount !== undefined ? stats.total_discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.discount_count !== undefined ? `${stats.discount_count} ${billsSuffix}` : undefined,
            icon: Tag,
            color: 'bg-pink-500'
        },
        {
            title: t.refundsAmount,
            value: stats?.refund_amount !== undefined ? stats.refund_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.refund_items_count !== undefined ? `${stats.refund_items_count} ${lang === 'si' ? 'අයිතම' : 'Items'}${getRatio(stats.refund_amount)}` : undefined,
            icon: RefreshCcw,
            color: 'bg-orange-500'
        }
    ];

    // Middle Row Metrics (4 Columns)
    const middleRowKpis = [
        {
            title: isHistory ? t.totalBills : t.todayBills,
            value: stats?.bill_count !== undefined ? stats.bill_count.toLocaleString() : '0',
            icon: CreditCard,
            color: 'bg-indigo-500'
        },
        {
            title: isHistory ? t.totalCancelled : t.todayCancelled,
            value: stats?.cancelled_amount !== undefined ? stats.cancelled_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.cancelled_count !== undefined ? `${stats.cancelled_count} ${billsSuffix}${getRatio(stats.cancelled_amount)}` : undefined,
            icon: CircleAlert,
            color: 'bg-dashboard-red'
        },
        {
            title: t.numberOfGuests,
            value: stats?.guest_count !== undefined ? stats.guest_count.toLocaleString() : '0',
            subValue: stats?.net_revenue && stats?.guest_count ?
                `A.P.P: ${(stats.net_revenue / stats.guest_count).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined,
            icon: Users,
            color: 'bg-cyan-500'
        },
        {
            title: t.voidAmount,
            value: stats?.void_amount !== undefined ? stats.void_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.void_items_count !== undefined ? `${stats.void_items_count} ${lang === 'si' ? 'අයිතම' : 'Items'}${getRatio(stats.void_amount)}` : undefined,
            icon: Trash2,
            color: 'bg-rose-500'
        }
    ];

    // Bottom Row Metrics (4 Columns)
    const bottomRowKpis = [
        {
            title: t.complimentary,
            value: stats?.complimentary_amount !== undefined ? stats.complimentary_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.complimentary_count !== undefined ? `${stats.complimentary_count} ${billsSuffix}${getRatio(stats.complimentary_amount)}` : undefined,
            icon: Gift,
            color: 'bg-purple-500'
        },
        {
            title: t.staff,
            value: stats?.staff_amount !== undefined ? stats.staff_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.staff_count !== undefined ? `${stats.staff_count} ${billsSuffix}${getRatio(stats.staff_amount)}` : undefined,
            icon: UserCheck,
            color: 'bg-amber-500'
        },
        {
            title: t.wasteAmount,
            value: stats?.waste_amount !== undefined ? stats.waste_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.waste_items_count !== undefined ? `${stats.waste_items_count} ${lang === 'si' ? 'අයිතම' : 'Items'}${getRatio(stats.waste_amount)}` : undefined,
            icon: Trash2,
            color: 'bg-orange-600'
        },
        {
            title: t.totalTax,
            value: stats?.total_tax !== undefined ? stats.total_tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.tax_count !== undefined ? `${stats.tax_count} ${billsSuffix}` : undefined,
            icon: Wallet,
            color: 'bg-blue-400'
        }
    ];

    // Credit Row Metrics (3 Columns)
    const creditRowKpis = [
        {
            title: t.creditAmount,
            value: stats?.credit_amount !== undefined ? stats.credit_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.credit_count !== undefined ? `${stats.credit_count} ${billsSuffix}${getRatio(stats.credit_amount)}` : undefined,
            icon: CreditCard,
            color: 'bg-indigo-600'
        },
        {
            title: t.creditPaidAmount,
            value: stats?.credit_pay_amount !== undefined ? stats.credit_pay_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00',
            subValue: stats?.credit_pay_count !== undefined ? `${stats.credit_pay_count} ${billsSuffix}` : undefined,
            icon: RefreshCcw,
            color: 'bg-teal-500'
        },
        {
            title: t.creditBalance,
            value: (stats?.credit_amount !== undefined && stats?.credit_pay_amount !== undefined)
                ? (stats.credit_amount - stats.credit_pay_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00',
            icon: TrendingUp,
            color: 'bg-orange-400'
        }
    ];

    // Order Type Detailed Row (4 Types, 2x2 layout)
    const orderTypes = [
        {
            title: orderTypeLabels?.table || 'Table Order',
            amount: stats?.table_order_amount || 0,
            count: stats?.table_order_count || 0,
            guests: stats?.table_order_guests || 0,
            icon: Users
        },
        {
            title: orderTypeLabels?.takeaway || 'Takeaway',
            amount: stats?.takeaway_order_amount || 0,
            count: stats?.takeaway_order_count || 0,
            guests: stats?.takeaway_order_guests || 0,
            icon: UserCheck
        },
        {
            title: orderTypeLabels?.delivery || 'Delivery',
            amount: stats?.delivery_order_amount || 0,
            count: stats?.delivery_order_count || 0,
            guests: stats?.delivery_order_guests || 0,
            icon: TrendingUp
        },
        {
            title: orderTypeLabels?.quick || 'Quick Service',
            amount: stats?.quick_service_order_amount || 0,
            count: stats?.quick_service_order_count || 0,
            guests: stats?.quick_service_order_guests || 0,
            icon: CreditCard
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

            {/* Middle Row - Activity (4 Columns) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {middleRowKpis.map((kpi, index) => (
                    <KpiCard key={`middle-${index}`} {...kpi} lang={lang} />
                ))}
            </div>

            {/* Bottom Row - More Details (4 Columns) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {bottomRowKpis.map((kpi, index) => (
                    <KpiCard key={`bottom-${index}`} {...kpi} lang={lang} />
                ))}
            </div>

            {/* Credit Row - Specific tracking (3 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {creditRowKpis.map((kpi, index) => (
                    <KpiCard key={`credit-${index}`} {...kpi} lang={lang} />
                ))}
            </div>

            {/* Order Type Detailed Row - 2 Rows of 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {orderTypes.map((ot, idx) => (
                    <DetailedKpiCard
                        key={idx}
                        title={ot.title}
                        icon={ot.icon}
                        lang={lang}
                        metrics={[
                            { label: t.txnAmount, value: ot.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
                            { label: t.txnCount, value: ot.count.toLocaleString() },
                            { label: t.guestTotal, value: ot.guests.toLocaleString() },
                            { label: t.app, value: ot.guests > 0 ? (ot.amount / ot.guests).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }
                        ]}
                    />
                ))}
            </div>
        </div>
    );
};

export default KpiCards;

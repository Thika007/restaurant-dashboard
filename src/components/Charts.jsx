import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
    PieChart, Pie,
    Cell as PieCell,
    Legend
} from 'recharts';

const salesData = [
    { time: '00:00', sales: 400 },
    { time: '04:00', sales: 300 },
    { time: '08:00', sales: 900 },
    { time: '12:00', sales: 2400 },
    { time: '16:00', sales: 1800 },
    { time: '20:00', sales: 2800 },
    { time: '23:59', sales: 1500 },
];

const topItemsData = [
    { name: 'Kottu Roti', qty: 245, total: 122500 },
    { name: 'Cheese Burger', qty: 156, total: 93600 },
    { name: 'Chicken Fried Rice', qty: 189, total: 85050 },
];

const orderTypeData = [
    { name: 'Dine-in', value: 320, color: '#1e3a8a' },
    { name: 'Delivery', value: 138, color: '#10b981' },
];

const Charts = ({ isHistory, t, chartsData }) => {
    const { trend, topItems, orderTypes, paymentMethods } = chartsData || { trend: [], topItems: [], orderTypes: [], paymentMethods: [] };

    // Set colors for consistent assignment
    const colorPalette = ['#1e3a8a', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

    // Map order types to the format expected by PieChart
    const orderTypeChartData = orderTypes.map((item, index) => ({
        name: item.type,
        value: item.count,
        color: colorPalette[index % colorPalette.length]
    }));

    // Map payment methods to format expected by DonutChart
    const paymentMethodChartData = paymentMethods.map((method, index) => ({
        name: method.name,
        value: method.value,
        color: colorPalette[index % colorPalette.length]
    }));

    const salesTrendData = trend.map(item => ({
        time: isHistory ? item.date : `${item.hour}:00`,
        sales: item.revenue
    }));

    const displaySalesData = salesTrendData;

    const salesTitle = isHistory ? t.salesWeekly : t.sales24h;
    const dataKey = isHistory ? 'time' : 'time'; // Still using time/day for XAxis
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Sales Trend */}
            <div className="glass-card p-4 sm:p-6 min-h-[350px] sm:min-h-[400px]">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">{salesTitle}</h3>
                <div className="h-[250px] sm:h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displaySalesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#1e3a8a"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#1e3a8a' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top 3 Selling Items */}
            <div className="glass-card p-4 sm:p-6 min-h-[350px] sm:min-h-[400px]">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">{t.topItems}</h3>
                <div className="h-[250px] sm:h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topItems} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                                {topItems.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : index === 1 ? '#10b981' : '#6366f1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Order Type Pie Chart */}
            <div className="glass-card p-4 sm:p-6 min-h-[300px] sm:min-h-[350px]">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">{isHistory ? t.orderTypeHistory : t.orderTypeToday}</h3>
                <div className="h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={orderTypeChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {orderTypeChartData.map((entry, index) => (
                                    <PieCell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Payment Method Donut Chart */}
            <div className="glass-card p-4 sm:p-6 min-h-[300px] sm:min-h-[350px]">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">{isHistory ? t.paymentHistory : t.paymentToday}</h3>
                <div className="h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={paymentMethodChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {paymentMethodChartData.map((entry, index) => (
                                    <PieCell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Charts;

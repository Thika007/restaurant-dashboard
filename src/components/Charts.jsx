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

const paymentMethodData = [
    { name: 'Cash', value: 45, color: '#1e3a8a' },
    { name: 'Card', value: 40, color: '#10b981' },
    { name: 'Credit', value: 15, color: '#f59e0b' },
];

const Charts = ({ isHistory }) => {
    const displaySalesData = isHistory ? [
        { time: 'Mon', sales: 12000 },
        { time: 'Tue', sales: 15000 },
        { time: 'Wed', sales: 11000 },
        { time: 'Thu', sales: 18000 },
        { time: 'Fri', sales: 24000 },
        { time: 'Sat', sales: 30000 },
        { time: 'Sun', sales: 28000 },
    ] : salesData;

    const salesTitle = isHistory ? 'Weekly Sales Trend' : '24-Hour Sales Trend';
    const dataKey = isHistory ? 'time' : 'time'; // Still using time/day for XAxis
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend */}
            <div className="glass-card p-6 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">{salesTitle}</h3>
                <div className="h-[300px]">
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
            <div className="glass-card p-6 min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Top 3 Selling Items</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topItemsData} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="qty" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                                {topItemsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : index === 1 ? '#10b981' : '#6366f1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Order Type Pie Chart */}
            <div className="glass-card p-6 min-h-[350px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">{isHistory ? 'Historical Order Types' : 'Today Order Type'}</h3>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={orderTypeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {orderTypeData.map((entry, index) => (
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
            <div className="glass-card p-6 min-h-[350px]">
                <h3 className="text-lg font-bold text-slate-800 mb-6">{isHistory ? 'Historical Payment Methods' : 'Today Payment Method'}</h3>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={paymentMethodData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {paymentMethodData.map((entry, index) => (
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

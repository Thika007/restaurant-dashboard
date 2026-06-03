import React from 'react';

const HistorySection = ({ t, collections = [] }) => {
    const isSinhala = t.total === 'එකතුව';
    
    const getPaymentTypeName = (typeCode, defaultName) => {
        if (typeCode === 'CC') {
            return defaultName;
        }
        
        const mappings = {
            en: {
                'MM': 'Cash',
                'CS': 'Credit',
                'CP': 'Credit Paid',
                'CO': 'Complementary',
                'ST': 'Staff',
                'WA': 'Wastage',
                'VV': 'Void',
                'R': 'Refund',
                'RR': 'Refund'
            },
            si: {
                'MM': 'මුදල් (Cash)',
                'CS': 'ණය (Credit)',
                'CP': 'ණය පියවීම් (Credit Paid)',
                'CO': 'හිමිකරුගේ (Complementary)',
                'ST': 'කාර්ය මණ්ඩලය (Staff)',
                'WA': 'අපතේ යාම් (Wastage)',
                'VV': 'අවලංගු කිරීම් (Void)',
                'R': 'මුදල් ආපසු ගෙවීම් (Refund)',
                'RR': 'මුදල් ආපසු ගෙවීම් (Refund)'
            }
        };
        
        const langKey = isSinhala ? 'si' : 'en';
        return mappings[langKey][typeCode] || defaultName;
    };

    const totalCount = collections.reduce((sum, item) => sum + (item.billCount || 0), 0);
    const totalAmount = collections.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">{t.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t.subtitle}</p>
                </div>

                <div className="overflow-x-auto">
                    <div className="grid-table min-w-[600px]">
                        {/* Table Header */}
                        <div className="grid-table-header grid-table-header-static cols-collections-report rounded-t-none">
                            <div className="grid-table-header-cell">{t.colMethod}</div>
                            <div className="grid-table-header-cell text-right">{t.colCount}</div>
                            <div className="grid-table-header-cell text-right">{t.colAmount}</div>
                        </div>

                        {/* Table Body */}
                        <div className="grid-table-body">
                            {collections.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-400">
                                    No data available
                                </div>
                            ) : (
                                collections.map((col, index) => (
                                    <div key={col.typeCode + '_' + col.keyCode + '_' + index} className="grid-table-row cols-collections-report">
                                        <div className="grid-table-cell font-semibold text-slate-800">
                                            {getPaymentTypeName(col.typeCode, col.name)}
                                        </div>
                                        <div className="grid-table-cell text-right font-medium text-slate-600">
                                            {col.billCount.toLocaleString()}
                                        </div>
                                        <div className="grid-table-cell text-right font-bold text-slate-900">
                                            {col.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Table Footer / Total Row */}
                        {collections.length > 0 && (
                            <div className="grid-table-footer cols-collections-report bg-slate-50 font-black text-slate-800">
                                <div className="grid-table-cell uppercase tracking-wider font-extrabold">{t.total}</div>
                                <div className="grid-table-cell text-right font-bold">{totalCount.toLocaleString()}</div>
                                <div className="grid-table-cell text-right font-black text-dashboard-blue">
                                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistorySection;

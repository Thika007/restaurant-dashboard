import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import Charts from './components/Charts';
import HistorySection from './components/HistorySection';
import LoginPage from './pages/LoginPage';
import { LayoutDashboard, History, Settings, Calendar, Download } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { translations } from './constants/translations';
import {
  fetchTodayStats, fetchSalesTrend, fetchTopItems, fetchOrderTypes, fetchPaymentMethods,
  fetchHistory, fetchHistoryStats, fetchHistoryTrend, fetchHistoryTopItems, fetchHistoryOrderTypes, fetchHistoryPaymentMethods,
  getAppConfig
} from './services/api';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const Dashboard = ({ lang, setLang }) => {
  const [activeTab, setActiveTab] = useState('real-time');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [refreshInterval, setRefreshInterval] = useState(10000);

  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [historyStats, setHistoryStats] = useState(null);
  const [historyChartsData, setHistoryChartsData] = useState({ trend: [], topItems: [], orderTypes: [], paymentMethods: [] });
  const [chartsData, setChartsData] = useState({ trend: [], topItems: [], orderTypes: [], paymentMethods: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuickSelect, setActiveQuickSelect] = useState(null);
  const [activeReportType, setActiveReportType] = useState('bill');
  const [billReportFilters, setBillReportFilters] = useState({
    txnType: 'all',
    orderType: 'all',
    discountType: 'all',
    sort: 'billNo'
  });
  const [itemReportFilters, setItemReportFilters] = useState({
    mainType: 'all',
    descSort: 'all',
    qtySort: 'all',
    amtSort: 'all',
    special: 'all',
    remark: 'all'
  });
  const t = translations[lang];

  const handleQuickSelect = (days, label) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setActiveQuickSelect(label);
  };

  // Load initial config
  React.useEffect(() => {
    getAppConfig().then(cfg => {
      if (cfg.refreshInterval) {
        setRefreshInterval(cfg.refreshInterval);
      }
    });
  }, []);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [statsData, trendData, topItemsData, orderTypesData, paymentMethodsData] = await Promise.all([
        fetchTodayStats(),
        fetchSalesTrend(),
        fetchTopItems(),
        fetchOrderTypes(),
        fetchPaymentMethods()
      ]);
      setStats(statsData);
      setChartsData({
        trend: trendData,
        topItems: topItemsData,
        orderTypes: orderTypesData,
        paymentMethods: paymentMethodsData
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Auto-refresh logic for Real-time tab
  React.useEffect(() => {
    if (activeTab === 'real-time') {
      loadDashboardData();
      const interval = setInterval(() => {
        loadDashboardData(true);
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [activeTab, refreshInterval]);

  React.useEffect(() => {
    const loadHistoryData = async () => {
      try {
        const [historyData, statsData, trendData, topItemsData, orderTypesData, paymentMethodsData] = await Promise.all([
          fetchHistory(startDate, endDate),
          fetchHistoryStats(startDate, endDate),
          fetchHistoryTrend(startDate, endDate),
          fetchHistoryTopItems(startDate, endDate),
          fetchHistoryOrderTypes(startDate, endDate),
          fetchHistoryPaymentMethods(startDate, endDate)
        ]);
        setHistory(historyData);
        setHistoryStats(statsData);
        setHistoryChartsData({
          trend: trendData,
          topItems: topItemsData,
          orderTypes: orderTypesData,
          paymentMethods: paymentMethodsData
        });
      } catch (error) {
        console.error("Failed to load history data:", error);
      }
    };

    if (activeTab === 'history' || activeTab === 'reports') {
      loadHistoryData();
    }
  }, [activeTab, startDate, endDate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        lang={lang}
        setLang={setLang}
        t={t.navbar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tTabs={t.tabs}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {activeTab === 'real-time' ? t.tabs.todayTitle : activeTab === 'history' ? t.tabs.historyTitle : t.tabs.reportsTitle}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeTab === 'real-time' ? t.tabs.todaySub : activeTab === 'history' ? t.tabs.historySub : t.tabs.reportsSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {(activeTab === 'history' || activeTab === 'reports') && (
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 px-3 border-r border-slate-100 flex-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setActiveQuickSelect(null);
                      }}
                      className="border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 cursor-pointer w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3 px-3 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'si' ? 'දක්වා' : 'To'}</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setActiveQuickSelect(null);
                      }}
                      className="border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 cursor-pointer w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                  <button
                    onClick={() => handleQuickSelect(7, 'week')}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all shadow-sm ${activeQuickSelect === 'week'
                      ? 'bg-dashboard-blue text-white border-dashboard-blue shadow-blue-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-dashboard-blue hover:text-dashboard-blue'
                      }`}
                  >
                    {t.history.quickWeek}
                  </button>
                  <button
                    onClick={() => handleQuickSelect(30, 'month')}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all shadow-sm ${activeQuickSelect === 'month'
                      ? 'bg-dashboard-blue text-white border-dashboard-blue shadow-blue-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-dashboard-blue hover:text-dashboard-blue'
                      }`}
                  >
                    {t.history.quickMonth}
                  </button>
                  <button
                    onClick={() => handleQuickSelect(365, 'year')}
                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl border transition-all shadow-sm ${activeQuickSelect === 'year'
                      ? 'bg-dashboard-blue text-white border-dashboard-blue shadow-blue-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-dashboard-blue hover:text-dashboard-blue'
                      }`}
                  >
                    {t.history.quickYear}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(activeTab === 'real-time' || activeTab === 'history') && (
            <>
              <KpiCards isHistory={activeTab === 'history'} t={t.kpi} stats={activeTab === 'history' ? historyStats : stats} lang={lang} />
              <Charts isHistory={activeTab === 'history'} t={t.charts} chartsData={activeTab === 'history' ? historyChartsData : chartsData} />
            </>
          )}

          {activeTab === 'reports' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Report Type Selectors */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 whitespace-nowrap">
                {Object.entries(t.tabs.reportTypes).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveReportType(key)}
                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all shadow-sm flex-shrink-0 ${activeReportType === key
                      ? 'bg-dashboard-blue text-white border-dashboard-blue shadow-blue-100'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-dashboard-blue hover:text-dashboard-blue'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Filter and Action Section */}
              <div className="glass-card p-6 mb-8 border border-slate-200 bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-dashboard-red/10 text-dashboard-red hover:bg-dashboard-red hover:text-white rounded-xl font-bold transition-all border border-dashboard-red/20 shadow-sm text-xs uppercase tracking-wider">
                    <Download className="w-4 h-4" />
                    PDF Export
                  </button>
                </div>

                {activeReportType === 'bill' && (
                  <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Filter Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Transaction Type Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{t.tabs.billReport.filters.txnType.label}</label>
                        <select
                          value={billReportFilters.txnType}
                          onChange={(e) => setBillReportFilters({ ...billReportFilters, txnType: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue"
                        >
                          {Object.entries(t.tabs.billReport.filters.txnType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Order Type Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{t.tabs.billReport.filters.orderType.label}</label>
                        <select
                          value={billReportFilters.orderType}
                          onChange={(e) => setBillReportFilters({ ...billReportFilters, orderType: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue"
                        >
                          {Object.entries(t.tabs.billReport.filters.orderType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Discount Type Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{t.tabs.billReport.filters.discountType.label}</label>
                        <select
                          value={billReportFilters.discountType}
                          onChange={(e) => setBillReportFilters({ ...billReportFilters, discountType: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue"
                        >
                          {Object.entries(t.tabs.billReport.filters.discountType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sort Filter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{t.tabs.billReport.filters.sort.label}</label>
                        <select
                          value={billReportFilters.sort}
                          onChange={(e) => setBillReportFilters({ ...billReportFilters, sort: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue"
                        >
                          {Object.entries(t.tabs.billReport.filters.sort).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeReportType === 'item' && (
                  <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Filter Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                      {/* Main Type selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.mainType.label}</label>
                        <select
                          value={itemReportFilters.mainType}
                          onChange={(e) => setItemReportFilters({ ...itemReportFilters, mainType: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue py-2"
                        >
                          {Object.entries(t.tabs.itemReport.filters.mainType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Description sort */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.descSort.label}</label>
                        <select
                          value={itemReportFilters.descSort}
                          onChange={(e) => setItemReportFilters({ ...itemReportFilters, descSort: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue py-2"
                        >
                          {Object.entries(t.tabs.itemReport.filters.descSort).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Qty sort */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.qtySort.label}</label>
                        <select
                          value={itemReportFilters.qtySort}
                          onChange={(e) => setItemReportFilters({ ...itemReportFilters, qtySort: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue py-2"
                        >
                          {Object.entries(t.tabs.itemReport.filters.qtySort).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Amt sort */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.amtSort.label}</label>
                        <select
                          value={itemReportFilters.amtSort}
                          onChange={(e) => setItemReportFilters({ ...itemReportFilters, amtSort: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue py-2"
                        >
                          {Object.entries(t.tabs.itemReport.filters.amtSort).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Special filter */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.special.label}</label>
                        <select
                          value={itemReportFilters.special}
                          onChange={(e) => setItemReportFilters({ ...itemReportFilters, special: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue py-2"
                        >
                          {Object.entries(t.tabs.itemReport.filters.special).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>

                      {/* Remark filter */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.remark.label}</label>
                        <select
                          value={itemReportFilters.remark}
                          onChange={(e) => setItemReportFilters({ ...itemReportFilters, remark: e.target.value })}
                          className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue py-2"
                        >
                          {Object.entries(t.tabs.itemReport.filters.remark).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Table Area */}
              <div className="glass-card overflow-hidden bg-white border border-slate-200 shadow-sm">
                {activeReportType === 'bill' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          {Object.values(t.tabs.billReport.headers).map((header, idx) => (
                            <th key={idx} className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td colSpan={Object.keys(t.tabs.billReport.headers).length} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Calendar className="w-8 h-8 mb-2 opacity-20" />
                              <p className="text-sm font-medium">No report data to display</p>
                              <p className="text-xs">Adjust filters and generate to view results</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : activeReportType === 'item' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          {Object.values(t.tabs.itemReport.headers).map((header, idx) => (
                            <th key={idx} className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td colSpan={Object.keys(t.tabs.itemReport.headers).length} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Calendar className="w-8 h-8 mb-2 opacity-20" />
                              <p className="text-sm font-medium">No item report data to display</p>
                              <p className="text-xs">Adjust filters and generate to view results</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-400 mb-1">Coming Soon</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Specific layout for <strong>{t.tabs.reportTypes[activeReportType]}</strong> is under development.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 sm:mt-12 py-6 sm:py-8 bg-white border-t border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs sm:text-sm">
          <p className="text-center sm:text-left">{t.footer.rights}</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#" className="hover:text-dashboard-blue">{t.footer.privacy}</a>
            <a href="#" className="hover:text-dashboard-blue">{t.footer.terms}</a>
            <a href="#" className="hover:text-dashboard-blue flex items-center gap-1 font-medium text-[10px] sm:text-xs uppercase tracking-widest">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t.footer.settings}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  const [lang, setLang] = useState('en');

  return (
    <Routes>
      <Route path="/login" element={<LoginPage lang={lang} setLang={setLang} />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard lang={lang} setLang={setLang} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

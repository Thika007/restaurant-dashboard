import React, { useState } from 'react';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import Charts from './components/Charts';
import HistorySection from './components/HistorySection';
import { LayoutDashboard, History, Settings, Calendar, Download, Languages } from 'lucide-react';
import { format } from 'date-fns';
import { translations } from './constants/translations';
import { fetchTodayStats, fetchSalesTrend, fetchTopItems, fetchOrderTypes, fetchHistory, fetchHistoryStats, fetchHistoryTrend, fetchHistoryTopItems, fetchHistoryOrderTypes } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('real-time');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [lang, setLang] = useState('en');

  // Dashboard Data State
  const [stats, setStats] = useState(null);
  const [historyStats, setHistoryStats] = useState(null);
  const [historyChartsData, setHistoryChartsData] = useState({ trend: [], topItems: [], orderTypes: [] });
  const [chartsData, setChartsData] = useState({ trend: [], topItems: [], orderTypes: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, trendData, topItemsData, orderTypesData] = await Promise.all([
          fetchTodayStats(),
          fetchSalesTrend(),
          fetchTopItems(),
          fetchOrderTypes()
        ]);
        setStats(statsData);
        setChartsData({
          trend: trendData,
          topItems: topItemsData,
          orderTypes: orderTypesData
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'real-time') {
      loadDashboardData();
    }
  }, [activeTab]);

  React.useEffect(() => {
    const loadHistoryData = async () => {
      try {
        const [historyData, statsData, trendData, topItemsData, orderTypesData] = await Promise.all([
          fetchHistory(startDate, endDate),
          fetchHistoryStats(startDate, endDate),
          fetchHistoryTrend(startDate, endDate),
          fetchHistoryTopItems(startDate, endDate),
          fetchHistoryOrderTypes(startDate, endDate)
        ]);
        setHistory(historyData);
        setHistoryStats(statsData);
        setHistoryChartsData({
          trend: trendData,
          topItems: topItemsData,
          orderTypes: orderTypesData
        });
      } catch (error) {
        console.error("Failed to load history data:", error);
      }
    };

    if (activeTab === 'history') {
      loadHistoryData();
    }
  }, [activeTab, startDate, endDate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar lang={lang} setLang={setLang} t={t.navbar} />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Header Section with Tab Switcher and Date Pickers for History */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {activeTab === 'real-time' ? t.tabs.todayTitle : t.tabs.historyTitle}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeTab === 'real-time'
                ? t.tabs.todaySub
                : t.tabs.historySub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab('real-time')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'real-time'
                  ? 'bg-dashboard-blue text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t.tabs.realTime}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
                  ? 'bg-dashboard-blue text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <History className="w-4 h-4" />
                {t.tabs.history}
              </button>
            </div>

            {/* Date Pickers - Only visible in History Tab */}
            {activeTab === 'history' && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 px-2 border-r border-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    {lang === 'si' ? 'දක්වා' : 'To'}
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-none bg-transparent p-0 text-sm font-semibold focus:ring-0 cursor-pointer"
                  />
                </div>
                <button className="bg-slate-900 text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-1">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content - Cards and Charts (Always Visible) */}
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <KpiCards isHistory={activeTab === 'history'} t={t.kpi} stats={activeTab === 'history' ? historyStats : stats} />
          <Charts isHistory={activeTab === 'history'} t={t.charts} chartsData={activeTab === 'history' ? historyChartsData : chartsData} />

          {/* Only show History Table in History Tab */}
          {activeTab === 'history' && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                {t.history.title}
                <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {t.history.subtitle}
                </span>
              </h3>
              <HistorySection hideFilters={true} t={t.history} data={history} />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 py-8 bg-white border-t border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center text-slate-500 text-sm">
          <p>{t.footer.rights}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-dashboard-blue">{t.footer.privacy}</a>
            <a href="#" className="hover:text-dashboard-blue">{t.footer.terms}</a>
            <a href="#" className="hover:text-dashboard-blue flex items-center gap-1 font-medium text-xs uppercase tracking-widest">
              <Settings className="w-4 h-4" />
              {t.footer.settings}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

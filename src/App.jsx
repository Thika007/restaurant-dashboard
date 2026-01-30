import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import Charts from './components/Charts';
import HistorySection from './components/HistorySection';
import LoginPage from './pages/LoginPage';
import { Calendar, FileText, Filter, LayoutDashboard, LogOut, Search, Settings, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, subDays } from 'date-fns';
import { translations } from './constants/translations';
import {
  fetchTodayStats, fetchSalesTrend, fetchTopItems, fetchOrderTypes, fetchPaymentMethods,
  fetchHistory, fetchHistoryStats, fetchHistoryTrend, fetchHistoryTopItems, fetchHistoryOrderTypes, fetchHistoryPaymentMethods,
  getAppConfig, fetchBillReport, fetchItemReport
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
  const [billReportData, setBillReportData] = useState([]);
  const [billReportFilters, setBillReportFilters] = useState({
    txnType: ['all'],
    orderType: ['all'],
    sort: 'billNo'
  });
  const [itemReportData, setItemReportData] = useState([]);
  const [itemReportFilters, setItemReportFilters] = useState({
    mainType: ['all'],
    descSort: 'all',
    qtySort: 'all',
    amtSort: 'all',
    remark: ['all']
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

    if (activeTab === 'history' || (activeTab === 'reports' && activeReportType !== 'bill')) {
      loadHistoryData();
    }
  }, [activeTab, startDate, endDate]);

  const loadBillReportData = async () => {
    try {
      setLoading(true);
      const data = await fetchBillReport(startDate, endDate, billReportFilters);
      setBillReportData(data);
    } catch (error) {
      console.error("Failed to load bill report:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'reports' && activeReportType === 'bill') {
      loadBillReportData();
    }
  }, [activeTab, activeReportType, startDate, endDate, billReportFilters]);

  const loadItemReportData = async () => {
    try {
      setLoading(true);
      const data = await fetchItemReport(startDate, endDate, itemReportFilters);
      setItemReportData(data);
    } catch (error) {
      console.error("Failed to load item report:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'reports' && activeReportType === 'item') {
      loadItemReportData();
    }
  }, [activeTab, activeReportType, startDate, endDate, itemReportFilters]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currencySymbol = "LKR";

    if (activeReportType === 'bill') {
      // We use English labels for PDF generation to ensure character compatibility
      // as jsPDF requires custom font embedding for Sinhala/Unicode support.
      const pdfT = translations['en'].tabs.billReport;

      // Header
      doc.setFontSize(18);
      doc.text(pdfT.pdfTitle, 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${pdfT.pdfDateRange}: ${startDate} - ${endDate}`, 14, 28);

      // Filter Summary
      let yOffset = 40;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(pdfT.pdfFilterSummary, 14, yOffset);
      doc.setFontSize(10);
      doc.setTextColor(100);
      yOffset += 7;
      doc.text(`${pdfT.filters.txnType.label}: ${billReportFilters.txnType.map(k => pdfT.filters.txnType[k] || k).join(', ')}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.filters.orderType.label}: ${billReportFilters.orderType.map(k => pdfT.filters.orderType[k] || k).join(', ')}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.filters.sort.label}: ${pdfT.filters.sort[billReportFilters.sort] || billReportFilters.sort}`, 14, yOffset);

      // Table
      const tableColumn = Object.values(pdfT.headers);
      const tableRows = billReportData.map(row => [
        row.Bill_Id,
        parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        row.Discount_Amt > 0 ? parseFloat(row.Discount_Amt).toLocaleString(undefined, { minimumFractionDigits: 2 }) : 'No Discount',
        parseFloat(row.TAX || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        parseFloat(row.Service_Charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        parseFloat(row.Total_Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        row.Transaction_Type,
        row.Order_Type,
        row.Remark || '-'
      ]);

      autoTable(doc, {
        startY: yOffset + 15,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [80, 80, 80],
          fontStyle: 'bold',
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Bill_Id
          1: { cellWidth: 20, halign: 'right' }, // Amount
          2: { cellWidth: 20, halign: 'right' }, // Discount_Amt
          3: { cellWidth: 15, halign: 'right' }, // TAX
          4: { cellWidth: 20, halign: 'right' }, // Service_Charge
          5: { cellWidth: 20, halign: 'right' }, // Total_Amount
          6: { cellWidth: 20 }, // Transaction_Type
          7: { cellWidth: 20 }, // Order_Type
          8: { cellWidth: 20 }  // Remark
        },
        didDrawPage: function (data) {
          // Footer
          let pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text('Page ' + data.pageNumber + ' of ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // Calculate Totals
      const totalAmount = billReportData.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0);
      const totalDiscount = billReportData.reduce((sum, row) => sum + parseFloat(row.Discount_Amt || 0), 0);
      const totalTax = billReportData.reduce((sum, row) => sum + parseFloat(row.TAX || 0), 0);
      const totalServiceCharge = billReportData.reduce((sum, row) => sum + parseFloat(row.Service_Charge || 0), 0);
      const totalFinalAmount = billReportData.reduce((sum, row) => sum + parseFloat(row.Total_Amount || 0), 0);

      // Add totals to the end of the document
      yOffset = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`${pdfT.pdfTotals.totalAmount}: ${currencySymbol} ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.pdfTotals.totalDiscount}: ${currencySymbol} ${totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.pdfTotals.totalTax}: ${currencySymbol} ${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.pdfTotals.totalServiceCharge}: ${currencySymbol} ${totalServiceCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, yOffset);
      yOffset += 7;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${pdfT.pdfTotals.grandTotal}: ${currencySymbol} ${totalFinalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, yOffset);

      doc.save(`Bill_Report_${startDate}_to_${endDate}.pdf`);
    } else if (activeReportType === 'item') {
      const pdfT = translations['en'].tabs.itemReport;

      // Header
      doc.setFontSize(18);
      doc.text("Item Report", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Date Range: ${startDate} - ${endDate}`, 14, 28);

      // Table
      const tableColumn = Object.values(pdfT.headers);
      const tableRows = itemReportData.map(row => [
        row.Bill_Id,
        row.KOTNo || '-',
        row.Description,
        row.Qty,
        parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        row.Reason || '-'
      ]);

      autoTable(doc, {
        startY: 40,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [80, 80, 80],
          fontStyle: 'bold',
          fontSize: 9
        },
        didDrawPage: function (data) {
          let pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text('Page ' + data.pageNumber + ' of ' + pageCount, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // Calculate Totals
      const totalAmount = itemReportData.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0);
      const totalQty = itemReportData.reduce((sum, row) => sum + parseFloat(row.Qty || 0), 0);

      let yOffset = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Total Quantity: ${totalQty}`, 14, yOffset);
      yOffset += 7;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total: ${currencySymbol} ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, yOffset);

      doc.save(`Item_Report_${startDate}_to_${endDate}.pdf`);
    }
  };

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
                  {((activeReportType === 'bill' && billReportData.length > 0) || (activeReportType === 'item' && itemReportData.length > 0)) && (
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-dashboard-red/10 text-dashboard-red hover:bg-dashboard-red hover:text-white rounded-xl font-bold transition-all border border-dashboard-red/20 shadow-sm text-xs uppercase tracking-wider"
                    >
                      <FileText className="w-4 h-4" />
                      {lang === 'si' ? 'PDF අපනයනය' : 'PDF Export'}
                    </button>
                  )}
                </div>

                {activeReportType === 'bill' && (
                  <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Filter Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Transaction Type Filter */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.billReport.filters.txnType.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {Object.entries(t.tabs.billReport.filters.txnType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <label key={k} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={billReportFilters.txnType.includes(k)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...billReportFilters.txnType];
                                  if (k === 'all') {
                                    newValues = ['all'];
                                  } else {
                                    newValues = newValues.filter(v => v !== 'all');
                                    if (isChecked) {
                                      newValues.push(k);
                                    } else {
                                      newValues = newValues.filter(v => v !== k);
                                    }
                                    if (newValues.length === 0) newValues = ['all'];
                                  }
                                  setBillReportFilters({ ...billReportFilters, txnType: newValues });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{v}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Order Type Filter */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.billReport.filters.orderType.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {Object.entries(t.tabs.billReport.filters.orderType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <label key={k} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={billReportFilters.orderType.includes(k)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...billReportFilters.orderType];
                                  if (k === 'all') {
                                    newValues = ['all'];
                                  } else {
                                    newValues = newValues.filter(v => v !== 'all');
                                    if (isChecked) {
                                      newValues.push(k);
                                    } else {
                                      newValues = newValues.filter(v => v !== k);
                                    }
                                    if (newValues.length === 0) newValues = ['all'];
                                  }
                                  setBillReportFilters({ ...billReportFilters, orderType: newValues });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{v}</span>
                            </label>
                          ))}
                        </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {/* Type Selection multi-select */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.itemReport.filters.mainType.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {Object.entries(t.tabs.itemReport.filters.mainType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <label key={k} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={itemReportFilters.mainType.includes(k)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...itemReportFilters.mainType];
                                  if (k === 'all') {
                                    newValues = ['all'];
                                  } else {
                                    newValues = newValues.filter(v => v !== 'all');
                                    if (isChecked) {
                                      newValues.push(k);
                                    } else {
                                      newValues = newValues.filter(v => v !== k);
                                    }
                                    if (newValues.length === 0) newValues = ['all'];
                                  }
                                  setItemReportFilters({ ...itemReportFilters, mainType: newValues });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{v}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Remark filter multi-select */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.itemReport.filters.remark.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {Object.entries(t.tabs.itemReport.filters.remark).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <label key={k} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={itemReportFilters.remark.includes(k)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...itemReportFilters.remark];
                                  if (k === 'all') {
                                    newValues = ['all'];
                                  } else {
                                    newValues = newValues.filter(v => v !== 'all');
                                    if (isChecked) {
                                      newValues.push(k);
                                    } else {
                                      newValues = newValues.filter(v => v !== k);
                                    }
                                    if (newValues.length === 0) newValues = ['all'];
                                  }
                                  setItemReportFilters({ ...itemReportFilters, remark: newValues });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{v}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Sort Filters Group */}
                      <div className="space-y-4 lg:col-span-1 xl:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        </div>
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
                        {billReportData.length > 0 ? (
                          billReportData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{row.Bill_Id}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                                {row.Discount_Amt > 0 ? parseFloat(row.Discount_Amt).toLocaleString(undefined, { minimumFractionDigits: 2 }) : (lang === 'si' ? 'වට්ටම් රහිත' : 'No Discount')}
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{parseFloat(row.TAX || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{parseFloat(row.Service_Charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs font-bold text-dashboard-blue">{parseFloat(row.Total_Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs">
                                <span className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase ${row.Transaction_Type === 'Cash' ? 'bg-green-100 text-green-700' :
                                  row.Transaction_Type === 'Cancel bill' ? 'bg-red-100 text-red-700' :
                                    row.Transaction_Type === 'Incomplete Bill' ? 'bg-orange-100 text-orange-700' :
                                      row.Transaction_Type === 'Void bill' ? 'bg-slate-100 text-slate-700' :
                                        row.Transaction_Type === 'Credit' ? 'bg-purple-100 text-purple-700' :
                                          'bg-blue-100 text-blue-700'
                                  }`}>
                                  {row.Transaction_Type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-600">{row.Order_Type}</td>
                              <td className="px-4 py-3 text-xs text-slate-500 italic">{row.Remark || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td colSpan={Object.keys(t.tabs.billReport.headers).length} className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No report data to display</p>
                                <p className="text-xs">Adjust filters and generate to view results</p>
                              </div>
                            </td>
                          </tr>
                        )}
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
                        {itemReportData.length > 0 ? (
                          itemReportData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{row.Bill_Id}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{row.KOTNo}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{row.Description}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{row.Qty}</td>
                              <td className="px-4 py-3 text-xs font-bold text-dashboard-blue">{parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs text-slate-500 italic">{row.Reason || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td colSpan={Object.keys(t.tabs.itemReport.headers).length} className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No item report data to display</p>
                                <p className="text-xs">Adjust filters and generate to view results</p>
                              </div>
                            </td>
                          </tr>
                        )}
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

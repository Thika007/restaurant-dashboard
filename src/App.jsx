import React, { useState, useEffect } from 'react';
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
  getAppConfig, fetchBillReport, fetchItemReport, fetchCardTypes, fetchLocations,
  fetchCategories, fetchSubCategories
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
    txnType: ['all'],
    orderType: ['all'],
    categories: ['all'],
    subCategories: ['all'],
    itemName: '',
    descSort: 'all',
    qtySort: 'all',
    amtSort: 'all'
  });
  const [cardTypes, setCardTypes] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('000');
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Load user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.supervisor === 'Y' || user.alowmaster === 'Y';
  const t = translations[lang];

  const handleQuickSelect = (days, label) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setActiveQuickSelect(label);
  };

  // Load initial config
  useEffect(() => {
    getAppConfig().then(cfg => {
      if (cfg.refreshInterval) {
        setRefreshInterval(cfg.refreshInterval);
      }
    });

    fetchCardTypes().then(data => {
      setCardTypes(data);
    }).catch(err => console.error("Failed to fetch card types:", err));

    fetchCategories().then(data => {
      setCategories(data);
    }).catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  useEffect(() => {
    // Fetch subcategories whenever categories filter changes (if a single category is selected)
    // Or just fetch all subcategories if preferred. 
    // Let's fetch all initially or filter by the first selected category if only one is selected.
    const selectedCat = itemReportFilters.categories.length === 1 && itemReportFilters.categories[0] !== 'all'
      ? itemReportFilters.categories[0]
      : 'all';

    fetchSubCategories(selectedCat).then(data => {
      setSubCategories(data);
    }).catch(err => console.error("Failed to fetch sub-categories:", err));
  }, [itemReportFilters.categories]);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [statsData, trendData, topItemsData, orderTypesData, paymentMethodsData] = await Promise.all([
        fetchTodayStats(selectedLocation),
        fetchSalesTrend(selectedLocation),
        fetchTopItems(selectedLocation),
        fetchOrderTypes(selectedLocation),
        fetchPaymentMethods(selectedLocation)
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
  useEffect(() => {
    if (activeTab === 'real-time') {
      loadDashboardData();
      const interval = setInterval(() => {
        loadDashboardData(true);
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [activeTab, refreshInterval, selectedLocation]);

  useEffect(() => {
    if (isAdmin) {
      fetchLocations().then(setLocations).catch(console.error);
    }
  }, [isAdmin]);

  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        const [historyData, statsData, trendData, topItemsData, orderTypesData, paymentMethodsData] = await Promise.all([
          fetchHistory(startDate, endDate, selectedLocation),
          fetchHistoryStats(startDate, endDate, selectedLocation),
          fetchHistoryTrend(startDate, endDate, selectedLocation),
          fetchHistoryTopItems(startDate, endDate, selectedLocation),
          fetchHistoryOrderTypes(startDate, endDate, selectedLocation),
          fetchHistoryPaymentMethods(startDate, endDate, selectedLocation)
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
  }, [activeTab, startDate, endDate, selectedLocation]);

  const loadBillReportData = async () => {
    try {
      setLoading(true);
      const data = await fetchBillReport(startDate, endDate, billReportFilters, selectedLocation);
      setBillReportData(data);
    } catch (error) {
      console.error("Failed to load bill report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' && activeReportType === 'bill') {
      loadBillReportData();
    }
  }, [activeTab, activeReportType, startDate, endDate, billReportFilters, selectedLocation]);

  const loadItemReportData = async () => {
    try {
      setLoading(true);
      const data = await fetchItemReport(startDate, endDate, itemReportFilters, selectedLocation);
      setItemReportData(data);
    } catch (error) {
      console.error("Failed to load item report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' && activeReportType === 'item') {
      loadItemReportData();
    }
  }, [activeTab, activeReportType, startDate, endDate, itemReportFilters, selectedLocation]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const currencySymbol = "LKR";
    let yOffset = 40;

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
      yOffset = 40;
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
        parseFloat(row.Discount_Amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
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
      doc.text(pdfT.pdfTitle, 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Date Range: ${startDate} - ${endDate}`, 14, 28);

      // Filter Summary
      yOffset = 40;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(pdfT.pdfFilterSummary, 14, yOffset);
      doc.setFontSize(10);
      doc.setTextColor(100);
      yOffset += 7;

      // Map filters to human readable names
      const txnNames = itemReportFilters.txnType.map(k => pdfT.filters.txnType[k] || k).join(', ');
      const orderNames = itemReportFilters.orderType.map(k => pdfT.filters.orderType[k] || k).join(', ');

      const catNames = itemReportFilters.categories.includes('all')
        ? 'All'
        : itemReportFilters.categories.map(code => {
          const cat = categories.find(c => String(c.Dept_Code) === String(code));
          return cat ? cat.Dept_Name : code;
        }).join(', ');

      const subNames = itemReportFilters.subCategories.includes('all')
        ? 'All'
        : itemReportFilters.subCategories.map(id => {
          const sub = subCategories.find(s => String(s.Class_id) === String(id));
          return sub ? sub.Class_Desc : id;
        }).join(', ');

      doc.text(`${pdfT.filters.txnType.label}: ${txnNames}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.filters.orderType.label}: ${orderNames}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.filters.category.label}: ${catNames}`, 14, yOffset);
      yOffset += 5;
      doc.text(`${pdfT.filters.subCategory.label}: ${subNames}`, 14, yOffset);

      if (itemReportFilters.itemName) {
        yOffset += 5;
        doc.text(`${pdfT.filters.search.label}: ${itemReportFilters.itemName}`, 14, yOffset);
      }

      // Table
      const tableColumn = Object.values(pdfT.headers);
      const tableRows = itemReportData.map(row => [
        row.Description,
        row.Qty,
        parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })
      ]);

      autoTable(doc, {
        startY: yOffset + 10,
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

      yOffset = doc.lastAutoTable.finalY + 10;
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
        locations={locations}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
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
                          {Object.entries(t.tabs.billReport.filters.txnType).filter(([k]) => k !== 'label').map(([k, v]) => {
                            if (k === 'cardPay') {
                              return cardTypes.map(card => (
                                <label key={card.cc_no} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={billReportFilters.txnType.includes(`CC_${card.cc_no}`)}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      let newValues = [...billReportFilters.txnType];
                                      const cardVal = `CC_${card.cc_no}`;
                                      newValues = newValues.filter(v => v !== 'all');
                                      if (isChecked) {
                                        newValues.push(cardVal);
                                      } else {
                                        newValues = newValues.filter(v => v !== cardVal);
                                      }
                                      if (newValues.length === 0) newValues = ['all'];
                                      setBillReportFilters({ ...billReportFilters, txnType: newValues });
                                    }}
                                    className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                                  />
                                  <span className="text-xs font-semibold text-slate-600 select-none">{card.cc_name}</span>
                                </label>
                              ));
                            }
                            return (
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
                            );
                          })}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                      {/* Transaction Type Filter */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.itemReport.filters.txnType.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {Object.entries(t.tabs.itemReport.filters.txnType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <label key={k} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={itemReportFilters.txnType.includes(k)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...itemReportFilters.txnType];
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
                                  setItemReportFilters({ ...itemReportFilters, txnType: newValues });
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
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.itemReport.filters.orderType.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {Object.entries(t.tabs.itemReport.filters.orderType).filter(([k]) => k !== 'label').map(([k, v]) => (
                            <label key={k} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={itemReportFilters.orderType.includes(k)}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...itemReportFilters.orderType];
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
                                  setItemReportFilters({ ...itemReportFilters, orderType: newValues });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{v}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.itemReport.filters.category.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={itemReportFilters.categories.includes('all')}
                              onChange={(e) => setItemReportFilters({ ...itemReportFilters, categories: ['all'], subCategories: ['all'] })}
                              className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                            />
                            <span className="text-xs font-semibold text-slate-600 select-none">All Categories</span>
                          </label>
                          {categories.map(cat => (
                            <label key={cat.Dept_Code} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={itemReportFilters.categories.includes(String(cat.Dept_Code))}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...itemReportFilters.categories].filter(v => v !== 'all');
                                  const val = String(cat.Dept_Code);
                                  if (isChecked) {
                                    newValues.push(val);
                                  } else {
                                    newValues = newValues.filter(v => v !== val);
                                  }
                                  if (newValues.length === 0) newValues = ['all'];
                                  setItemReportFilters({ ...itemReportFilters, categories: newValues, subCategories: ['all'] });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{cat.Dept_Name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Sub-Category Filter */}
                      <div className="space-y-1.5 border-r border-slate-100 pr-4">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1 block mb-2">{t.tabs.itemReport.filters.subCategory.label}</label>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          <label className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={itemReportFilters.subCategories.includes('all')}
                              onChange={(e) => setItemReportFilters({ ...itemReportFilters, subCategories: ['all'] })}
                              className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                            />
                            <span className="text-xs font-semibold text-slate-600 select-none">All Sub Categories</span>
                          </label>
                          {subCategories.map(sub => (
                            <label key={`${sub.Class_id}-${sub.Class_Desc}`} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={itemReportFilters.subCategories.includes(String(sub.Class_id))}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  let newValues = [...itemReportFilters.subCategories].filter(v => v !== 'all');
                                  const val = String(sub.Class_id);
                                  if (isChecked) {
                                    newValues.push(val);
                                  } else {
                                    newValues = newValues.filter(v => v !== val);
                                  }
                                  if (newValues.length === 0) newValues = ['all'];
                                  setItemReportFilters({ ...itemReportFilters, subCategories: newValues });
                                }}
                                className="w-3.5 h-3.5 text-dashboard-blue border-slate-300 rounded focus:ring-dashboard-blue"
                              />
                              <span className="text-xs font-semibold text-slate-600 select-none">{sub.Class_Desc}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Search and Sort */}
                      <div className="space-y-4 lg:col-span-2 xl:col-span-2">
                        {/* Search bar */}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.search.label}</label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={itemReportFilters.itemName}
                              onChange={(e) => setItemReportFilters({ ...itemReportFilters, itemName: e.target.value })}
                              placeholder={t.tabs.itemReport.filters.search.placeholder}
                              className="w-full bg-slate-50 border-slate-200 rounded-xl text-xs font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue pl-9 py-2"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {/* Description sort */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.tabs.itemReport.filters.descSort.label}</label>
                            <select
                              value={itemReportFilters.descSort}
                              onChange={(e) => setItemReportFilters({ ...itemReportFilters, descSort: e.target.value, qtySort: 'all', amtSort: 'all' })}
                              className="w-full bg-slate-50 border-slate-200 rounded-xl text-[10px] font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue px-2 py-1.5"
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
                              onChange={(e) => setItemReportFilters({ ...itemReportFilters, qtySort: e.target.value, descSort: 'all', amtSort: 'all' })}
                              className="w-full bg-slate-50 border-slate-200 rounded-xl text-[10px] font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue px-2 py-1.5"
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
                              onChange={(e) => setItemReportFilters({ ...itemReportFilters, amtSort: e.target.value, descSort: 'all', qtySort: 'all' })}
                              className="w-full bg-slate-50 border-slate-200 rounded-xl text-[10px] font-semibold focus:ring-dashboard-blue focus:border-dashboard-blue px-2 py-1.5"
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
                          {Object.values(t.tabs.billReport.headers).map((header, idx) => {
                            const isNumeric = [
                              t.tabs.billReport.headers.amount,
                              t.tabs.billReport.headers.discountType,
                              t.tabs.billReport.headers.tax,
                              t.tabs.billReport.headers.serviceCharge,
                              t.tabs.billReport.headers.totalAmount
                            ].includes(header);
                            return (
                              <th key={idx} className={`px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap ${isNumeric ? 'text-right' : 'text-left'}`}>
                                {header}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {billReportData.length > 0 ? (
                          billReportData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-left">{row.Bill_Id}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-right">{parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-right">
                                {parseFloat(row.Discount_Amt || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-right">{parseFloat(row.TAX || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-right">{parseFloat(row.Service_Charge || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs font-bold text-dashboard-blue text-right">{parseFloat(row.Total_Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-xs text-left">
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
                              <td className="px-4 py-3 text-xs font-semibold text-slate-600 text-left">{row.Order_Type}</td>
                              <td className="px-4 py-3 text-xs text-slate-500 italic text-left">{row.Remark || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td colSpan={Object.keys(t.tabs.billReport.headers).length} className="px-4 py-12 text-center text-left">
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No report data to display</p>
                                <p className="text-xs">Adjust filters and generate to view results</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {billReportData.length > 0 && (
                        <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                          <tr>
                            <td className="px-4 py-4 text-[10px] font-black uppercase text-slate-500 text-left">{lang === 'si' ? 'එකතුව' : 'TOTAL'}</td>
                            <td className="px-4 py-3 text-xs font-black text-slate-700 text-right">
                              {billReportData.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-xs font-black text-slate-700 text-right">
                              {billReportData.reduce((sum, row) => sum + parseFloat(row.Discount_Amt || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-xs font-black text-slate-700 text-right">
                              {billReportData.reduce((sum, row) => sum + parseFloat(row.TAX || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-xs font-black text-slate-700 text-right">
                              {billReportData.reduce((sum, row) => sum + parseFloat(row.Service_Charge || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-sm font-black text-dashboard-blue text-right">
                              {billReportData.reduce((sum, row) => sum + parseFloat(row.Total_Amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td colSpan={3} className="text-left"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                ) : activeReportType === 'item' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          {Object.values(t.tabs.itemReport.headers).map((header, idx) => (
                            <th key={idx} className={`px-4 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap ${header === t.tabs.itemReport.headers.qty || header === t.tabs.itemReport.headers.amount ? 'text-right' : ''}`}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {itemReportData.length > 0 ? (
                          itemReportData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700">{row.Description}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-slate-700 text-right">{row.Qty}</td>
                              <td className="px-4 py-3 text-xs font-bold text-dashboard-blue text-right">{parseFloat(row.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td colSpan={3} className="px-4 py-12 text-center">
                              <div className="flex flex-col items-center justify-center text-slate-400">
                                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm font-medium">No item data to display</p>
                                <p className="text-xs">Adjust filters and generate to view results</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {itemReportData.length > 0 && (
                        <tfoot className="bg-slate-50/80 border-t-2 border-slate-200">
                          <tr>
                            <td className="px-4 py-4 text-[10px] font-black uppercase text-slate-500">{lang === 'si' ? 'එකතුව' : 'TOTAL'}</td>
                            <td className="px-4 py-4 text-sm font-black text-slate-700 text-right">
                              {itemReportData.reduce((sum, row) => sum + parseFloat(row.Qty || 0), 0)}
                            </td>
                            <td className="px-4 py-4 text-sm font-black text-dashboard-blue text-right">
                              LKR {itemReportData.reduce((sum, row) => sum + parseFloat(row.Amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      )}
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

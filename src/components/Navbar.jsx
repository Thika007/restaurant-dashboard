import React from 'react';
import { Bell, LogOut, Search, User, Languages, LayoutDashboard, History, Maximize, Minimize, FileBarChart } from 'lucide-react';

const Navbar = ({ lang, setLang, t, activeTab, setActiveTab, tTabs }) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const userId = user ? user.userId : 'Guest';

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-dashboard-blue text-white font-black text-lg sm:text-xl shadow-lg shadow-blue-200">
                    D
                </div>
                <h1 className="hidden md:block text-xl font-black bg-gradient-to-r from-dashboard-blue to-blue-600 bg-clip-text text-transparent uppercase tracking-tighter">
                    Danu Dashboard
                </h1>
            </div>

            <div className="flex-1 flex justify-center px-2 sm:px-8">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg sm:rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('real-time')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'real-time'
                            ? 'bg-dashboard-blue text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{tTabs.realTime}</span>
                        <span className="xs:hidden">{lang === 'si' ? 'අද' : 'Now'}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'history'
                            ? 'bg-dashboard-blue text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{tTabs.history}</span>
                        <span className="xs:hidden">{lang === 'si' ? 'ඉතිහාසය' : 'Past'}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'reports'
                            ? 'bg-dashboard-blue text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <FileBarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{tTabs.reports}</span>
                        <span className="xs:hidden">{lang === 'si' ? 'වාර්තා' : 'Repo'}</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <button
                    onClick={toggleFullscreen}
                    className="hidden sm:flex p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors items-center justify-center"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                    <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent border-none text-[10px] sm:text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer uppercase p-0"
                    >
                        <option value="en">EN</option>
                        <option value="si">SI</option>
                    </select>
                </div>

                <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button className="p-1.5 sm:p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-1.5 sm:p-2 text-slate-500 hover:text-dashboard-red transition-colors"
                        title={t.logout}
                    >
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

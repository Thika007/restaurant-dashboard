import React from 'react';
import { Bell, LogOut, Search, User, Languages, LayoutDashboard, History, Maximize, Minimize } from 'lucide-react';

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
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-dashboard-blue text-white font-black text-xl shadow-lg shadow-blue-200">
                    D
                </div>
                <h1 className="text-xl font-black bg-gradient-to-r from-dashboard-blue to-blue-600 bg-clip-text text-transparent uppercase tracking-tighter">
                    Danu Dashboard
                </h1>
            </div>

            <div className="flex-1 flex justify-center px-8">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('real-time')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'real-time'
                            ? 'bg-dashboard-blue text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        {tTabs.realTime}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
                            ? 'bg-dashboard-blue text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        {tTabs.history}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                    <Languages className="w-4 h-4 text-slate-500" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer uppercase"
                    >
                        <option value="en">English</option>
                        <option value="si">සිංහල</option>
                    </select>
                </div>

                <div className="h-8 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">{userId}</p>
                        <p className="text-xs text-slate-500 text-dashboard-green">{t.connected}</p>
                    </div>
                    <button className="p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-500 hover:text-dashboard-red transition-colors"
                        title={t.logout}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

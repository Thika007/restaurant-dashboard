import React from 'react';
import { Bell, LogOut, Search, User } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-dashboard-blue text-white font-black text-xl shadow-lg shadow-blue-200">
                    L
                </div>
                <h1 className="text-xl font-black bg-gradient-to-r from-dashboard-blue to-blue-600 bg-clip-text text-transparent uppercase tracking-tighter">
                    LOGO
                </h1>
            </div>

            <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-dashboard-blue transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">


                <div className="h-8 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">Admin User</p>
                        <p className="text-xs text-slate-500 text-dashboard-green">Connected</p>
                    </div>
                    <button className="p-2 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                        <User className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-dashboard-red transition-colors">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { LayoutDashboard, User, Lock, AlertCircle, Languages, Maximize, Minimize } from 'lucide-react';
import { translations } from '../constants/translations';
import loginBg from '../assets/login-bg.png';

const LoginPage = ({ lang, setLang }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

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

    const t = translations[lang].login;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(userId, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-lg border border-gray-200 shadow-sm text-gray-700 hover:bg-white transition-colors flex items-center justify-center"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-lg border border-gray-200 shadow-sm">
                    <Languages className="w-4 h-4 text-gray-500" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer uppercase"
                    >
                        <option value="en">English</option>
                        <option value="si">සිංහල</option>
                    </select>
                </div>
            </div>

            {/* Left Side - Image (Clean) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-100">
                <img
                    src={loginBg}
                    alt="Restaurant Management"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="max-w-md w-full">
                    <div className="flex items-center gap-3 mb-12 justify-center lg:justify-start">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <LayoutDashboard className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Danu Dashboard</span>
                    </div>

                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">{t.welcome}</h2>
                        <p className="text-gray-500">{t.subtitle}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.userId}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white"
                                    placeholder={t.userIdPlaceholder}
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">{t.password}</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50 hover:bg-white"
                                    placeholder={t.passwordPlaceholder}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{t.rememberMe}</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{t.signingIn}</span>
                                </div>
                            ) : (
                                t.signIn
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-gray-400 text-xs tracking-wide">
                        {t.footer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

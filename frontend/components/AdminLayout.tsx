import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icons, ASSETS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../api';

import NotificationDropdown from './NotificationDropdown';

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isActive = (path: string) => location.pathname === path;

    const [pendingOrders, setPendingOrders] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Note: In a real app we would have a lighter 'stats' endpoint
                const orders = await API.orders.getAll();
                const pending = orders.filter((o: any) => o.status === 'pending').length;
                setPendingOrders(pending);
            } catch (error) {
                console.error('Failed to fetch stats');
            }
        };

        // Initial fetch
        fetchStats();

        // Poll every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <Icons.Dashboard /> },
        { label: 'Shop', path: '/admin/shop', icon: <Icons.ShoppingBag /> },
        { label: 'Orders', path: '/admin/orders', icon: <Icons.Clipboard />, badge: pendingOrders },
        { label: 'Players', path: '/admin/players', icon: <Icons.Users /> },
        { label: 'Matches', path: '/admin/matches', icon: <Icons.Calendar /> },
        { label: 'News', path: '/admin/news', icon: <Icons.Layout /> },
        { label: 'Tickets', path: '/admin/tickets', icon: <Icons.Ticket /> },
        { label: 'Tickets Settings', path: '/admin/settings/tickets', icon: <Icons.Settings /> },
        { label: 'Contacts', path: '/admin/contacts', icon: <Icons.Mail /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-72 bg-[#001226] text-white hidden lg:flex flex-col shadow-2xl relative z-20">
                <div className="p-8 border-b border-white/5">
                    <Link to="/" className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-lg overflow-hidden">
                            <img src={ASSETS.logo} alt="Logo" className="object-contain w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tighter leading-none">AMAL TIZNIT</span>
                            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">CMS Console</span>
                        </div>
                    </Link>
                </div>
                <nav className="flex-grow p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-5 py-4 rounded-sm transition-all duration-300 group ${isActive(item.path) ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`${isActive(item.path) ? 'text-white' : 'text-blue-500 group-hover:text-blue-400'}`}>{item.icon}</div>
                                <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                            </div>
                            {item.badge ? (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{item.badge}</span>
                            ) : null}
                        </Link>
                    ))}
                </nav>
                <div className="p-6 border-t border-white/5 bg-[#000d1a] space-y-4">
                    <Link to="/admin/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.name || 'Admin'}</p>
                            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <Icons.Settings />
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest py-3 hover:bg-red-500/10 rounded transition-colors">
                        <Icons.LogOut />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10">
                    <h2 className="text-xl font-black text-[#001226] uppercase tracking-tighter">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    </h2>
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-xs font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-2">
                            View Site <Icons.ExternalLink />
                        </Link>
                        <div className="w-px h-8 bg-gray-100"></div>

                        <NotificationDropdown />

                        <div className="w-px h-8 bg-gray-100"></div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-[#001226] uppercase">{user?.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.role || 'Administrator'}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black shadow-sm">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-grow p-10 overflow-y-auto bg-[#fcfdfe]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

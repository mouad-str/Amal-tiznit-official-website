import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../constants';
import { API } from '../api';

interface Notification {
    id: number | string;
    type: 'order' | 'message';
    title: string;
    subtitle: string;
    time: string;
    link: string;
    isRead: boolean;
}

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            // Fetch Orders (Pending)
            const orders = await API.orders.getAll();
            const pendingOrders = orders
                .filter((o: any) => o.status === 'pending')
                .map((o: any) => ({
                    id: `ord-${o.id}`,
                    type: 'order' as const,
                    title: `New Order #${o.id}`,
                    subtitle: `${o.customer_name} - ${o.total_amount} DH`,
                    time: new Date(o.created_at).toLocaleDateString(),
                    link: '/admin/orders',
                    isRead: false
                }));

            // Fetch Messages (Ideally we'd filter for unread, but api returns all for now)
            const messages = await API.contact.getAll();
            // Taking last 5 messages for demo since we don't have 'read' status yet
            const recentMessages = messages
                .slice(0, 5)
                .map((m: any) => ({
                    id: `msg-${m.id}`,
                    type: 'message' as const,
                    title: `New Message from ${m.name}`,
                    subtitle: m.message.substring(0, 30) + '...',
                    time: new Date(m.created_at).toLocaleDateString(),
                    link: '/admin/contacts',
                    isRead: false // Assuming unread logic would go here
                }));

            const all = [...pendingOrders, ...recentMessages].sort((a, b) =>
                new Date(b.time).getTime() - new Date(a.time).getTime()
            );

            setNotifications(all);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
            >
                <Icons.Bell />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up origin-top-right">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                        <h3 className="font-black text-[#001226] uppercase text-xs tracking-widest">Notifications</h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Icons.Bell />
                                <p className="text-xs mt-2">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(item => (
                                    <Link
                                        key={item.id}
                                        to={item.link}
                                        onClick={() => setIsOpen(false)}
                                        className="block p-4 hover:bg-blue-50 transition-colors group"
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 p-1.5 rounded-full h-fit ${item.type === 'order' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {item.type === 'order' ? <Icons.ShoppingBag /> : <Icons.Mail />}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#001226] group-hover:text-blue-600 transition-colors">{item.title}</h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
                                                <span className="text-[9px] text-gray-300 font-bold uppercase mt-1 block">{item.time}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                        <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">
                            View All Activity
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

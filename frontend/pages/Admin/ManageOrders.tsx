import React, { useState, useEffect } from 'react';
import { API } from '../../api';
import { ShoppingBag, Eye, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';

interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    items?: any[];
}

const ManageOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await API.orders.getAll();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await API.orders.updateStatus(id, status);
            fetchOrders(); // Refresh
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        const icons: any = {
            pending: <Clock size={14} />,
            confirmed: <CheckCircle size={14} />,
            shipped: <Truck size={14} />,
            delivered: <CheckCircle size={14} />,
            cancelled: <XCircle size={14} />
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 w-fit ${styles[status] || styles.pending}`}>
                {icons[status]} {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black uppercase italic text-[#001226]">Order Management</h1>
                <div className="text-sm font-bold text-gray-500">Total Orders: {orders.length}</div>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No orders found yet</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Order ID</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Customer</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Date</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Total</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500">Status</th>
                                    <th className="p-4 text-xs font-bold uppercase text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-4 font-mono text-sm">#{order.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-[#001226]">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 font-black text-blue-600">{order.total_amount} DH</td>
                                        <td className="p-4">{getStatusBadge(order.status)}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-gray-100 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-black uppercase italic text-[#001226]">Order #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Customer Details</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                        <p><span className="font-bold">Name:</span> {selectedOrder.customer_name}</p>
                                        <p><span className="font-bold">Email:</span> {selectedOrder.customer_email}</p>
                                        <p><span className="font-bold">Phone:</span> {selectedOrder.customer_phone}</p>
                                        <p><span className="font-bold">Address:</span></p>
                                        <p className="text-gray-500 pl-2 border-l-2 border-blue-200">{selectedOrder.customer_address}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Order Status</h3>
                                    <div className="space-y-4">
                                        {getStatusBadge(selectedOrder.status)}
                                        <div className="grid grid-cols-2 gap-2">
                                            {['confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(selectedOrder.id, status)}
                                                    className={`px-3 py-2 text-xs font-bold uppercase rounded border transition-all ${selectedOrder.status === status
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                                                        }`}
                                                >
                                                    Mark {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Items Ordered</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                                            <tr>
                                                <th className="p-3 text-left">Product</th>
                                                <th className="p-3 text-center">Qty</th>
                                                <th className="p-3 text-right">Price</th>
                                                <th className="p-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedOrder.items?.map((item: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-medium">{item.product_name}</td>
                                                    <td className="p-3 text-center">{item.quantity}</td>
                                                    <td className="p-3 text-right text-gray-500">{item.price_at_time}</td>
                                                    <td className="p-3 text-right font-bold">{item.price_at_time * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-bold">
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right">Grand Total</td>
                                                <td className="p-3 text-right text-blue-600">{selectedOrder.total_amount} DH</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;

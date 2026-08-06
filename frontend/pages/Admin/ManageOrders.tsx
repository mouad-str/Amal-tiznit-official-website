import React, { useState, useEffect } from 'react';
import { API } from '../../api';
import { ShoppingBag, Eye, CheckCircle, Truck, XCircle, Clock, Printer } from 'lucide-react';

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

    const printReceipt = (order: Order) => {
        const printWindow = window.open('', '_blank', 'width=400,height=700');
        if (!printWindow) return;

        const itemsRows = (order.items || []).map((item: any) => `
            <tr>
                <td style="padding:6px 0;border-bottom:1px dashed #ddd;font-size:12px">${item.product_name}</td>
                <td style="padding:6px 0;border-bottom:1px dashed #ddd;text-align:center;font-size:12px">${item.quantity}</td>
                <td style="padding:6px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px">${(item.price_at_time * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Reçu #${order.id} - USAT Boutique</title>
    <style>
        @media print { body { margin: 0; } .no-print { display: none; } }
        body { font-family: 'Courier New', monospace; width: 320px; margin: 0 auto; padding: 20px; color: #111; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 12px; }
        .header h1 { font-size: 18px; margin: 0 0 4px; letter-spacing: 2px; }
        .header p { font-size: 10px; margin: 2px 0; color: #555; }
        .info { font-size: 11px; margin-bottom: 12px; }
        .info p { margin: 3px 0; }
        .info strong { display: inline-block; width: 70px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #111; padding: 6px 0; text-align: left; }
        th:nth-child(2) { text-align: center; }
        th:last-child { text-align: right; }
        .total-row { border-top: 2px solid #111; font-size: 16px; font-weight: bold; }
        .total-row td { padding: 10px 0; }
        .footer { text-align: center; border-top: 1px dashed #999; padding-top: 12px; margin-top: 12px; font-size: 10px; color: #777; }
        .footer p { margin: 3px 0; }
        .btn-print { display: block; width: 100%; padding: 10px; margin-top: 16px; background: #001226; color: white; border: none; font-size: 14px; font-weight: bold; cursor: pointer; letter-spacing: 1px; }
        .btn-print:hover { background: #003366; }
        .status { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>US AMAL TIZNIT</h1>
        <p>BOUTIQUE OFFICIELLE</p>
        <p>Stade El Massira, Tiznit, Maroc</p>
    </div>

    <div style="text-align:center;margin-bottom:12px">
        <p style="font-size:14px;font-weight:bold;margin:0">REÇU DE COMMANDE</p>
        <p style="font-size:20px;font-weight:bold;margin:4px 0;letter-spacing:2px">#${order.id}</p>
        <p style="font-size:10px;color:#777;margin:0">${new Date(order.created_at).toLocaleString('fr-MA', { dateStyle: 'long', timeStyle: 'short' })}</p>
        <p style="margin-top:6px"><span class="status">${order.status}</span></p>
    </div>

    <div class="info">
        <p><strong>Client:</strong> ${order.customer_name}</p>
        <p><strong>Tél:</strong> ${order.customer_phone}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>Adresse:</strong> ${order.customer_address}</p>
    </div>

    <table>
        <thead><tr><th>Article</th><th>Qté</th><th>Prix</th></tr></thead>
        <tbody>${itemsRows}</tbody>
    </table>

    <table>
        <tr class="total-row">
            <td>TOTAL</td>
            <td style="text-align:right">${Number(order.total_amount).toFixed(2)} DH</td>
        </tr>
    </table>

    <div class="footer">
        <p>Merci pour votre achat !</p>
        <p>www.amaltiznit.com</p>
        <p>Pour toute question: contact@amaltiznit.com</p>
    </div>

    <button class="btn-print no-print" onclick="window.print()">🖨️ IMPRIMER</button>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => printReceipt(selectedOrder)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#001226] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Printer size={16} /> Imprimer
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500">
                                    <XCircle size={24} />
                                </button>
                            </div>
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

import React, { useState, useEffect } from 'react';
import { API } from '../../api';
import { ShoppingBag, Eye, CheckCircle, Truck, XCircle, Clock, Printer } from 'lucide-react';
import { ASSETS } from '../../constants';

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

    useEffect(() => {
        if (selectedOrder) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedOrder]);

    const updateStatus = async (id: number, status: string) => {
        try {
            await API.orders.updateStatus(id, status);
            fetchOrders(); // Refresh
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
            }
        } catch (error: any) {
            console.error('Failed to update status:', error);
            alert(error.message || 'Échec de la mise à jour du statut');
        }
    };

    const getStatusText = (status: string) => {
        const texts: any = {
            pending: 'En attente',
            confirmed: 'Confirmé',
            shipped: 'Expédié',
            delivered: 'Livré',
            cancelled: 'Annulé'
        };
        return texts[status] || status;
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200/50',
            confirmed: 'bg-blue-100 text-blue-800 border border-blue-200/50',
            shipped: 'bg-indigo-100 text-indigo-800 border border-indigo-200/50',
            delivered: 'bg-green-100 text-green-800 border border-green-200/50',
            cancelled: 'bg-red-100 text-red-800 border border-red-200/50'
        };
        const icons: any = {
            pending: <Clock size={12} />,
            confirmed: <CheckCircle size={12} />,
            shipped: <Truck size={12} />,
            delivered: <CheckCircle size={12} />,
            cancelled: <XCircle size={12} />
        };

        return (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${styles[status] || styles.pending}`}>
                {icons[status]} {getStatusText(status)}
            </span>
        );
    };

    const printReceipt = (order: Order) => {
        const printWindow = window.open('', '_blank', 'width=400,height=700');
        if (!printWindow) return;

        const itemsRows = (order.items || []).map((item: any) => `
            <tr>
                <td style="padding:6px 0;border-bottom:1px dashed #ddd;font-size:12px">
                    ${item.product_name}
                    ${item.size ? `<br/><span style="font-size:10px;color:#666">Taille: ${item.size}</span>` : ''}
                    ${item.flocage ? `<br/><span style="font-size:10px;color:#666">Flocage: ${item.flocage}</span>` : ''}
                    ${item.has_patch ? `<br/><span style="font-size:10px;color:#666">Badge: Inwi Pro</span>` : ''}
                </td>
                <td style="padding:6px 0;border-bottom:1px dashed #ddd;text-align:center;font-size:12px">${item.quantity}</td>
                <td style="padding:6px 0;border-bottom:1px dashed #ddd;text-align:right;font-size:12px">${Number(item.price_at_time).toFixed(2)}</td>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <h1 className="text-2xl font-black uppercase text-[#001226] font-display">Gestion des Commandes</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Suivi des achats, statuts de livraison et stocks boutique</p>
                </div>
                <div className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-xl">
                    Total Commandes : {orders.length}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12 gap-3 text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#001226] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Chargement des commandes...</span>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase">Aucune commande trouvée</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-wider">N° Commande</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-wider">Client</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-wider">Date</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-wider">Montant Total</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-wider">Statut</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-gray-500 tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-4 font-mono text-xs font-bold">#{order.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-xs text-[#001226]">{order.customer_name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{order.customer_email}</div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 font-mono">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="p-4 text-xs font-black text-blue-600 font-mono">{order.total_amount} DH</td>
                                        <td className="p-4">{getStatusBadge(order.status)}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="bg-gray-100 hover:bg-blue-100 text-blue-600 p-2 rounded-xl transition-colors cursor-pointer"
                                                title="Voir les détails"
                                            >
                                                <Eye size={16} />
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
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
                    <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-slate-200/80 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto text-slate-700">
                        {/* Top Gradient Bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#002D62] via-blue-600 to-[#D4AF37]" />

                        <div className="p-6 border-b border-slate-200/70 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <img src="/Assets/logo.png" alt="USAT" className="w-8 h-8 object-contain" />
                                <h2 className="text-md font-bold uppercase text-[#002D62] font-display">Commande #{selectedOrder.id}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => printReceipt(selectedOrder)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#002D62] hover:bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
                                >
                                    <Printer size={14} /> Imprimer
                                </button>
                                <button 
                                    onClick={() => setSelectedOrder(null)} 
                                    className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">Détails du Client</h3>
                                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-2 text-xs text-slate-600 shadow-sm leading-relaxed">
                                        <p><span className="font-bold text-[#002D62]">Nom :</span> {selectedOrder.customer_name}</p>
                                        <p><span className="font-bold text-[#002D62]">Email :</span> {selectedOrder.customer_email}</p>
                                        <p><span className="font-bold text-[#002D62]">Téléphone :</span> {selectedOrder.customer_phone}</p>
                                        <p><span className="font-bold text-[#002D62]">Adresse de livraison :</span></p>
                                        <p className="text-slate-500 pl-2.5 border-l-2 border-blue-500 font-medium">{selectedOrder.customer_address}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">Statut & Actions</h3>
                                    <div className="space-y-4">
                                        {getStatusBadge(selectedOrder.status)}
                                        <div className="grid grid-cols-2 gap-2">
                                            {['confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(selectedOrder.id, status)}
                                                    className={`px-3 py-2 text-[10px] font-bold uppercase rounded-xl border transition-all cursor-pointer ${selectedOrder.status === status
                                                        ? 'bg-[#002D62] text-white border-[#002D62] shadow-md'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {getStatusText(status)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 font-display">Articles Commandés</h3>
                                <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-100 text-[10px] text-[#002D62] uppercase font-bold border-b border-slate-200 font-display">
                                            <tr>
                                                <th className="p-3 text-left">Produit</th>
                                                <th className="p-3 text-center">Quantité</th>
                                                <th className="p-3 text-right">Prix Unitaire</th>
                                                <th className="p-3 text-right">Sous-total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {selectedOrder.items?.map((item: any, i: number) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-bold text-slate-800">
                                                        <div>{item.product_name}</div>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {item.size && (
                                                                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-slate-200">
                                                                    Taille: {item.size}
                                                                </span>
                                                            )}
                                                            {item.flocage && (
                                                                <span className="bg-amber-50 text-amber-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-amber-200">
                                                                    Flocage: {item.flocage}
                                                                </span>
                                                            )}
                                                            {item.has_patch === 1 && (
                                                                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border border-blue-200">
                                                                    Badge Inwi
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center font-mono font-bold text-[#001226]">{item.quantity}</td>
                                                    <td className="p-3 text-right text-slate-500 font-mono">{item.price_at_time} DH</td>
                                                    <td className="p-3 text-right font-bold text-[#002D62] font-mono">{item.price_at_time * item.quantity} DH</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right font-display text-[10px] uppercase tracking-wide">Total Général</td>
                                                <td className="p-3 text-right text-blue-700 font-mono font-black text-sm">{selectedOrder.total_amount} DH</td>
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

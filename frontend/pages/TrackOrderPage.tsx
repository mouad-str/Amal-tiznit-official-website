import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    Search, 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    ChevronRight, 
    ArrowLeft, 
    Smartphone, 
    MapPin, 
    ShoppingBag 
} from 'lucide-react';
import { API } from '../api';

const TrackOrderPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('id') || '');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Suivi de Commande | US Amal Tiznit Official Store";
        window.scrollTo(0, 0);

        const initialId = searchParams.get('id');
        if (initialId) {
            handleSearchOrder(initialId, '');
        }
    }, [searchParams]);

    const handleSearchOrder = async (searchId: string, searchPhone: string) => {
        if (!searchId.trim()) {
            setError('Veuillez saisir votre numéro de commande.');
            return;
        }

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const data = await API.orders.track(searchId, searchPhone);
            setOrder(data);
        } catch (err: any) {
            setError(err?.message || 'Commande non trouvée. Vérifiez vos identifiants.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 1;
            case 'confirmed': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            case 'cancelled': return -1;
            default: return 1;
        }
    };

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-24 text-white">
            
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-display uppercase tracking-wider">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-white transition-colors">Boutique</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#D4AF37] font-bold">Suivi De Commande</span>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                
                {/* Search Form Card */}
                <div className="bg-[#0B1528]/90 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl mb-10">
                    <div className="text-center max-w-xl mx-auto mb-8">
                        <div className="w-14 h-14 bg-[#002D62] border border-[#D4AF37]/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#D4AF37]">
                            <Package size={28} />
                        </div>
                        <h1 className="text-3xl font-black uppercase text-white font-display mb-2">Suivre Ma Commande</h1>
                        <p className="text-gray-400 text-xs">Entrez votre numéro de commande pour connaître le statut de livraison en temps réel.</p>
                    </div>

                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSearchOrder(orderId, phone); }}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-4"
                    >
                        <div className="sm:col-span-6 relative">
                            <input
                                type="text"
                                placeholder="Numéro de commande (ex: 124 ou #124)"
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                                className="w-full bg-[#0E182A] border border-white/15 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="sm:col-span-4 relative">
                            <input
                                type="tel"
                                placeholder="Téléphone (Optionnel)"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-[#0E182A] border border-white/15 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-full py-3.5 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl font-display flex items-center justify-center gap-2"
                            >
                                <Search size={16} className="text-[#D4AF37]" />
                                <span className="hidden sm:inline">Suivre</span>
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest font-display">Recherche de votre commande…</span>
                    </div>
                )}

                {/* Order Details & Status Lifecycle Tracker */}
                {order && (
                    <div className="bg-[#0B1528]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-8 animate-slide-up">
                        
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
                            <div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-display">Statut de la commande</span>
                                <h2 className="text-2xl font-black text-white font-mono">#{order.id}</h2>
                                <span className="text-xs text-gray-400">Passée le {new Date(order.created_at).toLocaleDateString('fr-MA', { dateStyle: 'long' })}</span>
                            </div>

                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-right">
                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Montant Total</span>
                                <span className="text-xl font-black text-amber-400 font-mono">{order.total || order.total_amount} DH</span>
                            </div>
                        </div>

                        {/* Lifecycle Progress Bar */}
                        {order.status === 'cancelled' ? (
                            <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-2xl text-center text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                                <XCircle size={18} /> Cette commande a été annulée
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-bold uppercase font-display">
                                    <div className={currentStep >= 1 ? 'text-[#D4AF37]' : 'text-gray-500'}>1. En Attente</div>
                                    <div className={currentStep >= 2 ? 'text-[#D4AF37]' : 'text-gray-500'}>2. Confirmée</div>
                                    <div className={currentStep >= 3 ? 'text-[#D4AF37]' : 'text-gray-500'}>3. Expédiée</div>
                                    <div className={currentStep >= 4 ? 'text-emerald-400' : 'text-gray-500'}>4. Livrée</div>
                                </div>

                                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
                                    <div 
                                        className="bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700" 
                                        style={{ width: `${(currentStep / 4) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Customer & Items Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 text-xs">
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
                                <h4 className="font-bold text-white uppercase font-display text-sm mb-3">Informations Destinataire</h4>
                                <p className="text-gray-300"><strong className="text-white">Nom:</strong> {order.customer_name}</p>
                                <p className="text-gray-300"><strong className="text-white">Téléphone:</strong> {order.customer_phone}</p>
                                <p className="text-gray-300"><strong className="text-white">Email:</strong> {order.customer_email}</p>
                                <p className="text-gray-300"><strong className="text-white">Adresse:</strong> {order.customer_address}</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                                <h4 className="font-bold text-white uppercase font-display text-sm mb-3">Articles Commandés</h4>
                                {order.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                                        <div>
                                            <div className="font-bold text-white">{item.product_name}</div>
                                            <div className="text-[10px] text-gray-400">Taille: {item.size || 'M'} × {item.quantity}</div>
                                            {item.flocage && <div className="text-[10px] text-amber-300 font-mono">Flocage: {item.flocage}</div>}
                                        </div>
                                        <div className="font-mono font-bold text-amber-400">{item.price * item.quantity} DH</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;

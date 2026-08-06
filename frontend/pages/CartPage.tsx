import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingBag, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowRight, 
    Truck, 
    ShieldCheck, 
    Tag, 
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import { ASSETS } from '../constants';

interface CartItem {
    productId: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
    quantity: number;
    size: string;
    flocageName?: string;
    flocageNumber?: string;
    hasPatch?: boolean;
    stock: number;
}

const CART_KEY = 'usat_shop_cart';
const FREE_SHIPPING_THRESHOLD = 500;

const loadCart = (): CartItem[] => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};
const saveCart = (cart: CartItem[]) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartItem[]>(loadCart);
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [discountError, setDiscountError] = useState('');

    useEffect(() => {
        document.title = "Mon Panier | US Amal Tiznit Official Store";
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => { saveCart(cart); }, [cart]);

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQ = Math.max(1, Math.min(item.stock, item.quantity + delta));
                return { ...item, quantity: newQ };
            }
            return item;
        }));
    };

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        const code = promoCode.trim().toUpperCase();
        if (code === 'AMAL10' || code === 'HALAAMAL' || code === 'USAT2026') {
            setAppliedDiscount(0.10);
            setDiscountError('');
        } else {
            setDiscountError('Code promo invalide (Essayer: AMAL10)');
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = Math.round(subtotal * appliedDiscount);
    const cartTotal = subtotal - discountAmount;
    const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const freeShippingPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-24 text-white">
            
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-display uppercase tracking-wider">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-white transition-colors">Boutique</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#D4AF37] font-bold">Mon Panier ({cart.length})</span>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-display mb-8">
                    Mon Panier Officiel <span className="text-[#D4AF37]">USAT</span>
                </h1>

                {cart.length === 0 ? (
                    <div className="bg-[#0B1528]/80 border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto backdrop-blur-xl shadow-2xl">
                        <ShoppingBag size={56} className="text-[#D4AF37] opacity-40 mx-auto mb-4" />
                        <h3 className="text-2xl font-black uppercase text-white font-display mb-2">Votre Panier Est Vide</h3>
                        <p className="text-gray-400 text-sm mb-6">Découvrez notre collection de maillots, vestes d'entraînement et accessoires officiels.</p>
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#002D62] border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl hover:bg-blue-900 transition-all shadow-xl font-display"
                        >
                            <ArrowLeft size={16} /> Explorer La Boutique
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Items List (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                            
                            {/* Free Shipping Tracker */}
                            <div className="bg-[#0B1528]/90 border border-white/10 p-5 rounded-2xl backdrop-blur-xl">
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="flex items-center gap-2 text-gray-300 font-bold">
                                        <Truck size={16} className="text-[#D4AF37]" />
                                        {freeShippingRemaining === 0 ? (
                                            <strong className="text-emerald-400">Livraison Gratuite Activée! 📦</strong>
                                        ) : (
                                            <>Plus que <strong className="text-amber-300 font-mono">{freeShippingRemaining} DH</strong> pour la livraison gratuite</>
                                        )}
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-[#D4AF37] h-full transition-all duration-500" style={{ width: `${freeShippingPercent}%` }} />
                                </div>
                            </div>

                            {cart.map((item, index) => (
                                <div key={index} className="bg-[#0B1528]/90 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 backdrop-blur-xl shadow-xl">
                                    <img src={item.image_url || '/Assets/bg2.jpg'} alt={item.name} className="w-24 h-28 object-cover rounded-xl bg-gray-900 border border-white/10 shrink-0" />
                                    
                                    <div className="flex-1 min-w-0 text-center sm:text-left">
                                        <h3 className="font-bold text-white text-base leading-snug">{item.name}</h3>
                                        
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 my-2 text-xs">
                                            <span className="bg-white/10 text-gray-300 font-mono font-bold px-2.5 py-1 rounded-lg">Taille: {item.size}</span>
                                            {item.flocageName && (
                                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono font-bold">
                                                    {item.flocageName} #{item.flocageNumber}
                                                </span>
                                            )}
                                            {item.hasPatch && (
                                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-lg font-mono font-bold">
                                                    Patch Botola 🇲🇦
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-sm font-black text-amber-400 font-mono">{item.price} DH / unité</div>
                                    </div>

                                    {/* Stepper & Actions */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 bg-[#0E182A] border border-white/10 rounded-xl px-3 py-1.5">
                                            <button onClick={() => updateQuantity(index, -1)} className="text-gray-400 hover:text-white p-1"><Minus size={14} /></button>
                                            <span className="font-mono font-bold text-sm text-white w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(index, 1)} className="text-gray-400 hover:text-white p-1"><Plus size={14} /></button>
                                        </div>

                                        <div className="font-black text-lg text-white font-mono min-w-[80px] text-right">
                                            {item.price * item.quantity} DH
                                        </div>

                                        <button onClick={() => removeFromCart(index)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Sidebar (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-[#0B1528]/90 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl space-y-4">
                                <h3 className="text-lg font-black uppercase text-white font-display border-b border-white/10 pb-3">
                                    Récapitulatif
                                </h3>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Sous-total ({cart.length} articles)</span>
                                        <span className="font-mono">{subtotal} DH</span>
                                    </div>
                                    {appliedDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-400">
                                            <span>Remise Code Promo (10%)</span>
                                            <span className="font-mono">-{discountAmount} DH</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-400">
                                        <span>Frais de Livraison</span>
                                        <span className="text-emerald-400 font-bold">{freeShippingRemaining === 0 ? 'GRATUIT' : '30 DH'}</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-white/10">
                                        <span>Total TTC</span>
                                        <span className="text-2xl font-black text-amber-400 font-mono">{cartTotal + (freeShippingRemaining === 0 ? 0 : 30)} DH</span>
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <form onSubmit={handleApplyPromo} className="pt-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Code Promo (ex: AMAL10)"
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value)}
                                            className="flex-1 bg-[#0E182A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase tracking-wider font-mono focus:outline-none focus:border-blue-500"
                                        />
                                        <button type="submit" className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-colors font-display">
                                            Appliquer
                                        </button>
                                    </div>
                                    {discountError && <p className="text-[10px] text-red-400 mt-1">{discountError}</p>}
                                </form>

                                <button
                                    onClick={() => navigate('/shop/checkout')}
                                    className="w-full py-4 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2 font-display"
                                >
                                    Valider Et Commander <ArrowRight size={16} />
                                </button>
                            </div>

                            <div className="bg-[#0B1528]/80 border border-white/10 p-5 rounded-2xl space-y-3 text-xs text-gray-300">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                                    <span>Paiement 100% Sécurisé à la livraison partout au Maroc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;

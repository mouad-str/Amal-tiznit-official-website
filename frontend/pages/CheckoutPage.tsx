import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    Truck, 
    ShieldCheck, 
    User, 
    Smartphone, 
    Mail, 
    MapPin, 
    ChevronRight, 
    ArrowLeft, 
    CreditCard, 
    ShoppingBag
} from 'lucide-react';
import { API } from '../api';

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
const PHONE_REGEX = /^(\+212|0)[5-7]\d{8}$/;

const loadCart = (): CartItem[] => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartItem[]>(loadCart);

    // Steps: 1: Info, 2: Delivery, 3: Payment (COD), 4: Success
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: 'Tiznit',
        deliveryMethod: 'standard', // standard (CTM) vs express (Amana)
        notes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderId: number; total: number } | null>(null);

    useEffect(() => {
        document.title = "Commander | US Amal Tiznit Official Store";
        window.scrollTo(0, 0);
    }, []);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = cartTotal >= 500 ? 0 : (form.deliveryMethod === 'express' ? 45 : 30);
    const grandTotal = cartTotal + shippingFee;

    const validateStep1 = () => {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = 'Nom complet requis';
        if (!form.email.trim()) errs.email = 'Adresse email requise';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Format email invalide';
        if (!form.phone.trim()) errs.phone = 'Numéro de téléphone marocain requis';
        else if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Format valide: +212XXXXXXXXX ou 06XXXXXXXX';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
        const errs: Record<string, string> = {};
        if (!form.address.trim()) errs.address = 'Adresse de livraison requise';
        else if (form.address.trim().length < 10) errs.address = 'Veuillez saisir votre adresse complète avec quartier';
        if (!form.city.trim()) errs.city = 'Ville requise';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleConfirmOrder = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);

        try {
            const result = await API.orders.create({
                customer_name: form.name,
                customer_email: form.email,
                customer_phone: form.phone,
                customer_address: `${form.address}, ${form.city}`,
                items: cart.map(i => ({
                    product_id: i.productId,
                    quantity: i.quantity,
                    size: i.size,
                    flocage: i.flocageName ? `${i.flocageName} #${i.flocageNumber}` : null,
                    has_patch: i.hasPatch
                }))
            });

            setOrderResult({ orderId: result.orderId, total: grandTotal });
            localStorage.removeItem(CART_KEY);
            setCart([]);
            setCurrentStep(4);
        } catch (error: any) {
            alert(error?.message || 'Erreur lors de la validation de la commande.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0 && currentStep !== 4) {
        return (
            <div className="min-h-screen bg-transparent pt-32 pb-24 flex items-center justify-center">
                <div className="bg-[#0B1528]/80 border border-white/10 p-12 text-center rounded-3xl max-w-md shadow-2xl">
                    <ShoppingBag size={48} className="text-[#D4AF37] mx-auto mb-3 opacity-40" />
                    <h3 className="text-2xl font-black uppercase text-white font-display mb-2">Votre Panier Est Vide</h3>
                    <p className="text-gray-400 text-sm mb-6">Veuillez ajouter des articles à votre panier avant de passer commande.</p>
                    <Link to="/shop" className="px-6 py-3 bg-[#002D62] text-white font-bold uppercase text-xs rounded-xl hover:bg-blue-900 border border-[#D4AF37]/50 font-display">
                        Retour À La Boutique
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-24 text-white">
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-display uppercase tracking-wider">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-white transition-colors">Boutique</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#D4AF37] font-bold">Commande</span>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Steps Header Bar */}
                {currentStep !== 4 && (
                    <div className="mb-10 max-w-3xl mx-auto">
                        <div className="flex items-center justify-between font-display text-xs uppercase font-bold text-gray-400">
                            {[
                                { step: 1, label: '1. Inscription' },
                                { step: 2, label: '2. Livraison' },
                                { step: 3, label: '3. Paiement (COD)' },
                            ].map((s) => (
                                <div key={s.step} className={`flex items-center gap-2 ${currentStep >= s.step ? 'text-[#D4AF37]' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs ${currentStep >= s.step ? 'bg-[#002D62] border border-[#D4AF37] text-[#D4AF37]' : 'bg-white/10 text-gray-500'}`}>
                                        {s.step}
                                    </div>
                                    <span className="hidden sm:inline">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Success View */}
                {currentStep === 4 ? (
                    <div className="bg-[#0B1528]/90 border border-white/10 rounded-3xl p-10 max-w-xl mx-auto text-center shadow-2xl backdrop-blur-xl">
                        <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black uppercase text-white font-display mb-2">Commande Confirmée!</h2>
                        <p className="text-gray-300 text-xs leading-relaxed mb-6">
                            Merci pour votre confiance. Votre commande a été enregistrée avec succès par le club. Notre équipe vous contactera sous peu.
                        </p>

                        {orderResult && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-2.5 text-xs">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-gray-400 uppercase">Numéro de Commande:</span>
                                    <strong className="text-white font-mono font-black">#{orderResult.orderId}</strong>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-gray-400 uppercase">Client:</span>
                                    <strong className="text-white">{form.name} ({form.phone})</strong>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-gray-400 uppercase">Adresse:</span>
                                    <strong className="text-white">{form.address}, {form.city}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 uppercase">Total Règlement COD:</span>
                                    <strong className="text-amber-400 font-mono font-black text-sm">{orderResult.total} DH</strong>
                                </div>
                            </div>
                        )}

                        <Link to="/shop" className="inline-block w-full py-4 bg-[#002D62] border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl hover:bg-blue-900 transition-all font-display shadow-xl">
                            Retour Au Superstore
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
                        
                        {/* Form Section (7 cols) */}
                        <div className="lg:col-span-7 bg-[#0B1528]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                            
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black uppercase text-white font-display border-b border-white/10 pb-3 flex items-center gap-2">
                                        <User size={20} className="text-[#D4AF37]" /> Informations Personnelles
                                    </h3>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Nom Complet *</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Ex: Ahmed El Mansouri"
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                        {errors.name && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{errors.name}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Numéro Téléphone Marocain *</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="+212 6XX XXX XXX ou 06XXXXXXXX"
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                        {errors.phone && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{errors.phone}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Adresse Email *</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="ahmed@example.com"
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                        {errors.email && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{errors.email}</span>}
                                    </div>

                                    <button
                                        onClick={() => { if (validateStep1()) setCurrentStep(2); }}
                                        className="w-full py-4 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl font-display mt-4"
                                    >
                                        Continuer Vers La Livraison
                                    </button>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black uppercase text-white font-display border-b border-white/10 pb-3 flex items-center gap-2">
                                        <MapPin size={20} className="text-[#D4AF37]" /> Adresse De Livraison
                                    </h3>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Adresse de livraison (Quartier & Rue) *</label>
                                        <textarea
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="Ex: Rue Al Massira, Immeuble B, Apt 4"
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-24 resize-none"
                                        />
                                        {errors.address && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{errors.address}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Ville *</label>
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            placeholder="Tiznit, Agadir, Casablanca..."
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-bold"
                                        />
                                    </div>

                                    {/* Delivery Options */}
                                    <div className="space-y-2 pt-2">
                                        <label className="block text-xs font-bold uppercase text-gray-300">Mode de Livraison</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div 
                                                onClick={() => setForm({ ...form, deliveryMethod: 'standard' })}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${form.deliveryMethod === 'standard' ? 'bg-[#002D62]/50 border-[#D4AF37]' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <div className="font-bold text-xs text-white uppercase font-display">Standard CTM (30 DH)</div>
                                                <div className="text-[10px] text-gray-400 mt-1">Expédition sous 48h</div>
                                            </div>

                                            <div 
                                                onClick={() => setForm({ ...form, deliveryMethod: 'express' })}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${form.deliveryMethod === 'express' ? 'bg-[#002D62]/50 border-[#D4AF37]' : 'bg-white/5 border-white/10'}`}
                                            >
                                                <div className="font-bold text-xs text-white uppercase font-display">Express Amana (45 DH)</div>
                                                <div className="text-[10px] text-gray-400 mt-1">Livraison en 24h</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setCurrentStep(1)} className="px-6 py-3.5 border border-white/10 text-gray-300 font-bold uppercase text-xs rounded-2xl hover:bg-white/5 font-display">
                                            Retour
                                        </button>
                                        <button onClick={() => { if (validateStep2()) setCurrentStep(3); }} className="flex-1 py-3.5 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl font-display">
                                            Continuer Vers Le Paiement
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black uppercase text-white font-display border-b border-white/10 pb-3 flex items-center gap-2">
                                        <CreditCard size={20} className="text-[#D4AF37]" /> Mode De Paiement
                                    </h3>

                                    <div className="bg-emerald-500/10 border border-emerald-500/40 p-5 rounded-2xl space-y-2">
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-display uppercase">
                                            <CheckCircle2 size={18} /> Paiement à la Livraison (Cash On Delivery)
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed">
                                            Vous payerez le montant total directement en espèces au livreur lors de la réception de votre colis.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setCurrentStep(2)} className="px-6 py-3.5 border border-white/10 text-gray-300 font-bold uppercase text-xs rounded-2xl hover:bg-white/5 font-display">
                                            Retour
                                        </button>
                                        <button 
                                            onClick={handleConfirmOrder} 
                                            disabled={isSubmitting}
                                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-wider rounded-2xl disabled:opacity-60 transition-all shadow-xl font-display"
                                        >
                                            {isSubmitting ? 'Validation En Cours...' : 'Confirmer La Commande (COD)'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Right (5 cols) */}
                        <div className="lg:col-span-5 bg-[#0B1528]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
                            <h3 className="text-lg font-black uppercase text-white font-display border-b border-white/10 pb-3">
                                Récapitulatif De Commande
                            </h3>

                            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image_url || '/Assets/bg2.jpg'} alt="" className="w-10 h-12 object-cover rounded bg-gray-900" />
                                            <div>
                                                <div className="font-bold text-white max-w-[150px] truncate">{item.name}</div>
                                                <div className="text-[10px] text-gray-400">Taille: {item.size} × {item.quantity}</div>
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-amber-400">{item.price * item.quantity} DH</div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-400">
                                    <span>Sous-total Articles</span>
                                    <span className="font-mono">{cartTotal} DH</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Frais de Livraison</span>
                                    <span className="font-mono">{shippingFee === 0 ? 'GRATUIT' : `${shippingFee} DH`}</span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                                    <span>Montant Total</span>
                                    <span className="text-2xl font-black text-amber-400 font-mono">{grandTotal} DH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;

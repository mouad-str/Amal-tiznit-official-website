import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ShoppingBag,
    Heart,
    Truck,
    ShieldCheck,
    Sparkles,
    ArrowLeft,
    Check,
    Shirt,
    ChevronRight,
    Star,
    RotateCcw,
    Share2,
    CheckCircle2,
    X,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    User,
    Smartphone,
    Mail,
    MapPin
} from 'lucide-react';
import { API, Product } from '../api';
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

const SQUAD_STAR_PLAYERS = [
    { id: 1, name: 'CHAHBOUN', number: '10', pos: 'Milieu Offensif' },
    { id: 2, name: 'EL AMRAOUI', number: '7', pos: 'Attaquant' },
    { id: 3, name: 'BAHBAH', number: '9', pos: 'Avant-Centre' },
    { id: 4, name: 'BENALI', number: '8', pos: 'Milieu de terrain' },
    { id: 5, name: 'TOURI', number: '1', pos: 'Gardien de but' }
];

const CART_KEY = 'usat_shop_cart';
const WISHLIST_KEY = 'usat_shop_wishlist';

const loadCart = (): CartItem[] => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};
const saveCart = (cart: CartItem[]) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

const loadWishlist = (): number[] => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
};
const saveWishlist = (list: number[]) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

const FREE_SHIPPING_THRESHOLD = 500;
const PHONE_REGEX = /^(\+212|0)[5-7]\d{8}$/;

const ShopDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart & Drawer State
    const [cart, setCart] = useState<CartItem[]>(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [discountError, setDiscountError] = useState('');

    // Wishlist
    const [wishlist, setWishlist] = useState<number[]>(loadWishlist);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Kit Customization State
    const [selectedSize, setSelectedSize] = useState('');
    const [flocageOption, setFlocageOption] = useState<'none' | 'player' | 'custom'>('none');
    const [selectedPlayerFlocage, setSelectedPlayerFlocage] = useState(SQUAD_STAR_PLAYERS[0]);
    const [customName, setCustomName] = useState('');
    const [customNumber, setCustomNumber] = useState('');
    const [addPatch, setAddPatch] = useState(false);
    const [activeView, setActiveView] = useState<'front' | 'back'>('front');

    // Accordions
    const [openAccordion, setOpenAccordion] = useState<'desc' | 'shipping' | 'care'>('desc');

    // Checkout
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', email: '', address: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderId: number; total: number } | null>(null);

    /* ── Fetch Product Details ─────────────── */

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        API.shop.getAll()
            .then(allProducts => {
                const found = allProducts.find(p => String(p.id) === id);
                if (found) {
                    setProduct(found);
                    document.title = `${found.name} | Boutique Officielle USAT`;
                    const sizes = (found.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim());
                    setSelectedSize(sizes.includes('M') ? 'M' : sizes[0]);

                    // Related items
                    const related = allProducts.filter(p => p.id !== found.id).slice(0, 4);
                    setRelatedProducts(related);
                } else {
                    navigate('/shop');
                }
            })
            .catch(err => {
                console.error('Failed to load product details:', err);
                navigate('/shop');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    /* ── Sync Storage ───────────────────────── */

    useEffect(() => { saveCart(cart); }, [cart]);
    useEffect(() => { saveWishlist(wishlist); }, [wishlist]);

    /* ── Toast Helper ────────────────────────── */

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    /* ── Wishlist Toggle ─────────────────────── */

    const toggleWishlist = (productId: number) => {
        setWishlist(prev => {
            const exists = prev.includes(productId);
            const updated = exists ? prev.filter(item => item !== productId) : [...prev, productId];
            showToast(exists ? "Retiré de vos favoris" : "Ajouté à vos favoris ❤️");
            return updated;
        });
    };

    /* ── Cart Action ─────────────────────────── */

    const handleAddToCart = () => {
        if (!product || product.stock <= 0) return;

        const fName = flocageOption === 'player' ? selectedPlayerFlocage.name : (flocageOption === 'custom' ? customName : undefined);
        const fNum = flocageOption === 'player' ? selectedPlayerFlocage.number : (flocageOption === 'custom' ? customNumber : undefined);

        let extraPrice = 0;
        if (fName || fNum) extraPrice += 40;
        if (addPatch) extraPrice += 25;

        setCart(prev => {
            const key = `${product.id}-${selectedSize}-${fName || ''}-${fNum || ''}-${addPatch ? 'P' : 'N'}`;
            const existing = prev.find(i => `${i.productId}-${i.size}-${i.flocageName || ''}-${i.flocageNumber || ''}-${i.hasPatch ? 'P' : 'N'}` === key);

            if (existing) {
                return prev.map(i => `${i.productId}-${i.size}-${i.flocageName || ''}-${i.flocageNumber || ''}-${i.hasPatch ? 'P' : 'N'}` === key
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                );
            }

            return [...prev, {
                productId: product.id,
                name: product.name,
                price: product.price + extraPrice,
                image_url: product.image_url,
                category: product.category,
                quantity: 1,
                size: selectedSize,
                flocageName: fName,
                flocageNumber: fNum,
                hasPatch: addPatch,
                stock: product.stock
            }];
        });

        showToast(`" ${product.name} " ajouté au panier! 🛒`);
        setIsCartOpen(true);
    };

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

    // Calculate Cart Totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = Math.round(subtotal * appliedDiscount);
    const cartTotal = subtotal - discountAmount;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const freeShippingPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

    /* ── Checkout Process ──────────────────── */

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!checkoutForm.name.trim()) errors.name = 'Nom complet requis';
        if (!checkoutForm.email.trim()) errors.email = 'Email requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email)) errors.email = 'Format email invalide';
        if (!checkoutForm.phone.trim()) errors.phone = 'Numéro de téléphone requis';
        else if (!PHONE_REGEX.test(checkoutForm.phone.replace(/\s/g, ''))) errors.phone = 'Format: +212XXXXXXXXX ou 06XXXXXXXX';
        if (!checkoutForm.address.trim()) errors.address = 'Adresse de livraison requise';
        else if (checkoutForm.address.trim().length < 10) errors.address = 'Veuillez saisir votre adresse complète avec ville';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const result = await API.orders.create({
                customer_name: checkoutForm.name,
                customer_email: checkoutForm.email,
                customer_phone: checkoutForm.phone,
                customer_address: checkoutForm.address,
                items: cart.map(i => ({
                    product_id: i.productId,
                    quantity: i.quantity,
                    size: i.size,
                    flocage: i.flocageName ? `${i.flocageName} #${i.flocageNumber}` : null
                }))
            });

            setOrderResult({ orderId: result.orderId, total: cartTotal });
            setCheckoutStep('success');
            setCart([]);
        } catch (error: any) {
            alert(error?.message || 'Erreur lors de la confirmation de votre commande.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-transparent pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-[#0B1528] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-widest font-display">Chargement de la Fiche Produit Officielle…</span>
                </div>
            </div>
        );
    }

    const sizes = (product.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim());
    const isWishlisted = wishlist.includes(product.id);
    const totalPrice = product.price + (flocageOption !== 'none' ? 40 : 0) + (addPatch ? 25 : 0);

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-24 text-white">

            {/* ── Toast Banner ──────────────────── */}
            {toastMessage && (
                <div className="fixed top-24 right-6 z-50 bg-[#002D62] text-white border border-[#D4AF37]/50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
                </div>
            )}

            {/* ── Breadcrumb Navigation ───────── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 mt-12">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-display uppercase tracking-wider">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-white transition-colors">Boutique Officielle</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#D4AF37] font-bold truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            {/* ── Main Product Detail Grid ────── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#0B1528]/90 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">

                    {/* Watermark Logo Backdrop */}
                    <div className="absolute right-[-40px] bottom-[-40px] w-96 h-96 opacity-10 pointer-events-none select-none">
                        <img src={ASSETS.logo} alt="" className="w-full h-full object-contain" />
                    </div>

                    {/* ── Left Column: Media & Visualiser (7 cols) ── */}
                    <div className="lg:col-span-7 space-y-6 relative z-10">

                        {/* Main Image Showcase */}
                        <div className="relative aspect-square sm:aspect-[4/3] bg-[#0E182A] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">

                            <img
                                src={product.image_url || '/Assets/bg2.jpg'}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-transform duration-700 ${activeView === 'back' && flocageOption !== 'none' ? 'brightness-50' : 'group-hover:scale-105'}`}
                            />

                            {/* Real-time Flocage Back Preview (Real Madrid Style) */}
                            {activeView === 'back' && flocageOption !== 'none' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center bg-[#001226]/85 backdrop-blur-xs p-6 border-4 border-[#D4AF37]/50">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] mb-2 font-display">US AMAL TIZNIT</span>
                                    <span className="text-4xl sm:text-6xl font-black font-display text-white tracking-widest drop-shadow-2xl uppercase mb-2">
                                        {flocageOption === 'player' ? selectedPlayerFlocage.name : (customName || 'VOTRE NOM')}
                                    </span>
                                    <span className="text-8xl sm:text-9xl font-black font-mono text-[#D4AF37] drop-shadow-2xl">
                                        {flocageOption === 'player' ? selectedPlayerFlocage.number : (customNumber || '10')}
                                    </span>
                                    <span className="mt-4 text-xs font-bold text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full uppercase font-display bg-amber-500/10">
                                        FLOCAGE OFFICIEL BOTOLA PRO 🇲🇦
                                    </span>
                                </div>
                            )}

                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                <span className="bg-[#002D62] border border-[#D4AF37]/50 text-white px-3 py-1 text-xs font-black uppercase tracking-widest rounded-xl font-display shadow-lg">
                                    {product.category}
                                </span>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl backdrop-blur-md">
                                    Produit 100% Officiel USAT
                                </span>
                            </div>

                            {/* Wishlist Button */}
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                className={`absolute top-4 right-4 z-10 p-3 rounded-full border transition-all ${isWishlisted
                                        ? 'bg-red-500 border-red-400 text-white shadow-xl'
                                        : 'bg-black/40 border-white/20 text-gray-300 hover:text-white hover:bg-black/60 backdrop-blur-md'
                                    }`}
                            >
                                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                            </button>
                        </div>

                        {/* View Controls */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setActiveView('front')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all border ${activeView === 'front'
                                        ? 'bg-[#002D62] text-white border-[#D4AF37]/50 shadow-lg'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Vue Face (Front)
                            </button>
                            <button
                                onClick={() => { setActiveView('back'); if (flocageOption === 'none') setFlocageOption('player'); }}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all border ${activeView === 'back'
                                        ? 'bg-[#002D62] text-white border-[#D4AF37]/50 shadow-lg'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                Vue Dos (Aperçu Flocage)
                            </button>
                        </div>
                    </div>

                    {/* ── Right Column: Configurator & Details (5 cols) ── */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-6 relative z-10">
                        <div>
                            {/* Stock & Rating */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={14} fill="currentColor" />
                                    ))}
                                    <span className="text-xs text-gray-400 font-bold ml-1 font-mono">(4.9/5 • 48 Avis Supporters)</span>
                                </div>
                                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${product.stock > 0 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
                                    {product.stock > 0 ? `En Stock (${product.stock} Dispos)` : 'Rupture De Stock'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white font-display leading-tight mb-3">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-4xl font-black text-amber-400 font-mono">
                                    {totalPrice} <span className="text-sm text-gray-400 font-bold">DH</span>
                                </span>
                                {flocageOption !== 'none' && (
                                    <span className="text-xs text-blue-400 font-bold uppercase bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 rounded-lg">
                                        +40 DH Flocage Inclus
                                    </span>
                                )}
                            </div>

                            {/* Short Description */}
                            <p className="text-xs text-gray-300 leading-relaxed mb-6">
                                {product.description || "Maillot officiel d'Ittihad Al-Riyadi Amal Tiznit confectionné en tissu respirant haute technologie pour un confort optimal sur le terrain et en tribune."}
                            </p>

                            {/* Size Selection */}
                            <div className="mb-6 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <label className="font-bold text-white uppercase tracking-wider font-display">Taille</label>
                                    <span className="text-blue-400 font-bold uppercase cursor-pointer hover:underline text-[10px]">Guide Des Tailles Pro</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {sizes.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={`px-5 py-3 text-xs font-bold font-mono uppercase rounded-xl border transition-all ${selectedSize === s
                                                    ? 'bg-[#002D62] text-white border-[#D4AF37] shadow-lg shadow-blue-900/40 scale-105'
                                                    : 'bg-[#0E182A] border-white/10 text-gray-300 hover:border-white/30'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Flocage Configurator Box */}
                            <div className="bg-[#0E182A] border border-white/10 p-5 rounded-2xl space-y-4 shadow-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase text-white font-display flex items-center gap-2">
                                        <Shirt size={16} className="text-[#D4AF37]" /> Personnaliser Votre Maillot (+40 DH)
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase font-display">
                                    {[
                                        { id: 'none', label: 'Sans Flocage' },
                                        { id: 'player', label: 'Joueur Pro' },
                                        { id: 'custom', label: 'Nom Perso' },
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setFlocageOption(opt.id as any); setActiveView('back'); }}
                                            className={`py-2.5 px-2 rounded-xl border text-center transition-all ${flocageOption === opt.id
                                                    ? 'bg-[#002D62] text-white border-[#D4AF37] shadow-md'
                                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Star Player Dropdown */}
                                {flocageOption === 'player' && (
                                    <div className="space-y-2 pt-1">
                                        <label className="text-[10px] font-bold uppercase text-gray-400">Sélectionner Le Joueur Officiel</label>
                                        <select
                                            value={`${selectedPlayerFlocage.name}-${selectedPlayerFlocage.number}`}
                                            onChange={e => {
                                                const [n, num] = e.target.value.split('-');
                                                setSelectedPlayerFlocage({ name: n, number: num, id: 0, pos: '' });
                                            }}
                                            className="w-full bg-[#0B1528] border border-white/15 rounded-xl p-3 text-xs text-white font-bold font-mono focus:outline-none focus:border-blue-500"
                                        >
                                            {SQUAD_STAR_PLAYERS.map(p => (
                                                <option key={p.number} value={`${p.name}-${p.number}`}>
                                                    #{p.number} - {p.name} ({p.pos})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Custom Name & Number Input */}
                                {flocageOption === 'custom' && (
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Nom (Max 12 Lettres)</label>
                                            <input
                                                type="text"
                                                maxLength={12}
                                                placeholder="EX: MOUAD"
                                                value={customName}
                                                onChange={e => setCustomName(e.target.value.toUpperCase())}
                                                className="w-full bg-[#0B1528] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-mono uppercase font-bold focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Numéro (1 à 99)</label>
                                            <input
                                                type="text"
                                                maxLength={2}
                                                placeholder="10"
                                                value={customNumber}
                                                onChange={e => setCustomNumber(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-[#0B1528] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Competition Patch Checkbox */}
                                <label className="flex items-center gap-2 pt-2 cursor-pointer border-t border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={addPatch}
                                        onChange={e => setAddPatch(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-white/20 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-gray-200">
                                        Ajouter le Patch Officiel Botola Pro (+25 DH) 🇲🇦
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Add to Cart CTA */}
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                className="w-full py-4 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl shadow-blue-900/50 flex items-center justify-center gap-3 font-display disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingBag size={20} className="text-[#D4AF37]" />
                                {product.stock > 0 ? 'Ajouter Au Panier Officiel' : 'Article Actuellement Épuisé'}
                            </button>

                            <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-400 font-medium">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
                                    <Truck size={16} className="text-amber-400 shrink-0" />
                                    <span>Expédié sous 24h/48h au Maroc</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
                                    <RotateCcw size={16} className="text-blue-400 shrink-0" />
                                    <span>Retour gratuit sous 14 jours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Accordion Description Tabs ── */}
                <div className="mt-12 bg-[#0B1528]/80 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
                    <div className="flex border-b border-white/10 gap-6 overflow-x-auto font-display text-xs uppercase tracking-wider mb-6">
                        {[
                            { id: 'desc', label: 'Description & Fiche Technique' },
                            { id: 'shipping', label: 'Livraison & Retours' },
                            { id: 'care', label: 'Entretien & Conseils' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setOpenAccordion(tab.id as any)}
                                className={`pb-3 font-bold transition-all border-b-2 whitespace-nowrap ${openAccordion === tab.id
                                        ? 'border-[#D4AF37] text-white'
                                        : 'border-transparent text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {openAccordion === 'desc' && (
                        <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
                            <p>
                                Le maillot officiel d'Ittihad Al-Riyadi Amal Tiznit 2025/2026 incarne la fierté, la passion et l'héritage de la ville de Tiznit. Conçu spécialement pour la Botola Pro avec des matériaux respirants haut de gamme.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-amber-400 block font-display">Spécifications Techniques</span>
                                    <p className="text-white font-bold">100% Polyester Recyclé High Performance</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-amber-400 block font-display">Écusson Officiel</span>
                                    <p className="text-white font-bold">Blason 3D Thermo-collé Haute Définition</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {openAccordion === 'shipping' && (
                        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                            <p>
                                🚚 <strong>Livraison Express :</strong> Votre commande est préparée et expédiée sous 24 à 48 heures ouvrables partout au Maroc via nos partenaires CTM et Amana.
                            </p>
                            <p>
                                💵 <strong>Paiement à la livraison :</strong> Réglez votre commande en toute sécurité au livreur dès réception de votre colis.
                            </p>
                        </div>
                    )}

                    {openAccordion === 'care' && (
                        <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
                            <p>• Lavage en machine à 30°C à l'envers</p>
                            <p>• Ne pas utiliser de javel ni de séchoir automatique</p>
                            <p>• Ne pas repasser directement sur le flocage ni sur les écussons</p>
                        </div>
                    )}
                </div>

                {/* ── Related Products Carousel ── */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-blue-400 font-bold text-xs uppercase tracking-widest font-display block mb-1">Collection USAT</span>
                                <h3 className="text-2xl font-black uppercase text-white font-display">Vous Aimerez Aussi</h3>
                            </div>
                            <Link to="/shop" className="text-xs font-bold uppercase text-amber-400 hover:underline font-display flex items-center gap-1">
                                Voir Toute La Boutique <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(rel => (
                                <div
                                    key={rel.id}
                                    onClick={() => navigate(`/shop/${rel.id}`)}
                                    className="bg-[#0B1528]/80 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-[#D4AF37]/50 transition-all group shadow-xl"
                                >
                                    <div className="aspect-square bg-[#0E182A] rounded-xl overflow-hidden mb-3">
                                        <img src={rel.image_url || '/Assets/bg2.jpg'} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <h4 className="font-bold text-white text-xs truncate mb-1">{rel.name}</h4>
                                    <span className="font-mono font-black text-amber-400 text-sm">{rel.price} DH</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Slide-Over Cart Drawer ───────── */}
            <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsCartOpen(false)}
                />

                <div className={`absolute top-0 right-0 w-full max-w-md h-full bg-[#0B1528] border-l border-white/10 shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col z-10`}>

                    {/* Drawer Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0E182A]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#002D62] border border-[#D4AF37]/40 rounded-xl text-[#D4AF37]">
                                <ShoppingBag size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-black uppercase text-white font-display">Mon Panier Officiel</h2>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{cartCount} Article{cartCount > 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Free Shipping Tracker */}
                    {cart.length > 0 && checkoutStep === 'cart' && (
                        <div className="bg-[#0E182A] border-b border-white/5 p-4 text-xs">
                            <div className="flex justify-between items-center mb-1.5 text-gray-300">
                                <span className="flex items-center gap-1.5">
                                    <Truck size={14} className="text-[#D4AF37]" />
                                    {freeShippingRemaining === 0 ? (
                                        <strong className="text-emerald-400">Livraison Gratuite Activée! 📦</strong>
                                    ) : (
                                        <>Ajoutez encore <strong className="text-amber-300 font-mono">{freeShippingRemaining} DH</strong> pour la livraison gratuite</>
                                    )}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-[#D4AF37] h-full transition-all duration-500"
                                    style={{ width: `${freeShippingPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {checkoutStep === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-4 text-emerald-400 shadow-xl">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase text-white font-display mb-1">Commande Validée!</h3>
                                <p className="text-gray-300 text-xs max-w-xs mb-6">Merci pour votre achat sur la boutique officielle USAT.</p>

                                {orderResult && (
                                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-3 text-xs">
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-gray-400 uppercase">Réf. Commande:</span>
                                            <strong className="text-white font-mono font-black">#{orderResult.orderId}</strong>
                                        </div>
                                        <div className="flex justify-between border-b border-white/10 pb-2">
                                            <span className="text-gray-400 uppercase">Montant Total:</span>
                                            <strong className="text-amber-400 font-mono font-black text-sm">{orderResult.total} DH</strong>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); setOrderResult(null); }}
                                    className="w-full py-3.5 bg-[#002D62] text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-blue-900 transition-colors font-display border border-[#D4AF37]/40"
                                >
                                    Continuer Mes Achats
                                </button>
                            </div>
                        ) : checkoutStep === 'details' ? (
                            <form id="checkout-form-details" onSubmit={handleCheckout} className="space-y-4 text-xs">
                                <div className="bg-[#002D62]/40 border border-[#D4AF37]/30 p-4 rounded-xl flex items-center justify-between text-blue-200">
                                    <span className="font-bold uppercase tracking-wider">Total à payer</span>
                                    <span className="text-lg font-black font-mono text-amber-300">{cartTotal} DH</span>
                                </div>

                                {[
                                    { key: 'name', label: 'Nom Complet', icon: User, type: 'text', placeholder: 'Ahmed El Mansouri' },
                                    { key: 'phone', label: 'Numéro Téléphone', icon: Smartphone, type: 'tel', placeholder: '+212 6XX XXX XXX' },
                                    { key: 'email', label: 'Adresse Email', icon: Mail, type: 'email', placeholder: 'ahmed@example.com' },
                                ].map(field => {
                                    const Icon = field.icon;
                                    return (
                                        <div key={field.key}>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">{field.label}</label>
                                            <div className="relative">
                                                <Icon className="absolute left-3 top-3 text-gray-500" size={16} />
                                                <input
                                                    required type={field.type}
                                                    className={`w-full pl-9 pr-4 py-2.5 bg-[#0E182A] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all ${formErrors[field.key] ? 'border-red-500' : 'border-white/10'}`}
                                                    value={(checkoutForm as any)[field.key]}
                                                    onChange={e => { setCheckoutForm({ ...checkoutForm, [field.key]: e.target.value }); setFormErrors(prev => ({ ...prev, [field.key]: '' })); }}
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                            {formErrors[field.key] && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{formErrors[field.key]}</span>}
                                        </div>
                                    );
                                })}

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Adresse de Livraison (Ville & Quartier)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-500" size={16} />
                                        <textarea
                                            required
                                            className={`w-full pl-9 pr-4 py-2.5 bg-[#0E182A] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all h-20 resize-none ${formErrors.address ? 'border-red-500' : 'border-white/10'}`}
                                            value={checkoutForm.address}
                                            onChange={e => { setCheckoutForm({ ...checkoutForm, address: e.target.value }); setFormErrors(prev => ({ ...prev, address: '' })); }}
                                            placeholder="Ex: Rue Al Massira, Tiznit 85000"
                                        />
                                    </div>
                                    {formErrors.address && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{formErrors.address}</span>}
                                </div>
                            </form>
                        ) : cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
                                <ShoppingBag size={48} className="opacity-20 mb-3 text-[#D4AF37]" />
                                <p className="text-sm font-medium text-white">Votre panier est vide</p>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="mt-4 px-6 py-2.5 bg-[#002D62] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-900 transition-colors font-display border border-[#D4AF37]/40"
                                >
                                    Parcourir La Boutique
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl relative group">
                                        <img src={item.image_url || '/Assets/bg2.jpg'} className="w-16 h-20 object-cover rounded-xl bg-gray-900 border border-white/10 shrink-0" alt={item.name} />

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-xs truncate leading-snug">{item.name}</h4>
                                            <div className="flex flex-wrap gap-1.5 my-1 text-[10px]">
                                                <span className="bg-white/10 text-gray-300 font-mono font-bold px-2 py-0.5 rounded">Taille: {item.size}</span>
                                                {item.flocageName && (
                                                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                                                        {item.flocageName} #{item.flocageNumber}
                                                    </span>
                                                )}
                                                {item.hasPatch && (
                                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                                                        Patch 🇲🇦
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-black text-amber-400 text-sm font-mono">{item.price * item.quantity} DH</span>
                                                <div className="flex items-center gap-2 bg-[#0E182A] border border-white/10 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(index, -1)} className="p-0.5 text-gray-400 hover:text-white"><Minus size={12} /></button>
                                                    <span className="text-xs font-bold text-white font-mono w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(index, 1)} className="p-0.5 text-gray-400 hover:text-white"><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => removeFromCart(index)} className="p-1 text-gray-500 hover:text-red-400 transition-colors self-start">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Drawer Footer */}
                    {checkoutStep !== 'success' && cart.length > 0 && (
                        <div className="p-6 border-t border-white/10 bg-[#0E182A] space-y-3">
                            {checkoutStep === 'cart' ? (
                                <>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Sous-total</span>
                                            <span className="font-mono">{subtotal} DH</span>
                                        </div>
                                        <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/5">
                                            <span>Total Général</span>
                                            <span className="text-xl font-black text-amber-400 font-mono">{cartTotal} DH</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setCheckoutStep('details')}
                                        className="w-full py-3.5 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/40 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 font-display"
                                    >
                                        Passer La Commande <ArrowRight size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setCheckoutStep('cart')}
                                        className="px-5 py-3 border border-white/10 text-gray-300 font-bold uppercase text-xs rounded-xl hover:bg-white/5 transition-colors font-display"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        form="checkout-form-details"
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-wider rounded-xl disabled:opacity-60 transition-colors shadow-lg font-display flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Validation...' : 'Confirmer Commande (COD)'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopDetails;

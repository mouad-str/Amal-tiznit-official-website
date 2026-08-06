import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    ShoppingBag, 
    Search, 
    X, 
    Plus, 
    Minus, 
    Trash2, 
    CheckCircle2, 
    Smartphone, 
    MapPin, 
    Mail, 
    User, 
    ChevronDown, 
    Package, 
    Heart, 
    ShieldCheck, 
    Truck, 
    Sparkles, 
    Tag, 
    Shirt, 
    Award,
    Eye,
    ArrowRight,
    Check,
    HelpCircle
} from 'lucide-react';
import { API, Product } from '../api';
import { ASSETS } from '../constants';
import Modal from '../components/Modal';

/* ── Types ─────────────────────────────────── */

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

type SortOption = 'default' | 'price-asc' | 'price-desc';

const SQUAD_STAR_PLAYERS = [
    { name: 'CHAHBOUN', number: '10' },
    { name: 'EL AMRAOUI', number: '7' },
    { name: 'BAHBAH', number: '9' },
    { name: 'BENALI', number: '8' },
    { name: 'TOURI', number: '1' }
];

/* ── Cart & Wishlist persistence helpers ────── */

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

/* ── Constants ─────────────────────────────── */

const ITEMS_PER_PAGE = 9;
const FREE_SHIPPING_THRESHOLD = 400; // DH
const PHONE_REGEX = /^(\+212|0)[5-7]\d{8}$/;

/* ── Component ─────────────────────────────── */

const Shop: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0); // percentage 0.10 = 10%
    const [discountError, setDiscountError] = useState('');

    // Wishlist State
    const [wishlist, setWishlist] = useState<number[]>(loadWishlist);

    // Toast Notification
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    // Pagination
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Product Detail Modal & Customization
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [flocageOption, setFlocageOption] = useState<'none' | 'player' | 'custom'>('none');
    const [selectedPlayerFlocage, setSelectedPlayerFlocage] = useState(SQUAD_STAR_PLAYERS[0]);
    const [customName, setCustomName] = useState('');
    const [customNumber, setCustomNumber] = useState('');
    const [addPatch, setAddPatch] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Checkout Form
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', email: '', address: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderId: number; total: number } | null>(null);

    /* ── Data Fetching ───────────────────────── */

    useEffect(() => {
        document.title = "Boutique Officielle | US Amal Tiznit (USAT)";
        API.shop.getAll()
            .then(setProducts)
            .catch(() => console.error('Failed to fetch shop products'))
            .finally(() => setLoading(false));
    }, []);

    /* ── Persistence ─────────────────────────── */

    useEffect(() => { saveCart(cart); }, [cart]);
    useEffect(() => { saveWishlist(wishlist); }, [wishlist]);

    /* ── Scroll Lock Management ─────────────── */

    useEffect(() => {
        if (isCartOpen || selectedProduct) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCartOpen, selectedProduct]);

    /* ── Toast Helper ────────────────────────── */

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    /* ── Wishlist Toggle ─────────────────────── */

    const toggleWishlist = (productId: number) => {
        setWishlist(prev => {
            const exists = prev.includes(productId);
            const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
            showToast(exists ? "Retiré de vos favoris" : "Ajouté à vos favoris ❤️");
            return updated;
        });
    };

    /* ── Cart Actions ───────────────────────── */

    const addToCart = useCallback((
        product: Product, 
        size: string, 
        flocageName?: string, 
        flocageNumber?: string, 
        hasPatch?: boolean
    ) => {
        if (product.stock <= 0) return;

        let extraPrice = 0;
        if (flocageName || flocageNumber) extraPrice += 30; // 30 DH Flocage
        if (hasPatch) extraPrice += 20; // 20 DH Patch

        setCart(prev => {
            const key = `${product.id}-${size}-${flocageName || ''}-${flocageNumber || ''}-${hasPatch ? 'P' : 'N'}`;
            const existing = prev.find(i => `${i.productId}-${i.size}-${i.flocageName || ''}-${i.flocageNumber || ''}-${i.hasPatch ? 'P' : 'N'}` === key);
            
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
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
                size,
                flocageName,
                flocageNumber,
                hasPatch,
                stock: product.stock
            }];
        });

        showToast(`" ${product.name} " ajouté au panier! 🛒`);
        setIsCartOpen(true);
    }, []);

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

    // Calculation Totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = Math.round(subtotal * appliedDiscount);
    const cartTotal = subtotal - discountAmount;
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const freeShippingPercent = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));

    /* ── Promo Code Handler ────────────────── */

    const handleApplyPromo = (e: React.FormEvent) => {
        e.preventDefault();
        const code = promoCode.trim().toUpperCase();
        if (code === 'AMAL10' || code === 'USAT2026' || code === 'SUPPORTER') {
            setAppliedDiscount(0.10); // 10%
            setDiscountError('');
            showToast('Code Promo appliqué : 10% de réduction! 🎉');
        } else {
            setDiscountError('Code promo invalide (Essayer: AMAL10)');
        }
    };

    /* ── Checkout Process ──────────────────── */

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!checkoutForm.name.trim()) errors.name = 'Nom complet requis';
        if (!checkoutForm.email.trim()) errors.email = 'Email requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email)) errors.email = 'Format email invalide';
        if (!checkoutForm.phone.trim()) errors.phone = 'Numéro de téléphone requis';
        else if (!PHONE_REGEX.test(checkoutForm.phone.replace(/\s/g, ''))) errors.phone = 'Format: +212XXXXXXXXX ou 06XXXXXXXX';
        if (!checkoutForm.address.trim()) errors.address = 'Adresse de livraison requise';
        else if (checkoutForm.address.trim().length < 10) errors.address = 'Veuillez saisir une adresse complète avec ville';
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
            alert(error?.message || 'Erreur lors de la confirmation de votre commande. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Filtering & Sorting Logic ──────────── */

    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        return result;
    }, [products, selectedCategory, priceRange, searchTerm, sortBy]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    /* ── Helpers ────────────────────────────── */

    const getSizes = (product: Product) => (product.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim());
    const getDefaultSize = (product: Product) => {
        const sizes = getSizes(product);
        return sizes.includes('M') ? 'M' : sizes[0];
    };

    const handleOpenProductModal = (product: Product) => {
        setSelectedProduct(product);
        setSelectedSize(getDefaultSize(product));
        setFlocageOption('none');
        setCustomName('');
        setCustomNumber('');
        setAddPatch(false);
        setActiveImageIndex(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-[#0B1528]/80 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
                    <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-300 text-sm font-bold uppercase tracking-widest font-display">Chargement de la Boutique Officielle USAT…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-24 text-white">
            
            {/* ── Toast Notification Banner ───── */}
            {toastMessage && (
                <div className="fixed top-24 right-6 z-50 bg-[#002D62] text-white border border-[#D4AF37]/50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
                </div>
            )}

            {/* ── Hero Showcase Section ────────── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                    {/* Background Art */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#001226] via-[#001226]/80 to-transparent z-10" />
                    <img 
                        src="/Assets/bg.jpg" 
                        alt="Boutique USAT Hero" 
                        className="w-full h-[380px] sm:h-[460px] object-cover object-center brightness-75 group-hover:scale-105 transition-transform duration-1000"
                    />

                    {/* Watermark Logo */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-96 h-96 opacity-10 pointer-events-none z-10 hidden lg:block">
                        <img src={ASSETS.logo} alt="" className="w-full h-full object-contain" />
                    </div>

                    {/* Hero Content */}
                    <div className="absolute inset-0 z-20 p-8 sm:p-14 flex flex-col justify-center max-w-2xl">
                        <div className="flex items-center space-x-3 mb-3">
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold uppercase tracking-widest font-display flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Collection Officielle 2025/2026
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-none font-display mb-4">
                            Portez La <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Fierté De Tiznit</span>
                        </h1>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                            Découvrez la boutique officielle d'Ittihad Al-Riyadi Amal Tiznit. Maillots de match originaux, tenue d'entraînement pro et accessoires personnalisés avec flocage officiel Botola.
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/40 flex items-center gap-2"
                            >
                                <Shirt size={16} /> Explorer la Collection
                            </button>

                            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-gray-300 font-semibold">100% Produits Authentiques</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Guarantees Bar ───────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                        { icon: Truck, title: "Livraison 48h", desc: "Partout au Maroc (CTM/Amana)" },
                        { icon: Shirt, title: "Flocage Personnalisé", desc: "Nom & Numéro Officiels Joueurs" },
                        { icon: ShieldCheck, title: "100% Produits Officiels", desc: "Directement issus du Club USAT" },
                        { icon: Award, title: "Paiement Sécurisé", desc: "Carte bancaire ou à la livraison" },
                    ].map((g, idx) => {
                        const IconComponent = g.icon;
                        return (
                            <div key={idx} className="bg-[#0B1528]/80 border border-white/10 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md">
                                <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                                    <IconComponent size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-white font-display">{g.title}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{g.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Main Store Container ────────── */}
            <div id="shop-grid" className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* ── Filter & Search Toolbar ────── */}
                <div className="mb-8 bg-[#0B1528]/90 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher maillot, veste, casquette..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                                className="w-full bg-[#0E182A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        {/* Sorting Dropdown */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider hidden sm:inline-block">Trier Par:</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none bg-[#0E182A] border border-white/10 rounded-xl px-4 py-3 pr-10 text-xs text-white font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="default">Sélection Club</option>
                                    <option value="price-asc">Prix: Croissant</option>
                                    <option value="price-desc">Prix: Décroissant</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {categories.map(cat => {
                                const active = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setVisibleCount(ITEMS_PER_PAGE); }}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex-shrink-0 whitespace-nowrap border ${
                                            active
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                                                : 'bg-[#0E182A] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {cat === 'All' ? 'Tous les Produits' : cat}
                                    </button>
                                );
                            })}
                        </div>

                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 hidden md:block">
                            {filteredProducts.length} Article{filteredProducts.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* ── Product Showcase Grid ──────── */}
                {visibleProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#0B1528]/80 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <h4 className="text-xl font-bold text-white mb-2">Aucun produit ne correspond à votre recherche</h4>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Vérifiez vos termes de recherche ou réinitialisez les filtres de la boutique.</p>
                        <button
                            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); setPriceRange([0, 1000]); setSortBy('default'); }}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
                        >
                            Réinitialiser la boutique
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visibleProducts.map(product => {
                            const isOutOfStock = product.stock <= 0;
                            const isWishlisted = wishlist.includes(product.id);
                            const sizes = getSizes(product);

                            return (
                                <div 
                                    key={product.id} 
                                    className="group bg-[#0B1528]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-blue-500/40 transition-all duration-300 flex flex-col backdrop-blur-xl relative"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/5] bg-[#0E182A] overflow-hidden cursor-pointer" onClick={() => handleOpenProductModal(product)}>
                                        <img 
                                            src={product.image_url || '/Assets/bg2.jpg'} 
                                            alt={product.name} 
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                                        />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        {/* Top Badges */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                                            <span className="bg-blue-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md font-display">
                                                {product.category}
                                            </span>
                                            {product.id % 2 === 0 && (
                                                <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md font-display flex items-center gap-1">
                                                    <Sparkles size={10} /> Pro Match
                                                </span>
                                            )}
                                        </div>

                                        {/* Wishlist Heart Button */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                            className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border transition-all ${
                                                isWishlisted 
                                                    ? 'bg-red-500 border-red-400 text-white' 
                                                    : 'bg-black/40 border-white/20 text-gray-300 hover:text-white hover:bg-black/60 backdrop-blur-md'
                                            }`}
                                        >
                                            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                                        </button>

                                        {/* Stock Out Overlay Badge */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                                                <span className="bg-red-600 text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl font-display shadow-2xl border border-red-500">
                                                    Rupture De Stock
                                                </span>
                                            </div>
                                        )}

                                        {/* Quick View Button on Hover */}
                                        <div className="absolute bottom-4 left-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:block">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleOpenProductModal(product); }}
                                                className="w-full py-2.5 bg-white/90 hover:bg-white text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xl flex items-center justify-center gap-2 backdrop-blur-md"
                                            >
                                                <Eye size={14} /> Aperçu Rapide
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h3 
                                                onClick={() => handleOpenProductModal(product)}
                                                className="text-base font-bold text-white mb-2 leading-snug cursor-pointer hover:text-blue-400 transition-colors line-clamp-2"
                                            >
                                                {product.name}
                                            </h3>
                                            
                                            {/* Size Chips Preview */}
                                            <div className="flex items-center gap-1.5 my-2">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Tailles:</span>
                                                {sizes.map(s => (
                                                    <span key={s} className="text-[10px] font-mono text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price & Action Row */}
                                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-black text-white font-mono tabular-nums">
                                                    {product.price} <span className="text-xs text-amber-400 font-bold">DH</span>
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => addToCart(product, getDefaultSize(product))}
                                                disabled={isOutOfStock}
                                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                                            >
                                                <ShoppingBag size={14} />
                                                <span className="hidden sm:inline">Ajouter</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                            className="px-8 py-3.5 bg-[#0B1528] border border-white/15 text-white font-bold uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all shadow-xl font-display"
                        >
                            Charger Plus De Produits
                        </button>
                    </div>
                )}
            </div>

            {/* ── Slide-Over Cart Drawer ───────── */}
            <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
                    onClick={() => setIsCartOpen(false)} 
                />
                
                {/* Drawer Container */}
                <div className={`absolute top-0 right-0 w-full max-w-md h-full bg-[#0B1528] border-l border-white/10 shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col z-10`}>
                    
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0E182A]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
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
                                    <Truck size={14} className="text-amber-400" />
                                    {freeShippingRemaining === 0 ? (
                                        <strong className="text-emerald-400">Félicitations! Vous bénéficiez de la Livraison Gratuite 📦</strong>
                                    ) : (
                                        <>Plus que <strong className="text-amber-400 font-mono">{freeShippingRemaining} DH</strong> pour la livraison gratuite</>
                                    )}
                                </span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-amber-400 h-full transition-all duration-500" 
                                    style={{ width: `${freeShippingPercent}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Drawer Body Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        
                        {/* STEP 3: SUCCESS CONFIRMATION */}
                        {checkoutStep === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-4 text-emerald-400 shadow-xl">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase text-white font-display mb-1">Commande Validée!</h3>
                                <p className="text-gray-300 text-xs max-w-xs mb-6">Votre commande a été enregistrée avec succès. Notre équipe du club préparera votre colis sous peu.</p>

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
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 uppercase">Mode de Paiement:</span>
                                            <strong className="text-emerald-400">Paiement à la livraison (COD)</strong>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); setOrderResult(null); }}
                                    className="w-full py-3.5 bg-blue-600 text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 font-display"
                                >
                                    Continuer Mes Achats Sur La Boutique
                                </button>
                            </div>

                        /* STEP 2: CHECKOUT DETAILS FORM */
                        ) : checkoutStep === 'details' ? (
                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 text-xs">
                                <div className="bg-blue-600/20 border border-blue-500/40 p-4 rounded-xl flex items-center justify-between text-blue-300">
                                    <span className="font-bold uppercase tracking-wider">Total à payer</span>
                                    <span className="text-lg font-black font-mono text-white">{cartTotal} DH</span>
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
                                            placeholder="Ex: Rue Al Massira, Quartier Omrane, Tiznit 85000"
                                        />
                                    </div>
                                    {formErrors.address && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{formErrors.address}</span>}
                                </div>
                            </form>

                        /* STEP 1: CART ITEMS LIST */
                        ) : cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
                                <ShoppingBag size={48} className="opacity-20 mb-3" />
                                <p className="text-sm font-medium">Votre panier est actuellement vide</p>
                                <p className="text-xs text-gray-500 mt-1 mb-4">Découvrez les derniers maillots et articles du club.</p>
                                <button 
                                    onClick={() => setIsCartOpen(false)} 
                                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-500 transition-colors"
                                >
                                    Explorer La Boutique
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
                                                
                                                {/* Stepper */}
                                                <div className="flex items-center gap-2 bg-[#0E182A] border border-white/10 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(index, -1)} className="p-0.5 text-gray-400 hover:text-white"><Minus size={12} /></button>
                                                    <span className="text-xs font-bold text-white font-mono w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(index, 1)} className="p-0.5 text-gray-400 hover:text-white"><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => removeFromCart(index)} 
                                            className="p-1 text-gray-500 hover:text-red-400 transition-colors self-start"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* Promo Code Box */}
                                <form onSubmit={handleApplyPromo} className="pt-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Code Promo (ex: AMAL10)"
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value)}
                                            className="flex-1 bg-[#0E182A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-colors">
                                            Appliquer
                                        </button>
                                    </div>
                                    {discountError && <p className="text-[10px] text-red-400 mt-1">{discountError}</p>}
                                </form>
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
                                        {appliedDiscount > 0 && (
                                            <div className="flex justify-between text-emerald-400">
                                                <span>Remise Code Promo (10%)</span>
                                                <span className="font-mono">-{discountAmount} DH</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/5">
                                            <span>Total Général</span>
                                            <span className="text-xl font-black text-amber-400 font-mono">{cartTotal} DH</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setCheckoutStep('details')} 
                                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 font-display"
                                    >
                                        Passer La Commande <ArrowRight size={16} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setCheckoutStep('cart')} 
                                        className="px-5 py-3 border border-white/10 text-gray-300 font-bold uppercase text-xs rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button 
                                        form="checkout-form" 
                                        type="submit" 
                                        disabled={isSubmitting} 
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs tracking-wider rounded-xl disabled:opacity-60 transition-colors shadow-lg shadow-emerald-600/30 font-display flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Validation En Cours…' : 'Confirmer La Commande (COD)'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Product Detail & Customization Modal ── */}
            {selectedProduct && (
                <Modal
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    title={selectedProduct.name}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700">
                        
                        {/* Image Showcase */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative">
                                <img 
                                    src={selectedProduct.image_url || '/Assets/bg2.jpg'} 
                                    alt={selectedProduct.name} 
                                    className="w-full h-full object-cover"
                                />

                                {/* Live Flocage Preview Overlay for Jerseys */}
                                {(flocageOption !== 'none') && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center bg-black/20 backdrop-blur-xs">
                                        <span className="text-3xl sm:text-4xl font-black font-display text-white tracking-widest drop-shadow-md uppercase">
                                            {flocageOption === 'player' ? selectedPlayerFlocage.name : (customName || 'VOTRE NOM')}
                                        </span>
                                        <span className="text-6xl sm:text-7xl font-black font-mono text-amber-400 drop-shadow-md">
                                            {flocageOption === 'player' ? selectedPlayerFlocage.number : (customNumber || '10')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Configurator & Details */}
                        <div className="space-y-6 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-[#002D62] uppercase tracking-wider font-display">
                                        {selectedProduct.category}
                                    </span>
                                    <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${selectedProduct.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {selectedProduct.stock > 0 ? `En Stock (${selectedProduct.stock})` : 'Rupture'}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-black text-[#002D62] uppercase leading-tight font-display mb-2">
                                    {selectedProduct.name}
                                </h2>

                                <div className="text-3xl font-black text-[#002D62] font-mono mb-4">
                                    {selectedProduct.price + (flocageOption !== 'none' ? 30 : 0) + (addPatch ? 20 : 0)} <span className="text-sm text-slate-500 font-bold">DH</span>
                                </div>

                                {selectedProduct.description && (
                                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                                        {selectedProduct.description}
                                    </p>
                                )}

                                {/* Size Selector */}
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-[#002D62] uppercase tracking-wider block mb-2 font-display">
                                        Choisir la Taille
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {getSizes(selectedProduct).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setSelectedSize(s)}
                                                className={`px-4 py-2 text-xs font-bold uppercase rounded-xl border transition-all ${
                                                    selectedSize === s
                                                        ? 'bg-[#002D62] text-white border-[#002D62] shadow-md'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Jersey Flocage Customization Section (For Jerseys/Shirts) */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase text-[#002D62] font-display flex items-center gap-1.5">
                                            <Shirt size={16} className="text-[#D4AF37]" /> Personnalisation Flocage (+30 DH)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase">
                                        {[
                                            { id: 'none', label: 'Sans Flocage' },
                                            { id: 'player', label: 'Joueur Pro' },
                                            { id: 'custom', label: 'Nom Perso' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFlocageOption(opt.id as any)}
                                                className={`py-2 px-2 rounded-lg border text-center transition-all ${
                                                    flocageOption === opt.id
                                                        ? 'bg-[#002D62] text-white border-[#002D62]'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Star Player Dropdown */}
                                    {flocageOption === 'player' && (
                                        <div className="space-y-2 pt-2">
                                            <label className="text-[10px] font-bold uppercase text-slate-500">Choisir le Joueur Officiel</label>
                                            <select
                                                value={`${selectedPlayerFlocage.name}-${selectedPlayerFlocage.number}`}
                                                onChange={e => {
                                                    const [n, num] = e.target.value.split('-');
                                                    setSelectedPlayerFlocage({ name: n, number: num });
                                                }}
                                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600"
                                            >
                                                {SQUAD_STAR_PLAYERS.map(p => (
                                                    <option key={p.number} value={`${p.name}-${p.number}`}>
                                                        #{p.number} - {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Custom Name & Number Input */}
                                    {flocageOption === 'custom' && (
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nom (max 12)</label>
                                                <input
                                                    type="text"
                                                    maxLength={12}
                                                    placeholder="EX: MOUAD"
                                                    value={customName}
                                                    onChange={e => setCustomName(e.target.value.toUpperCase())}
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-blue-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Numéro (1-99)</label>
                                                <input
                                                    type="text"
                                                    maxLength={2}
                                                    placeholder="10"
                                                    value={customNumber}
                                                    onChange={e => setCustomNumber(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Official Patch Checkbox */}
                                    <label className="flex items-center gap-2 pt-2 cursor-pointer border-t border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={addPatch}
                                            onChange={e => setAddPatch(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-slate-700">
                                            Ajouter le Patch Officiel Botola Pro (+20 DH) 🇲🇦
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Modal Action Button */}
                            <button
                                onClick={() => {
                                    const fName = flocageOption === 'player' ? selectedPlayerFlocage.name : (flocageOption === 'custom' ? customName : undefined);
                                    const fNum = flocageOption === 'player' ? selectedPlayerFlocage.number : (flocageOption === 'custom' ? customNumber : undefined);

                                    addToCart(
                                        selectedProduct, 
                                        selectedSize || getDefaultSize(selectedProduct),
                                        fName,
                                        fNum,
                                        addPatch
                                    );
                                    setSelectedProduct(null);
                                }}
                                disabled={selectedProduct.stock <= 0}
                                className="w-full py-4 bg-[#002D62] hover:bg-blue-900 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 font-display"
                            >
                                <ShoppingBag size={18} />
                                {selectedProduct.stock > 0 ? 'Ajouter Au Panier' : 'Actuellement Indisponible'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Shop;

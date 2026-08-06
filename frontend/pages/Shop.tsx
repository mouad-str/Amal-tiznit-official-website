import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
    HelpCircle,
    SlidersHorizontal,
    Star,
    Zap,
    RotateCcw,
    Lock
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

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'popular' | 'newest';
type GenderFilter = 'All' | 'Homme' | 'Femme' | 'Enfant';

const SQUAD_STAR_PLAYERS = [
    { id: 1, name: 'CHAHBOUN', number: '10', pos: 'Milieu offensif', avatar: '/Assets/bg2.jpg' },
    { id: 2, name: 'EL AMRAOUI', number: '7', pos: 'Attaquant', avatar: '/Assets/bg2.jpg' },
    { id: 3, name: 'BAHBAH', number: '9', pos: 'Avant-centre', avatar: '/Assets/bg2.jpg' },
    { id: 4, name: 'BENALI', number: '8', pos: 'Milieu', avatar: '/Assets/bg2.jpg' },
    { id: 5, name: 'TOURI', number: '1', pos: 'Gardien', avatar: '/Assets/bg2.jpg' }
];

/* ── Persistence Helpers ───────────────────── */

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

const ITEMS_PER_PAGE = 12;
const FREE_SHIPPING_THRESHOLD = 500; // DH
const PHONE_REGEX = /^(\+212|0)[5-7]\d{8}$/;

/* ── Component ─────────────────────────────── */

const Shop: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0); // 0.10 = 10%
    const [discountError, setDiscountError] = useState('');

    // Wishlist State
    const [wishlist, setWishlist] = useState<number[]>(loadWishlist);

    // Toast Notification
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Filter States (Real Madrid Store Style)
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedGender, setSelectedGender] = useState<GenderFilter>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
    const [onlyInStock, setOnlyInStock] = useState(false);

    // Pagination
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Product Detail Modal & Customization (Real Madrid Kit Configurator)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [flocageOption, setFlocageOption] = useState<'none' | 'player' | 'custom'>('none');
    const [selectedPlayerFlocage, setSelectedPlayerFlocage] = useState(SQUAD_STAR_PLAYERS[0]);
    const [customName, setCustomName] = useState('');
    const [customNumber, setCustomNumber] = useState('');
    const [addPatch, setAddPatch] = useState(false);
    const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

    // Checkout Form
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', email: '', address: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderId: number; total: number } | null>(null);

    /* ── Fetch Products ─────────────────────── */

    useEffect(() => {
        document.title = "Boutique Officielle Real Style | US Amal Tiznit";
        API.shop.getAll()
            .then(data => setProducts(data))
            .catch(() => console.error('Failed to fetch shop products'))
            .finally(() => setLoading(false));
    }, []);

    /* ── Persistence Sync ───────────────────── */

    useEffect(() => { saveCart(cart); }, [cart]);
    useEffect(() => { saveWishlist(wishlist); }, [wishlist]);

    /* ── Body Overflow Lock Cleanup ─────────── */

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

    /* ── Add To Cart Handler ────────────────── */

    const addToCart = useCallback((
        product: Product, 
        size: string, 
        flocageName?: string, 
        flocageNumber?: string, 
        hasPatch?: boolean
    ) => {
        if (product.stock <= 0) return;

        let extraPrice = 0;
        if (flocageName || flocageNumber) extraPrice += 40; // 40 DH Official Flocage
        if (hasPatch) extraPrice += 25; // 25 DH Patch Botola Pro

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

    // Calculate Totals
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
        if (code === 'HALAAMAL' || code === 'AMAL10' || code === 'USAT2026') {
            setAppliedDiscount(0.10); // 10%
            setDiscountError('');
            showToast('Code Promo Valide : 10% de réduction appliquée! 🎉');
        } else {
            setDiscountError('Code invalide (Essayer: AMAL10)');
        }
    };

    /* ── Checkout Submit ───────────────────── */

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

    /* ── Filter & Sort Logic ────────────────── */

    const categories = useMemo(() => ['All', 'Maillots', 'Entraînement', 'Accessoires', 'Goodies'], []);

    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            if (selectedCategory !== 'All' && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
                if (selectedCategory === 'Maillots' && !p.name.toLowerCase().includes('maillot')) return false;
                if (selectedCategory === 'Entraînement' && !p.name.toLowerCase().includes('entraîn') && !p.name.toLowerCase().includes('veste')) return false;
                if (selectedCategory === 'Accessoires' && !p.name.toLowerCase().includes('casquette') && !p.name.toLowerCase().includes('écharpe')) return false;
            }
            if (onlyInStock && p.stock <= 0) return false;
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        });

        if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'newest') result.sort((a, b) => b.id - a.id);
        return result;
    }, [products, selectedCategory, onlyInStock, priceRange, searchTerm, sortBy]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProducts.length;

    /* ── Helpers ────────────────────────────── */

    const getSizes = (product: Product) => (product.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim());
    const getDefaultSize = (product: Product) => {
        const sizes = getSizes(product);
        return sizes.includes('M') ? 'M' : sizes[0];
    };

    const handleOpenProductModal = (product: Product) => {
        navigate(`/shop/${product.id}`);
    };

    const handleSelectPlayerFromShopByPlayer = (player: typeof SQUAD_STAR_PLAYERS[0]) => {
        // Find main home jersey
        const homeJersey = products.find(p => p.name.toLowerCase().includes('maillot') || p.name.toLowerCase().includes('domicile')) || products[0];
        if (homeJersey) {
            setSelectedProduct(homeJersey);
            setSelectedSize(getDefaultSize(homeJersey));
            setFlocageOption('player');
            setSelectedPlayerFlocage(player);
            setActiveTab('back');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#040914] pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-[#0B1528] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-widest font-display">Chargement du Superstore Officiel USAT…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-20 pb-24 mt-12 text-white overflow-x-hidden">
            
            {/* ── Toast Notification Banner ───── */}
            {toastMessage && (
                <div className="fixed top-24 right-6 z-50 bg-[#002D62] text-white border border-[#D4AF37]/50 px-5 py-3  rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up ">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
                </div>
            )}

            {/* ── 1. Top Real Madrid Style Announcement Ticker Bar ───── */}
            <div className="bg-gradient-to-r from-[#001938] via-[#002D62] to-[#001938] border-b border-[#D4AF37]/30 text-[11px] font-display uppercase tracking-widest py-2.5 text-center text-gray-200">
                <div className="container mx-auto px-4 flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <Truck size={14} className="text-[#D4AF37]" /> LIVRAISON EN 48H PARTOUT AU MAROC
                    </span>
                    <span className="hidden md:inline text-gray-500">•</span>
                    <span className="hidden md:flex items-center gap-1.5 text-gray-200">
                        <Shirt size={14} className="text-blue-400" /> FLOCAGE OFFICIEL JOUEURS DISPONIBLE
                    </span>
                    <span className="hidden lg:inline text-gray-500">•</span>
                    <span className="hidden lg:flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck size={14} className="text-emerald-400" /> 100% PRODUITS AUTHENTIQUES US AMAL TIZNIT
                    </span>
                </div>
            </div>

            {/* ── 2. Real Madrid Department Navigation Sub-Bar ───── */}
            <div className="sticky top-16 z-30 bg-[#0B1528]/95 backdrop-blur-xl border-b border-white/10 shadow-xl py-3">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    
                    {/* Categories Nav */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none font-display uppercase text-xs tracking-wider">
                        {categories.map(cat => {
                            const active = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => { setSelectedCategory(cat); setVisibleCount(ITEMS_PER_PAGE); }}
                                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap font-bold ${
                                        active 
                                            ? 'bg-[#002D62] text-white border border-[#D4AF37]/50 shadow-md shadow-blue-900/50' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {cat === 'All' ? 'Tous Les Articles' : cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Cart Trigger */}
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="px-4 py-2 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/40 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-lg"
                    >
                        <ShoppingBag size={16} className="text-[#D4AF37]" />
                        <span className="hidden sm:inline">Mon Panier</span>
                        <span className="bg-[#D4AF37] text-slate-950 font-black px-2 py-0.5 rounded-full font-mono text-[11px]">
                            {cartCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* ── 3. Real Madrid Superstore Hero Banner ───── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-8">
                <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl group min-h-[420px] flex items-center">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#040914] via-[#040914]/85 to-transparent z-10" />
                    <img 
                        src="/Assets/bg.jpg" 
                        alt="Real Madrid Style Banner USAT" 
                        className="absolute inset-0 w-full h-full object-cover object-center brightness-75 group-hover:scale-105 transition-transform duration-1000"
                    />

                    {/* Transparent Watermark Logo */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-96 h-96 opacity-15 pointer-events-none z-10 hidden lg:block">
                        <img src={ASSETS.logo} alt="" className="w-full h-full object-contain" />
                    </div>

                    {/* Content */}
                    <div className="relative z-20 p-8 sm:p-14 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold font-display uppercase tracking-widest mb-4">
                            <Sparkles size={14} className="text-[#D4AF37]" /> Boutique Officielle Botola Pro 25/26
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-none font-display mb-4">
                            SUPERSTORE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-[#D4AF37]">
                                US AMAL TIZNIT
                            </span>
                        </h1>

                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                            Découvrez la nouvelle collection de maillots officiels Domicile & Extérieur. Personnalisez votre tenue avec le nom et numéro officiel de vos joueurs préférés.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => document.getElementById('shop-collection')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-gradient-to-r from-[#002D62] to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-black uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl shadow-blue-900/50 flex items-center gap-2 font-display border border-[#D4AF37]/40"
                            >
                                <Shirt size={18} className="text-[#D4AF37]" /> Maillot Domicile 2025/26
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 4. SHOP BY PLAYER SECTION (Real Madrid Style) ───── */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <span className="text-blue-400 font-bold text-xs uppercase tracking-widest font-display block mb-1">Personnalisation Officielle</span>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-display">
                            Acheter Par Joueur
                        </h2>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:inline-block font-semibold">Cliquez pour commander le maillot d'un joueur</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {SQUAD_STAR_PLAYERS.map(player => (
                        <div 
                            key={player.id}
                            onClick={() => handleSelectPlayerFromShopByPlayer(player)}
                            className="group bg-[#0B1528]/80 border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl relative overflow-hidden backdrop-blur-md"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-[#001938] border-2 border-[#D4AF37]/50 mx-auto mb-3 flex items-center justify-center font-black font-mono text-xl text-amber-300 shadow-md group-hover:scale-110 transition-transform">
                                #{player.number}
                            </div>
                            <h4 className="font-black uppercase text-sm text-white font-display group-hover:text-amber-300 transition-colors">
                                {player.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{player.pos}</p>
                            
                            <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase text-blue-400 group-hover:text-white transition-colors">
                                <span>Commander Maillot</span> <ArrowRight size={10} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 5. Main Shop Section & Toolbar ───── */}
            <div id="shop-collection" className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Real Madrid Filter Toolbar */}
                <div className="bg-[#0B1528]/90 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher maillot, veste, casquette..."
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                                className="w-full bg-[#0E182A] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
                            />
                        </div>

                        {/* Controls Group */}
                        <div className="flex flex-wrap items-center gap-4">
                            
                            {/* Stock Toggle */}
                            <label className="flex items-center gap-2 text-xs text-gray-300 font-bold uppercase tracking-wider cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={onlyInStock} 
                                    onChange={e => setOnlyInStock(e.target.checked)} 
                                    className="w-4 h-4 text-blue-600 rounded border-white/20 focus:ring-blue-500"
                                />
                                En Stock Seulement
                            </label>

                            {/* Sort Selector */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none bg-[#0E182A] border border-white/10 rounded-xl px-4 py-3 pr-10 text-xs text-white font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500 cursor-pointer font-display"
                                >
                                    <option value="default">Tri Par Défaut</option>
                                    <option value="newest">Nouveautés 2026</option>
                                    <option value="price-asc">Prix: Croissant</option>
                                    <option value="price-desc">Prix: Décroissant</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 6. Product Cards Grid (Real Madrid Style Layout) ───── */}
                {visibleProducts.length === 0 ? (
                    <div className="text-center py-20 bg-[#0B1528]/80 border border-white/10 rounded-3xl p-10 backdrop-blur-xl">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <h4 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h4>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Vérifiez vos critères de recherche ou réinitialisez les filtres.</p>
                        <button
                            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); setSortBy('default'); setOnlyInStock(false); }}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-500 transition-colors shadow-lg"
                        >
                            Réinitialiser Les Filtres
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                    <div 
                                        className="relative aspect-[4/5] bg-[#0E182A] overflow-hidden cursor-pointer"
                                        onClick={() => handleOpenProductModal(product)}
                                    >
                                        <img 
                                            src={product.image_url || '/Assets/bg2.jpg'} 
                                            alt={product.name} 
                                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                                        />
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        {/* Category & Offer Ribbons */}
                                        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                                            <span className="bg-[#002D62] border border-[#D4AF37]/50 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md font-display">
                                                {product.category}
                                            </span>
                                            {product.id % 2 === 0 && (
                                                <span className="bg-[#D4AF37] text-slate-950 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md font-display flex items-center gap-1">
                                                    <Sparkles size={10} /> Official Match Kit
                                                </span>
                                            )}
                                        </div>

                                        {/* Wishlist Heart Toggle */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                            className={`absolute top-4 right-4 z-10 p-2.5 rounded-full border transition-all ${
                                                isWishlisted 
                                                    ? 'bg-red-500 border-red-400 text-white shadow-lg' 
                                                    : 'bg-black/40 border-white/20 text-gray-300 hover:text-white hover:bg-black/60 backdrop-blur-md'
                                            }`}
                                        >
                                            <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                                        </button>

                                        {/* Out of stock badge */}
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
                                                className="w-full py-2.5 bg-white/90 hover:bg-white text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xl flex items-center justify-center gap-2 backdrop-blur-md font-display"
                                            >
                                                <Eye size={14} /> Aperçu & Personnalisation
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h3 
                                                onClick={() => handleOpenProductModal(product)}
                                                className="text-sm font-bold text-white mb-2 leading-snug cursor-pointer hover:text-blue-400 transition-colors line-clamp-2"
                                            >
                                                {product.name}
                                            </h3>
                                            
                                            {/* Size Chips */}
                                            <div className="flex items-center gap-1.5 my-2">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase mr-1">Tailles:</span>
                                                {sizes.map(s => (
                                                    <span key={s} className="text-[10px] font-mono text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-black text-white font-mono tabular-nums">
                                                    {product.price} <span className="text-xs text-amber-400 font-bold">DH</span>
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => addToCart(product, getDefaultSize(product))}
                                                disabled={isOutOfStock}
                                                className="px-4 py-2.5 bg-[#002D62] hover:bg-blue-600 border border-[#D4AF37]/40 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 font-display"
                                            >
                                                <ShoppingBag size={14} className="text-[#D4AF37]" />
                                                <span>Ajouter</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load More */}
                {hasMore && (
                    <div className="text-center mt-12">
                        <button
                            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                            className="px-8 py-3.5 bg-[#0B1528] border border-white/15 text-white font-bold uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all shadow-xl font-display"
                        >
                            Voir Plus De Produits
                        </button>
                    </div>
                )}
            </div>

            {/* ── 7. Slide-Over Cart Drawer (Real Madrid Style) ───── */}
            <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div 
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} 
                    onClick={() => setIsCartOpen(false)} 
                />
                
                {/* Drawer */}
                <div className={`absolute top-0 right-0 w-full max-w-md h-full bg-[#0B1528] border-l border-white/10 shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col z-10`}>
                    
                    {/* Header */}
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

                    {/* Body Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        
                        {/* STEP 3: SUCCESS */}
                        {checkoutStep === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-4 text-emerald-400 shadow-xl">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase text-white font-display mb-1">Commande Validée!</h3>
                                <p className="text-gray-300 text-xs max-w-xs mb-6">Merci pour votre achat sur le Superstore Officiel de l'US Amal Tiznit.</p>

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
                                    className="w-full py-3.5 bg-[#002D62] text-white font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-blue-900 transition-colors shadow-lg font-display border border-[#D4AF37]/40"
                                >
                                    Continuer Mes Achats
                                </button>
                            </div>

                        /* STEP 2: CHECKOUT DETAILS FORM */
                        ) : checkoutStep === 'details' ? (
                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 text-xs">
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
                                            placeholder="Ex: Rue Al Massira, Quartier Omrane, Tiznit 85000"
                                        />
                                    </div>
                                    {formErrors.address && <span className="text-[10px] text-red-400 mt-1 block font-semibold">{formErrors.address}</span>}
                                </div>
                            </form>

                        /* STEP 1: CART LIST */
                        ) : cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-16">
                                <ShoppingBag size={48} className="opacity-20 mb-3 text-[#D4AF37]" />
                                <p className="text-sm font-medium text-white">Votre panier est vide</p>
                                <p className="text-xs text-gray-500 mt-1 mb-4">Découvrez nos maillots et tenues officielles.</p>
                                <button 
                                    onClick={() => setIsCartOpen(false)} 
                                    className="px-6 py-2.5 bg-[#002D62] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-blue-900 transition-colors font-display border border-[#D4AF37]/40"
                                >
                                    Parcourir Le Superstore
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
                                            placeholder="Code Promo (ex: HALAAMAL)"
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value)}
                                            className="flex-1 bg-[#0E182A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                        <button type="submit" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-colors font-display">
                                            Appliquer
                                        </button>
                                    </div>
                                    {discountError && <p className="text-[10px] text-red-400 mt-1">{discountError}</p>}
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
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
                                        form="checkout-form" 
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

            {/* ── 8. Real Madrid Style Kit Configurator & Product Modal ───── */}
            {selectedProduct && (
                <Modal
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    title={selectedProduct.name}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700">
                        
                        {/* Jersey Front & Back Live Visualiser */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
                                
                                {/* Front vs Back Image Switcher */}
                                <img 
                                    src={selectedProduct.image_url || '/Assets/bg2.jpg'} 
                                    alt={selectedProduct.name} 
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${activeTab === 'back' && (flocageOption !== 'none') ? 'brightness-50' : ''}`}
                                />

                                {/* Real-time Jersey Back Canvas Flocage */}
                                {(flocageOption !== 'none') && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center bg-[#001226]/85 backdrop-blur-xs p-6 border-4 border-[#D4AF37]/40">
                                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em] mb-2 font-display">US AMAL TIZNIT</span>
                                        <span className="text-3xl sm:text-4xl font-black font-display text-white tracking-widest drop-shadow-lg uppercase mb-1">
                                            {flocageOption === 'player' ? selectedPlayerFlocage.name : (customName || 'VOTRE NOM')}
                                        </span>
                                        <span className="text-7xl sm:text-8xl font-black font-mono text-[#D4AF37] drop-shadow-2xl">
                                            {flocageOption === 'player' ? selectedPlayerFlocage.number : (customNumber || '10')}
                                        </span>
                                        <span className="mt-4 text-[9px] font-bold text-amber-300/80 border border-amber-400/30 px-3 py-1 rounded-full uppercase font-display">FLOCAGE OFFICIEL BOTOLA PRO</span>
                                    </div>
                                )}
                            </div>

                            {/* View Switch Buttons */}
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setActiveTab('front')}
                                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                                        activeTab === 'front' 
                                            ? 'bg-[#002D62] text-white border-[#002D62]' 
                                            : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                >
                                    Vue Face
                                </button>
                                <button
                                    onClick={() => setActiveTab('back')}
                                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg border transition-all ${
                                        activeTab === 'back' 
                                            ? 'bg-[#002D62] text-white border-[#002D62]' 
                                            : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                >
                                    Vue Dos (Flocage)
                                </button>
                            </div>
                        </div>

                        {/* Configurator Controls */}
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
                                    {selectedProduct.price + (flocageOption !== 'none' ? 40 : 0) + (addPatch ? 25 : 0)} <span className="text-sm text-slate-500 font-bold">DH</span>
                                </div>

                                {/* Size Selector */}
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-[#002D62] uppercase tracking-wider block mb-2 font-display">
                                        Sélectionner La Taille
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

                                {/* Real Madrid Style Flocage Customizer */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
                                    <span className="text-xs font-bold uppercase text-[#002D62] font-display flex items-center gap-1.5">
                                        <Shirt size={16} className="text-[#D4AF37]" /> Personnaliser Votre Maillot (+40 DH)
                                    </span>

                                    <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase">
                                        {[
                                            { id: 'none', label: 'Sans Flocage' },
                                            { id: 'player', label: 'Joueur Pro' },
                                            { id: 'custom', label: 'Nom Perso' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setFlocageOption(opt.id as any); setActiveTab('back'); }}
                                                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                                                    flocageOption === opt.id
                                                        ? 'bg-[#002D62] text-white border-[#002D62]'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Star Player Selector */}
                                    {flocageOption === 'player' && (
                                        <div className="space-y-2 pt-2">
                                            <label className="text-[10px] font-bold uppercase text-slate-500">Choisir le Joueur Officiel</label>
                                            <select
                                                value={`${selectedPlayerFlocage.name}-${selectedPlayerFlocage.number}`}
                                                onChange={e => {
                                                    const [n, num] = e.target.value.split('-');
                                                    setSelectedPlayerFlocage({ name: n, number: num, id: 0, pos: '', avatar: '' });
                                                }}
                                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-600"
                                            >
                                                {SQUAD_STAR_PLAYERS.map(p => (
                                                    <option key={p.number} value={`${p.name}-${p.number}`}>
                                                        #{p.number} - {p.name} ({p.pos})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Custom Flocage Input */}
                                    {flocageOption === 'custom' && (
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nom Sur Le Dos</label>
                                                <input
                                                    type="text"
                                                    maxLength={12}
                                                    placeholder="EX: MOUAD"
                                                    value={customName}
                                                    onChange={e => setCustomName(e.target.value.toUpperCase())}
                                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-blue-600"
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
                                                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Sleeve Patch Checkbox */}
                                    <label className="flex items-center gap-2 pt-2 cursor-pointer border-t border-slate-200">
                                        <input
                                            type="checkbox"
                                            checked={addPatch}
                                            onChange={e => setAddPatch(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-slate-700">
                                            Ajouter le Patch Officiel Botola Pro (+25 DH) 🇲🇦
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
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
                                className="w-full py-4 bg-[#002D62] hover:bg-blue-900 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 font-display border border-[#D4AF37]/40"
                            >
                                <ShoppingBag size={18} className="text-[#D4AF37]" />
                                {selectedProduct.stock > 0 ? 'Ajouter Au Panier' : 'Indisponible'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Shop;

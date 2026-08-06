import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingBag, Search, X, Plus, Minus, Trash2, CheckCircle, Smartphone, MapPin, Mail, User, ChevronDown, Package } from 'lucide-react';
import { API, Product } from '../api';

/* ── Types ─────────────────────────────────── */

interface CartItem {
    productId: number;
    name: string;
    price: number;
    image_url: string;
    category: string;
    quantity: number;
    size: string;
    stock: number;
}

type SortOption = 'default' | 'price-asc' | 'price-desc';

/* ── Cart persistence helpers ──────────────── */

const CART_KEY = 'usat_shop_cart';
const loadCart = (): CartItem[] => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
};
const saveCart = (cart: CartItem[]) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

/* ── Constants ─────────────────────────────── */

const ITEMS_PER_PAGE = 9;
const PHONE_REGEX = /^(\+212|0)[5-7]\d{8}$/;

/* ── Component ─────────────────────────────── */

const Shop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Cart
    const [cart, setCart] = useState<CartItem[]>(loadCart);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('default');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    // Pagination
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Product detail modal
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState('');

    // Checkout
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
    const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', email: '', address: '' });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderId: number; total: number } | null>(null);

    /* ── Data fetch ─────────────────────────── */

    useEffect(() => {
        document.title = "Boutique Officielle | Amal Tiznit";
        API.shop.getAll()
            .then(setProducts)
            .catch(() => console.error('Failed to fetch products'))
            .finally(() => setLoading(false));
    }, []);

    /* ── Persist cart ───────────────────────── */

    useEffect(() => { saveCart(cart); }, [cart]);

    /* ── Cart actions ──────────────────────── */

    const addToCart = useCallback((product: Product, size: string) => {
        if (product.stock <= 0) return;
        setCart(prev => {
            const key = `${product.id}-${size}`;
            const existing = prev.find(i => `${i.productId}-${i.size}` === key);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(i => `${i.productId}-${i.size}` === key ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                productId: product.id, name: product.name, price: product.price,
                image_url: product.image_url, category: product.category,
                quantity: 1, size, stock: product.stock
            }];
        });
        setIsCartOpen(true);
    }, []);

    const removeFromCart = (productId: number, size: string) =>
        setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size)));

    const updateQuantity = (productId: number, size: string, delta: number) =>
        setCart(prev => prev.map(i => {
            if (i.productId === productId && i.size === size) {
                const q = Math.max(1, Math.min(i.stock, i.quantity + delta));
                return { ...i, quantity: q };
            }
            return i;
        }));

    const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    /* ── Checkout ───────────────────────────── */

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!checkoutForm.name.trim()) errors.name = 'Nom requis';
        if (!checkoutForm.email.trim()) errors.email = 'Email requis';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email)) errors.email = 'Email invalide';
        if (!checkoutForm.phone.trim()) errors.phone = 'Téléphone requis';
        else if (!PHONE_REGEX.test(checkoutForm.phone.replace(/\s/g, ''))) errors.phone = 'Format: +212XXXXXXXXX ou 06XXXXXXXX';
        if (!checkoutForm.address.trim()) errors.address = 'Adresse requise';
        else if (checkoutForm.address.trim().length < 10) errors.address = 'Adresse trop courte (min 10 caractères)';
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
                items: cart.map(i => ({ product_id: i.productId, quantity: i.quantity }))
            });
            setOrderResult({ orderId: result.orderId, total: result.total });
            setCheckoutStep('success');
            setCart([]);
        } catch (error: any) {
            alert(error?.message || 'Erreur lors de la commande. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Filtering & sorting ───────────────── */

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

    /* ── Render helpers ─────────────────────── */

    const getSizes = (product: Product) => (product.sizes || 'S,M,L,XL').split(',').map(s => s.trim());

    const getDefaultSize = (product: Product) => {
        const sizes = getSizes(product);
        return sizes.includes('M') ? 'M' : sizes[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Chargement de la boutique…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-16 overflow-x-hidden">

            {/* ── Cart Drawer ─────────────────── */}
            <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)} />
                <div className={`absolute top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

                    {/* Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-black uppercase text-[#001226]">Panier ({cartCount})</h2>
                        <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {checkoutStep === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-xl font-black uppercase text-[#001226] mb-1">Commande Confirmée!</h3>
                                {orderResult && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 mb-4 text-left">
                                        <div className="text-xs text-gray-500 mb-1">Numéro de commande</div>
                                        <div className="text-lg font-black text-[#001226] tabular-nums">#{orderResult.orderId}</div>
                                        <div className="text-xs text-gray-500 mt-2 mb-1">Total</div>
                                        <div className="text-lg font-black text-blue-600 tabular-nums">{orderResult.total} DH</div>
                                    </div>
                                )}
                                <p className="text-gray-500 text-sm mb-6">Merci pour votre achat. Nous vous contacterons sous peu.</p>
                                <button
                                    onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); setOrderResult(null); }}
                                    className="px-6 py-3 bg-blue-600 text-white font-bold uppercase text-xs tracking-wider rounded hover:bg-blue-700 transition-colors"
                                >
                                    Continuer les Achats
                                </button>
                            </div>
                        ) : checkoutStep === 'details' ? (
                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3 text-blue-800 text-sm">
                                    <ShoppingBag size={18} />
                                    <span className="font-bold">Total: {cartTotal} DH</span>
                                </div>

                                {[
                                    { key: 'name', label: 'Nom complet', icon: User, type: 'text', placeholder: 'Ahmed El Mansouri' },
                                    { key: 'phone', label: 'Téléphone', icon: Smartphone, type: 'tel', placeholder: '+212 6XX XXX XXX' },
                                    { key: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'ahmed@example.com' },
                                ].map(field => {
                                    const Icon = field.icon;
                                    return (
                                        <div key={field.key}>
                                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{field.label}</label>
                                            <div className="relative">
                                                <Icon className="absolute left-3 top-3 text-gray-400" size={16} />
                                                <input
                                                    required type={field.type}
                                                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${formErrors[field.key] ? 'border-red-300' : 'border-gray-200'}`}
                                                    value={(checkoutForm as any)[field.key]}
                                                    onChange={e => { setCheckoutForm({ ...checkoutForm, [field.key]: e.target.value }); setFormErrors(prev => ({ ...prev, [field.key]: '' })); }}
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                            {formErrors[field.key] && <span className="text-xs text-red-500 mt-1 block">{formErrors[field.key]}</span>}
                                        </div>
                                    );
                                })}

                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Adresse de livraison</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <textarea
                                            required
                                            className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all h-20 resize-none ${formErrors.address ? 'border-red-300' : 'border-gray-200'}`}
                                            value={checkoutForm.address}
                                            onChange={e => { setCheckoutForm({ ...checkoutForm, address: e.target.value }); setFormErrors(prev => ({ ...prev, address: '' })); }}
                                            placeholder="Rue, Ville, Code Postal"
                                        />
                                    </div>
                                    {formErrors.address && <span className="text-xs text-red-500 mt-1 block">{formErrors.address}</span>}
                                </div>
                            </form>
                        ) : cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                <ShoppingBag size={48} className="opacity-20" />
                                <p className="text-sm">Votre panier est vide</p>
                                <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold text-sm hover:underline">Parcourir la boutique</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={`${item.productId}-${item.size}`} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-100">
                                        <img src={item.image_url} className="w-16 h-16 object-cover rounded bg-gray-100" alt={item.name} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[#001226] text-sm truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-400">Taille: {item.size}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-black text-blue-600 text-sm">{item.price * item.quantity} DH</span>
                                                <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.productId, item.size, -1)} className="p-0.5 hover:text-red-500"><Minus size={12} /></button>
                                                    <span className="text-xs font-bold w-4 text-center tabular-nums">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.productId, item.size, 1)} className="p-0.5 hover:text-green-500"><Plus size={12} /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(item.productId, item.size)} className="text-gray-300 hover:text-red-500 self-start p-1"><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {checkoutStep !== 'success' && cart.length > 0 && (
                        <div className="p-6 border-t bg-gray-50">
                            {checkoutStep === 'cart' ? (
                                <>
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-gray-500 text-sm">Total</span>
                                        <span className="text-2xl font-black text-[#001226] tabular-nums">{cartTotal} <span className="text-sm font-bold text-gray-400">DH</span></span>
                                    </div>
                                    <button onClick={() => setCheckoutStep('details')} className="w-full py-3.5 bg-blue-600 text-white font-bold uppercase text-xs tracking-wider rounded hover:bg-blue-700 transition-colors">
                                        Passer la Commande
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={() => setCheckoutStep('cart')} className="px-5 py-3 border border-gray-300 text-gray-600 font-bold uppercase text-xs rounded hover:bg-gray-100 transition-colors">
                                        Retour
                                    </button>
                                    <button form="checkout-form" type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-xs tracking-wider rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                        {isSubmitting ? 'Traitement…' : 'Confirmer la Commande'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Product Detail Modal ────────── */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2">
                            {/* Image */}
                            <div className="aspect-square bg-gray-100">
                                <img src={selectedProduct.image_url || '/Assets/bg2.jpg'} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="p-6 sm:p-8 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{selectedProduct.category}</span>
                                    <h2 className="text-xl font-black text-[#001226] uppercase mt-1 leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-2xl font-black text-blue-600 mt-3 tabular-nums">{selectedProduct.price} <span className="text-sm text-gray-400 font-bold">DH</span></p>

                                    {selectedProduct.description && (
                                        <p className="text-sm text-gray-500 mt-4 leading-relaxed">{selectedProduct.description}</p>
                                    )}

                                    {/* Stock status */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${selectedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-semibold ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedProduct.stock > 0 ? `En stock (${selectedProduct.stock})` : 'Rupture de stock'}
                                        </span>
                                    </div>

                                    {/* Size selector */}
                                    <div className="mt-5">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Taille</span>
                                        <div className="flex flex-wrap gap-2">
                                            {getSizes(selectedProduct).map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 text-xs font-bold uppercase rounded border transition-all ${
                                                        selectedSize === size
                                                            ? 'bg-[#001226] text-white border-[#001226]'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Add to cart */}
                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct, selectedSize || getDefaultSize(selectedProduct));
                                        setSelectedProduct(null);
                                    }}
                                    disabled={selectedProduct.stock <= 0}
                                    className="mt-6 w-full py-3.5 bg-blue-600 text-white font-bold uppercase text-xs tracking-wider rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={16} />
                                    {selectedProduct.stock > 0 ? 'Ajouter au Panier' : 'Indisponible'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Page Content ─────────────────── */}
            <div className="container mx-auto px-4">

                {/* Hero — uses local image */}
                <div className="relative rounded-2xl overflow-hidden mb-12 h-[320px] md:h-[420px] group">
                    <img src="/Assets/bg.jpg" className="w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-[2s]" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#001226]/90 via-[#001226]/50 to-transparent p-8 md:p-16 flex flex-col justify-center">
                        <span className="text-blue-400 font-bold text-xs uppercase tracking-[0.3em] mb-3 block">Boutique Officielle</span>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-none mb-4 tracking-tight">
                            Portez La <br /><span className="text-blue-500">Fierté</span>
                        </h1>
                        <p className="text-gray-300 max-w-lg text-sm mb-6 leading-relaxed">
                            Découvrez la collection officielle 2025/26. Maillots, équipements d'entraînement et accessoires de l'US Amal Tiznit.
                        </p>
                        <button
                            onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-[#001226] px-8 py-3 font-bold uppercase text-xs tracking-wider hover:bg-blue-600 hover:text-white transition-all w-fit rounded"
                        >
                            Explorer la Collection
                        </button>
                    </div>
                </div>

                {/* Toolbar: Search + Sort + Category */}
                <div id="shop-grid" className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit…"
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                                className="w-full bg-[#0B1528]/80 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as SortOption)}
                                className="appearance-none bg-[#0B1528]/80 border border-white/10 rounded-lg px-4 py-3 pr-10 text-sm text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                                <option value="default">Tri par défaut</option>
                                <option value="price-asc">Prix croissant</option>
                                <option value="price-desc">Prix décroissant</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setVisibleCount(ITEMS_PER_PAGE); }}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
                                }`}
                            >
                                {cat === 'All' ? 'Tout' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price range */}
                <div className="mb-8 flex items-center gap-4 text-sm text-gray-400 font-semibold">
                    <span>0 DH</span>
                    <input
                        type="range" min="0" max="1000" step="50"
                        className="flex-1 max-w-xs accent-blue-600 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        value={priceRange[1]}
                        onChange={e => { setPriceRange([0, parseInt(e.target.value)]); setVisibleCount(ITEMS_PER_PAGE); }}
                    />
                    <span className="text-white font-bold">{priceRange[1]} DH</span>
                </div>

                {/* Results count */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Empty state */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-white mb-1">Aucun produit trouvé</h4>
                        <p className="text-gray-400 text-sm mb-4">Essayez de modifier vos filtres ou votre recherche.</p>
                        <button
                            onClick={() => { setSelectedCategory('All'); setSearchTerm(''); setPriceRange([0, 1000]); setSortBy('default'); }}
                            className="px-6 py-2 bg-blue-600 text-white font-bold text-xs uppercase rounded hover:bg-blue-700 transition-colors"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleProducts.map(product => {
                        const outOfStock = product.stock <= 0;
                        return (
                            <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                {/* Image with click-to-detail */}
                                <div
                                    className="relative aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => { setSelectedProduct(product); setSelectedSize(getDefaultSize(product)); }}
                                >
                                    <img
                                        src={product.image_url || '/Assets/bg2.jpg'}
                                        alt={product.name}
                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''}`}
                                    />
                                    {/* Category badge */}
                                    <span className="absolute top-3 left-3 bg-[#001226] text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded">
                                        {product.category}
                                    </span>
                                    {/* Stock badge */}
                                    {outOfStock && (
                                        <span className="absolute top-3 right-3 bg-red-600 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded">
                                            Épuisé
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h3
                                        className="text-sm font-bold text-[#001226] mb-1 leading-snug cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                                        onClick={() => { setSelectedProduct(product); setSelectedSize(getDefaultSize(product)); }}
                                    >
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-lg font-black text-[#001226] tabular-nums">{product.price} <span className="text-xs font-semibold text-gray-400">DH</span></p>
                                        {product.stock > 0 && product.stock <= 10 && (
                                            <span className="text-[10px] font-bold text-amber-600 uppercase">Plus que {product.stock}</span>
                                        )}
                                    </div>

                                    {/* Always-visible Add to Cart (mobile-friendly) */}
                                    <button
                                        onClick={() => addToCart(product, getDefaultSize(product))}
                                        disabled={outOfStock}
                                        className="mt-3 w-full py-2.5 bg-blue-600 text-white font-bold uppercase text-[11px] tracking-wider rounded hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={14} />
                                        {outOfStock ? 'Indisponible' : 'Ajouter au Panier'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Load More */}
                {hasMore && (
                    <div className="text-center mt-10">
                        <button
                            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                            className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold uppercase text-xs tracking-wider rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Voir Plus de Produits
                        </button>
                    </div>
                )}
            </div>

            {/* ── Floating Cart Button ────────── */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 hover:scale-105 transition-all z-40"
            >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white tabular-nums">
                        {cartCount}
                    </span>
                )}
            </button>
        </div>
    );
};

export default Shop;

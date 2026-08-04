import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, ArrowRight, Filter, X, Plus, Minus, Trash2, CheckCircle, Smartphone, MapPin, Mail, User } from 'lucide-react';
import { API, Product } from '../api';

interface CartItem extends Product {
    quantity: number;
}

const Shop = () => {
    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    // Checkout State
    const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.title = "Shop | Amal Tiznit Official";
        const fetchProducts = async () => {
            try {
                const data = await API.shop.getAll();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Cart Actions
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Checkout Handling
    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const orderData = {
                customer_name: checkoutForm.name,
                customer_email: checkoutForm.email,
                customer_phone: checkoutForm.phone,
                customer_address: checkoutForm.address,
                items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
            };

            await API.orders.create(orderData);

            setCheckoutStep('success');
            setCart([]);
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtering
    const categories = ['All', ...new Set(products.map(p => p.category))];
    const filteredProducts = products.filter(p => {
        const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        return matchCategory && matchPrice;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pt-32 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading store...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-12 overflow-x-hidden">

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Cart Drawer */}
            <div className={`fixed inset-0 z-50 transition-all duration-500 ${isCartOpen ? 'visible' : 'invisible'}`}>
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsCartOpen(false)}></div>
                <div className={`absolute top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

                    {/* Drawer Header */}
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-black uppercase italic text-[#001226]">Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</h2>
                        <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {checkoutStep === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                    <CheckCircle size={48} />
                                </div>
                                <h3 className="text-2xl font-black uppercase text-[#001226] mb-2">Order Confirmed!</h3>
                                <p className="text-gray-500 mb-8">Thank you for your purchase. We will contact you shortly.</p>
                                <button onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }} className="px-8 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest rounded-sm hover:bg-blue-700">
                                    Continue Shopping
                                </button>
                            </div>
                        ) : checkoutStep === 'details' ? (
                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3 text-blue-800 text-sm mb-6">
                                    <ShoppingBag size={20} />
                                    <span className="font-bold">Total to Pay: {cartTotal} DH</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input required type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={checkoutForm.name} onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })} placeholder="John Doe" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input required type="tel" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={checkoutForm.phone} onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} placeholder="+212 6XX XXX XXX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input required type="email" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                value={checkoutForm.email} onChange={e => setCheckoutForm({ ...checkoutForm, email: e.target.value })} placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Delivery Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <textarea required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                                                value={checkoutForm.address} onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })} placeholder="Street, City, Zip Code" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <ShoppingBag size={64} className="opacity-20" />
                                    <p>Your cart is empty</p>
                                    <button onClick={() => setIsCartOpen(false)} className="text-blue-600 font-bold hover:underline">Start Shopping</button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex gap-4 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                            <img src={item.image_url} className="w-20 h-20 object-cover rounded-md bg-gray-100" />
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-bold text-[#001226] line-clamp-1">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">{item.category}</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="font-black text-blue-600">{item.price * item.quantity} DH</p>
                                                    <div className="flex items-center gap-3 bg-gray-50 rounded px-2 py-1">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:text-red-500"><Minus size={14} /></button>
                                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:text-green-500"><Plus size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 self-start p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                    {/* Drawer Footer */}
                    {checkoutStep !== 'success' && cart.length > 0 && (
                        <div className="p-6 border-t bg-gray-50">
                            {checkoutStep === 'cart' ? (
                                <>
                                    <div className="flex justify-between items-end mb-6">
                                        <span className="text-gray-500 font-medium">Total</span>
                                        <span className="text-3xl font-black text-[#001226]">{cartTotal} <span className="text-sm font-bold text-gray-400">DH</span></span>
                                    </div>
                                    <button onClick={() => setCheckoutStep('details')} className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                        Checkout <ArrowRight size={20} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-4">
                                    <button onClick={() => setCheckoutStep('cart')} className="px-6 py-4 border border-gray-300 text-gray-600 font-bold uppercase rounded-sm hover:bg-gray-100">
                                        Back
                                    </button>
                                    <button form="checkout-form" type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-sm hover:bg-green-700 shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {isSubmitting ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden mb-16 shadow-2xl h-[400px] md:h-[500px] border border-white/10 group">
                    <img src="https://images.unsplash.com/photo-1544698310-74ea9d148c68?q=80&w=2070" className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-[2s]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#001226] via-[#001226]/60 to-transparent p-12 md:p-24 flex flex-col justify-center">
                        <span className="text-blue-500 font-black text-sm uppercase tracking-[0.4em] mb-4 animate-slide-up block">Official Store</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic leading-none mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Wear The <br /><span className="text-blue-600 text-stroke">Pride</span>
                        </h1>
                        <p className="text-gray-300 max-w-lg text-lg mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Discover the new 2025/26 home and away kits. Engineered for performance, designed for passion.
                        </p>
                        <button onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-[#001226] px-10 py-4 font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all w-fit skew-x-[-10deg] animate-slide-up shadow-xl" style={{ animationDelay: '0.3s' }}>
                            <span className="skew-x-[10deg] inline-block">Shop Collection</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12" id="shop-grid">

                    {/* Sidebar Filters */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 sticky top-32">
                            <h3 className="text-white font-black uppercase italic text-xl mb-6 flex items-center gap-2">
                                <Filter size={20} className="text-blue-500" /> Filters
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Category</label>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat ? 'bg-blue-600 border-blue-600' : 'border-gray-500 group-hover:border-blue-400'}`}>
                                                    {selectedCategory === cat && <CheckCircle size={10} className="text-white" />}
                                                </div>
                                                <input type="radio" className="hidden" name="category" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} />
                                                <span className={`text-sm font-bold uppercase ${selectedCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-6">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Price Range</label>
                                    <div className="flex items-center gap-4 text-white text-sm font-bold">
                                        <span>0 DH</span>
                                        <input type="range" min="0" max="1000" step="50" className="flex-1 accent-blue-600 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} />
                                        <span>{priceRange[1]} DH</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-8 text-white">
                            <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Showing {filteredProducts.length} Products</span>
                            {/* Mobile Cart Button trigger could go here if header cart isn't enough */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product) => (
                                <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                        <img
                                            src={product.image_url || 'https://picsum.photos/seed/product/400/500'}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <button onClick={() => addToCart(product)} className="bg-white text-black px-8 py-3 font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 duration-300 shadow-xl rounded-sm">
                                                Add to Cart
                                            </button>
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-blue-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg">{product.category}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-black uppercase italic text-[#001226] mb-2 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                        <div className="flex justify-between items-end">
                                            <p className="text-2xl font-black text-gray-800">{product.price} <span className="text-sm font-bold text-gray-500 align-top">DH</span></p>
                                            <div className="flex text-yellow-400 gap-0.5">
                                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Cart Button */}
            <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 group">
                <ShoppingBag size={28} />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#001226] group-hover:animate-bounce">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                )}
            </button>
        </div>
    );
}

export default Shop;

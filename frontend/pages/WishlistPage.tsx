import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { API, Product } from '../api';

const WISHLIST_KEY = 'usat_shop_wishlist';
const CART_KEY = 'usat_shop_cart';

const loadWishlist = (): number[] => {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
};
const saveWishlist = (list: number[]) => localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

const WishlistPage: React.FC = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState<number[]>(loadWishlist);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Mes Favoris | US Amal Tiznit Official Store";
        window.scrollTo(0, 0);

        API.shop.getAll()
            .then(data => setProducts(data))
            .catch(err => console.error('Failed to load products for wishlist:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { saveWishlist(wishlist); }, [wishlist]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const removeFromWishlist = (productId: number) => {
        setWishlist(prev => prev.filter(id => id !== productId));
        showToast('Produit retiré de vos favoris');
    };

    const moveToCart = (product: Product) => {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        const key = `${product.id}-M--N`;
        const existingIndex = cart.findIndex((i: any) => `${i.productId}-${i.size}-${i.flocageName || ''}-${i.hasPatch ? 'P' : 'N'}` === key);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                category: product.category,
                quantity: 1,
                size: 'M',
                stock: product.stock
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        removeFromWishlist(product.id);
        showToast(`" ${product.name} " déplacé vers votre panier! 🛒`);
    };

    const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-[#0B1528] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <div className="w-12 h-12 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-widest font-display">Chargement de vos favoris…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-24 text-white">
            
            {toastMessage && (
                <div className="fixed top-24 right-6 z-50 bg-[#002D62] text-white border border-[#D4AF37]/50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
                </div>
            )}

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-display uppercase tracking-wider">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <ChevronRight size={12} />
                    <Link to="/shop" className="hover:text-white transition-colors">Boutique</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#D4AF37] font-bold">Mes Favoris ({wishlistedProducts.length})</span>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-display mb-8">
                    Mes Articles Favoris <span className="text-[#D4AF37]">USAT</span>
                </h1>

                {wishlistedProducts.length === 0 ? (
                    <div className="bg-[#0B1528]/80 border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto backdrop-blur-xl shadow-2xl">
                        <Heart size={56} className="text-red-500 opacity-40 mx-auto mb-4" />
                        <h3 className="text-2xl font-black uppercase text-white font-display mb-2">Aucun Favori Enregistré</h3>
                        <p className="text-gray-400 text-sm mb-6">Cliquez sur l'icône cœur sur les fiches produits pour sauvegarder vos articles préférés.</p>
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#002D62] border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl hover:bg-blue-900 transition-all shadow-xl font-display"
                        >
                            <ArrowLeft size={16} /> Découvrir La Boutique
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlistedProducts.map(product => (
                            <div key={product.id} className="bg-[#0B1528]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl flex flex-col backdrop-blur-xl group">
                                <div className="aspect-square bg-[#0E182A] overflow-hidden cursor-pointer" onClick={() => navigate(`/shop/${product.id}`)}>
                                    <img src={product.image_url || '/Assets/bg2.jpg'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-[#D4AF37] font-display">{product.category}</span>
                                        <h4 className="font-bold text-white text-sm leading-snug cursor-pointer hover:text-blue-400" onClick={() => navigate(`/shop/${product.id}`)}>{product.name}</h4>
                                    </div>
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xl font-black text-amber-400 font-mono">{product.price} DH</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => moveToCart(product)} className="p-2 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/40 text-white rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-1.5">
                                                <ShoppingBag size={14} className="text-[#D4AF37]" />
                                            </button>
                                            <button onClick={() => removeFromWishlist(product.id)} className="p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-400 rounded-xl transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;

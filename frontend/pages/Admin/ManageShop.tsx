import React, { useState, useEffect } from 'react';
import { API, Product } from '../../api';
import { ShoppingBag, Plus, Edit2, Trash2, Tag, AlertTriangle, Sparkles, Check, DollarSign, Package } from 'lucide-react';

interface Coupon {
    id: number;
    code: string;
    discount_percent: number;
    active: boolean;
    created_at: string;
}

const ManageShop: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showCouponForm, setShowCouponForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: 0,
        compare_at_price: 0,
        image_url: '',
        category: 'Kits',
        collection: 'Main',
        gender: 'Unisex',
        stock: 100,
        sizes: 'S,M,L,XL,XXL',
        is_featured: false,
        is_new: false
    });

    const [couponData, setCouponData] = useState({
        code: '',
        discount_percent: 10
    });

    useEffect(() => {
        fetchProductsAndCoupons();
    }, []);

    const fetchProductsAndCoupons = async () => {
        try {
            setLoading(true);
            const data = await API.shop.getAll();
            setProducts(data);

            // Fetch coupons if supported
            try {
                const couponRes = await fetch('http://localhost:5000/api/shop/coupons');
                if (couponRes.ok) {
                    const cData = await couponRes.json();
                    setCoupons(cData);
                }
            } catch (err) {
                console.error('Failed to fetch coupons:', err);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await API.shop.update(editingProduct.id, formData);
            } else {
                await API.shop.create(formData);
            }
            setShowForm(false);
            setEditingProduct(null);
            resetForm();
            fetchProductsAndCoupons();
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/shop/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couponData)
            });
            if (res.ok) {
                setShowCouponForm(false);
                setCouponData({ code: '', discount_percent: 10 });
                fetchProductsAndCoupons();
            }
        } catch (err) {
            console.error('Failed to create coupon:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce produit ?')) {
            try {
                await API.shop.delete(id);
                fetchProductsAndCoupons();
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            slug: product.slug || '',
            description: product.description || '',
            price: product.price,
            compare_at_price: product.compare_at_price || 0,
            image_url: product.image_url,
            category: product.category,
            collection: product.collection || 'Main',
            gender: product.gender || 'Unisex',
            stock: product.stock,
            sizes: product.sizes || 'S,M,L,XL,XXL',
            is_featured: product.is_featured || false,
            is_new: product.is_new || false
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', slug: '', description: '', price: 0, compare_at_price: 0,
            image_url: '', category: 'Kits', collection: 'Main', gender: 'Unisex',
            stock: 100, sizes: 'S,M,L,XL,XXL', is_featured: false, is_new: false
        });
    };

    const totalStock = products.reduce((s, p) => s + p.stock, 0);
    const catalogValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStockCount = products.filter(p => p.stock < 20).length;

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-10 h-10 border-3 border-[#002D62] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span className="text-gray-500 font-bold uppercase text-xs">Chargement du catalogue boutique…</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            
            {/* Header & Metrics */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase text-[#001226] font-display">Gestion De La Boutique</h1>
                    <p className="text-xs text-gray-500">Gérez le catalogue produits, les stocks, et les codes promos du club.</p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowCouponForm(true)} 
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
                    >
                        <Tag size={16} /> + Code Promo
                    </button>

                    <button 
                        onClick={() => setShowForm(true)} 
                        className="bg-[#002D62] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={16} /> Nouveau Produit
                    </button>
                </div>
            </div>

            {/* Metrics Dashboard Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={22} /></div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Total Produits</span>
                        <div className="text-xl font-black text-[#001226] font-mono">{products.length}</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={22} /></div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Valeur Du Stock</span>
                        <div className="text-xl font-black text-emerald-600 font-mono">{catalogValue} DH</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><ShoppingBag size={22} /></div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Unités En Stock</span>
                        <div className="text-xl font-black text-indigo-600 font-mono">{totalStock}</div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle size={22} /></div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase font-display">Stock Faible (&lt;20)</span>
                        <div className="text-xl font-black text-amber-600 font-mono">{lowStockCount}</div>
                    </div>
                </div>
            </div>

            {/* Coupons Section if opened */}
            {showCouponForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-black uppercase text-[#001226] font-display mb-4">Créer Un Code Promo</h3>
                        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">Code Promo (ex: VIP20)</label>
                                <input
                                    type="text"
                                    required
                                    value={couponData.code}
                                    onChange={e => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                                    placeholder="AMAL2026"
                                    className="w-full border rounded-xl px-4 py-2.5 uppercase font-mono font-bold"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">Pourcentage De Réduction (%)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    required
                                    value={couponData.discount_percent}
                                    onChange={e => setCouponData({ ...couponData, discount_percent: parseInt(e.target.value) })}
                                    className="w-full border rounded-xl px-4 py-2.5 font-mono font-bold"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button type="button" onClick={() => setShowCouponForm(false)} className="px-5 py-2 border rounded-xl text-gray-600 font-bold uppercase">Annuler</button>
                                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold uppercase rounded-xl shadow-md">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-xl font-black uppercase text-[#002D62] font-display mb-6">
                            {editingProduct ? 'Modifier Le Produit' : 'Ajouter Un Nouveau Produit'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">Nom Du Produit *</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-xl px-4 py-2.5 font-bold" 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">Description Complète</label>
                                <textarea 
                                    value={formData.description} 
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-xl px-4 py-2.5 h-20 resize-none" 
                                    placeholder="Détails du produit, technologie du tissu..." 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">Prix (DH) *</label>
                                    <input 
                                        type="number" 
                                        value={formData.price} 
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full border rounded-xl px-4 py-2.5 font-mono font-bold" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">Stock Disponible *</label>
                                    <input 
                                        type="number" 
                                        value={formData.stock} 
                                        onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        className="w-full border rounded-xl px-4 py-2.5 font-mono font-bold" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">Catégorie</label>
                                    <select 
                                        value={formData.category} 
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-2.5 font-bold"
                                    >
                                        <option value="Kits">Maillots (Kits)</option>
                                        <option value="Training">Entraînement</option>
                                        <option value="Accessories">Accessoires</option>
                                        <option value="Goodies">Goodies & Souvenirs</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 uppercase mb-1">Tailles Disponibles</label>
                                    <input 
                                        type="text" 
                                        value={formData.sizes} 
                                        onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                                        className="w-full border rounded-xl px-4 py-2.5 font-mono" 
                                        placeholder="S,M,L,XL,XXL" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-gray-700 uppercase mb-1">Image Produit (URL ou Import)</label>
                                <input 
                                    type="text" 
                                    value={formData.image_url} 
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="Coller l'URL de l'image ici..." 
                                    className="w-full border rounded-xl px-4 py-2.5 mb-2" 
                                />
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setFormData({ ...formData, image_url: reader.result as string });
                                            reader.readAsDataURL(file);
                                        }
                                    }} 
                                    className="text-xs text-gray-500"
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}
                                    className="px-6 py-2.5 border rounded-xl font-bold uppercase text-gray-600 hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2.5 bg-[#002D62] text-white font-bold uppercase rounded-xl hover:bg-blue-900 shadow-md font-display"
                                >
                                    {editingProduct ? 'Mettre À Jour' : 'Créer Le Produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-base font-black uppercase text-[#001226] font-display">Catalogue Produits ({products.length})</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow flex flex-col justify-between">
                            <div>
                                <div className="h-48 overflow-hidden relative">
                                    <img 
                                        src={product.image_url || '/Assets/bg2.jpg'} 
                                        alt={product.name}
                                        className="w-full h-full object-cover" 
                                    />
                                    <span className="absolute top-3 left-3 bg-[#002D62] text-white px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase font-display">
                                        {product.category}
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{product.name}</h4>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="font-black text-blue-700 font-mono text-base">{product.price} DH</span>
                                        <span className={`font-bold font-mono px-2 py-0.5 rounded ${product.stock < 20 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 pt-0 flex gap-2">
                                <button 
                                    onClick={() => handleEdit(product)} 
                                    className="flex-1 py-2 bg-white border border-gray-300 text-blue-700 hover:bg-blue-50 text-xs font-bold uppercase rounded-xl transition-colors flex items-center justify-center gap-1 font-display"
                                >
                                    <Edit2 size={12} /> Modifier
                                </button>
                                <button 
                                    onClick={() => handleDelete(product.id)} 
                                    className="py-2 px-3 bg-white border border-gray-300 text-red-600 hover:bg-red-50 text-xs font-bold uppercase rounded-xl transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageShop;

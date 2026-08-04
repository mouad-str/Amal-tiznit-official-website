
import React, { useState, useEffect } from 'react';
import { API, Product } from '../../api';

const ManageShop: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        image_url: '',
        category: 'Kits',
        stock: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await API.shop.getAll();
            setProducts(data);
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
            fetchProducts();
        } catch (error) {
            console.error('Failed to save product:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await API.shop.delete(id);
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
            stock: product.stock
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', price: 0, image_url: '', category: 'Kits', stock: 0 });
    };

    if (loading) {
        return <div className="text-center py-10">Loading products...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (DH)</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                        className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2">
                                    <option>Kits</option>
                                    <option>Training</option>
                                    <option>Accessories</option>
                                    <option>Fan Gear</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
                                <div className="flex flex-col gap-3">
                                    {formData.image_url && (
                                        <div className="flex items-center gap-4">
                                            <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg border"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/product/200'; }} />
                                            <button type="button" onClick={() => setFormData({ ...formData, image_url: '' })}
                                                className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                                        </div>
                                    )}
                                    <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="Paste image URL here..." className="w-full border rounded-lg px-4 py-2" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">OR</span>
                                        <label className="flex-1 cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setFormData({ ...formData, image_url: reader.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-gray-500">Upload from device</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Products ({products.length})</h2>
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                        + New Product
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="h-40 overflow-hidden">
                                <img src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`} alt={product.name}
                                    className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4">
                                <span className="text-[8px] font-bold uppercase text-blue-600 tracking-widest">{product.category}</span>
                                <h4 className="font-bold text-gray-800 line-clamp-1">{product.name}</h4>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-blue-600 font-black">{product.price} DH</span>
                                    <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleEdit(product)} className="flex-1 text-blue-600 text-xs font-bold uppercase border border-blue-600 rounded py-1 hover:bg-blue-50">Edit</button>
                                    <button onClick={() => handleDelete(product.id)} className="flex-1 text-red-500 text-xs font-bold uppercase border border-red-500 rounded py-1 hover:bg-red-50">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {products.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-xl mb-2">No products yet</p>
                        <p className="text-sm">Add your first product to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageShop;

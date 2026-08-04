
import React, { useState, useEffect } from 'react';
import { API, NewsArticle } from '../../api';

const ManageNews: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        category: 'News',
        published_at: new Date().toISOString().slice(0, 16)
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const data = await API.news.getAll();
            setArticles(data);
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingArticle) {
                await API.news.update(editingArticle.id, formData);
            } else {
                await API.news.create(formData);
            }
            setShowForm(false);
            setEditingArticle(null);
            resetForm();
            fetchNews();
        } catch (error) {
            console.error('Failed to save article:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await API.news.delete(id);
                fetchNews();
            } catch (error) {
                console.error('Failed to delete article:', error);
            }
        }
    };

    const handleEdit = (article: NewsArticle) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            description: article.description,
            image_url: article.image_url,
            category: article.category,
            published_at: article.published_at.slice(0, 16)
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', image_url: '', category: 'News', published_at: new Date().toISOString().slice(0, 16)
        });
    };

    if (loading) {
        return <div className="text-center py-10">Loading articles...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{editingArticle ? 'Edit Article' : 'New Article'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-lg px-4 py-2 h-32" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Article Image</label>
                                <div className="flex flex-col gap-3">
                                    {/* Image Preview */}
                                    {formData.image_url && (
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-32 h-20 object-cover rounded-lg border"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/400/200'; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image_url: '' })}
                                                className="text-red-500 text-xs font-bold hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                    {/* URL Input */}
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        placeholder="Paste image URL here..."
                                        className="w-full border rounded-lg px-4 py-2"
                                    />
                                    {/* File Upload */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">OR</span>
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, image_url: reader.result as string });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full border rounded-lg px-4 py-2">
                                        <option>News</option>
                                        <option>Training</option>
                                        <option>Transfer</option>
                                        <option>Match Reports</option>
                                        <option>Youth / Academy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Publish Date</label>
                                    <input type="datetime-local" value={formData.published_at} onChange={e => setFormData({ ...formData, published_at: e.target.value })}
                                        className="w-full border rounded-lg px-4 py-2" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => { setShowForm(false); setEditingArticle(null); resetForm(); }}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    {editingArticle ? 'Update' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button onClick={() => setShowForm(true)} className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <span className="text-3xl mb-2">+</span>
                    <span className="text-sm font-bold uppercase tracking-widest">New Article</span>
                </button>
                {articles.map(article => (
                    <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="h-40 overflow-hidden relative">
                            <img src={article.image_url || `https://picsum.photos/seed/${article.id}/400/200`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase">{article.category}</div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-gray-800 line-clamp-1 mb-2">{article.title}</h4>
                            <p className="text-xs text-gray-400 mb-4 line-clamp-2">{article.description}</p>
                            <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                                <button onClick={() => handleEdit(article)} className="text-blue-600 text-xs font-bold uppercase hover:underline">Edit</button>
                                <button onClick={() => handleDelete(article.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageNews;

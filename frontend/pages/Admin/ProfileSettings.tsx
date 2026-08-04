import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfileSettings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await apiFetch('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    name,
                    currentPassword: currentPassword || undefined,
                    newPassword: newPassword || undefined
                }),
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });

            setStatus({ type: 'success', message: 'Profile updated successfully' });
            if (user) updateUser({ ...user, name });
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to update profile. Check your password.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl">
            <h1 className="text-2xl font-black uppercase italic text-[#001226] mb-8">Profile Settings</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">

                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {status.message}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-bold uppercase text-gray-800 mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-blue-600" /> Change Password
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Current Password</label>
                            <input
                                type="password"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Only strictly required to change password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">New Password (Optional)</label>
                            <input
                                type="password"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Leave empty to keep current"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : 'Save Changes'} <Save size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;

import React, { useState, useEffect } from 'react';
import { API, TicketSettings } from '../../api';
import { Save, Plus, Trash2, LayoutTemplate } from 'lucide-react';

const ManageTicketSettings = () => {
    const [settings, setSettings] = useState<TicketSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await API.settings.getTicketSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setMessage(null);
        try {
            await API.settings.updateTicketSettings(settings);
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const addSponsor = () => {
        if (settings) {
            setSettings({
                ...settings,
                sponsors: [...settings.sponsors, '']
            });
        }
    };

    const removeSponsor = (index: number) => {
        if (settings) {
            const newSponsors = [...settings.sponsors];
            newSponsors.splice(index, 1);
            setSettings({ ...settings, sponsors: newSponsors });
        }
    };

    const updateSponsor = (index: number, value: string) => {
        if (settings) {
            const newSponsors = [...settings.sponsors];
            newSponsors[index] = value;
            setSettings({ ...settings, sponsors: newSponsors });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;
    if (!settings) return <div className="p-8 text-center text-red-500">Error loading settings</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <LayoutTemplate className="w-8 h-8 text-[#001226]" />
                    <h1 className="text-3xl font-bold text-[#001226]">Ticket Configuration</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#001226] text-white px-6 py-2.5 rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid gap-8">
                {/* General Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">General</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Ticket Title (Arabic/Text)</label>
                            <input
                                type="text"
                                value={settings.title}
                                onChange={e => setSettings({ ...settings, title: e.target.value })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Subtitle Prefix</label>
                            <input
                                type="text"
                                value={settings.subTitlePrefix}
                                onChange={e => setSettings({ ...settings, subTitlePrefix: e.target.value })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Branding Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Branding</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Team Name</label>
                            <input
                                type="text"
                                value={settings.branding.teamName}
                                onChange={e => setSettings({
                                    ...settings,
                                    branding: { ...settings.branding, teamName: e.target.value }
                                })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Team Logo URL</label>
                            <input
                                type="text"
                                value={settings.branding.logo}
                                onChange={e => setSettings({
                                    ...settings,
                                    branding: { ...settings.branding, logo: e.target.value }
                                })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sponsors Settings */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-xl font-bold text-gray-800">Sponsors Strip</h2>
                        <button onClick={addSponsor} className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:underline">
                            <Plus size={16} /> Add Sponsor
                        </button>
                    </div>

                    <div className="space-y-3">
                        {settings.sponsors.map((url, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <span className="text-gray-400 font-mono w-6">{index + 1}.</span>
                                <input
                                    type="text"
                                    value={url}
                                    placeholder="Sponsor Logo URL"
                                    onChange={e => updateSponsor(index, e.target.value)}
                                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    onClick={() => removeSponsor(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={18} />
                                </button>
                                {url && (
                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center p-1 border">
                                        <img src={url} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTicketSettings;

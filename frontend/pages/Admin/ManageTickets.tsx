
import React, { useState, useEffect } from 'react';
import { API, Match, Ticket, TicketSettings } from '../../api';

const ManageTickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [settings, setSettings] = useState<TicketSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [formData, setFormData] = useState({
        match_id: 0,
        seat_category: 'Standard' as 'VIP' | 'Standard' | 'Economy',
        price: 0,
        quantity_available: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketsData, matchesData, settingsData] = await Promise.all([
                API.tickets.getAll(),
                API.matches.getAll(),
                API.settings.getTicketSettings()
            ]);
            setTickets(ticketsData);
            setMatches(matchesData);
            setSettings(settingsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTicket) {
                await API.tickets.update(editingTicket.id, formData);
            } else {
                await API.tickets.create(formData);
            }
            setShowForm(false);
            setEditingTicket(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to save ticket:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                await API.tickets.delete(id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete ticket:', error);
            }
        }
    };

    const handleEdit = (ticket: Ticket) => {
        setEditingTicket(ticket);
        setFormData({
            match_id: ticket.match_id,
            seat_category: ticket.seat_category,
            price: ticket.price,
            quantity_available: ticket.quantity_available
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ match_id: matches[0]?.id || 0, seat_category: 'Standard', price: 0, quantity_available: 0 });
    };

    const getMatchName = (matchId: number) => {
        const match = matches.find(m => m.id === matchId);
        return match ? `${match.is_home ? 'vs' : '@'} ${match.opponent}` : 'Unknown Match';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    if (loading || !settings) {
        return <div className="text-center py-10">Loading tickets...</div>;
    }

    // Group tickets by match
    const ticketsByMatch = matches
        .filter(m => m.status === 'upcoming')
        .map(match => ({
            match,
            tickets: tickets.filter(t => t.match_id === match.id)
        }));

    return (
        <div className="space-y-6">
            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-6">{editingTicket ? 'Edit Ticket' : 'New Ticket'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Match</label>
                                <select value={formData.match_id} onChange={e => setFormData({ ...formData, match_id: parseInt(e.target.value) })}
                                    className="w-full border rounded-lg px-4 py-2" required>
                                    <option value="">Select a match</option>
                                    {matches.filter(m => m.status === 'upcoming').map(match => (
                                        <option key={match.id} value={match.id}>
                                            {match.is_home ? 'VS' : 'VS'} {match.opponent} - {formatDate(match.match_date)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Seat Category</label>
                                <select value={formData.seat_category} onChange={e => setFormData({ ...formData, seat_category: e.target.value as any })}
                                    className="w-full border rounded-lg px-4 py-2">
                                    <option value="Economy">Economy</option>
                                    <option value="Standard">Standard</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (DH)</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity Available</label>
                                    <input type="number" value={formData.quantity_available} onChange={e => setFormData({ ...formData, quantity_available: parseInt(e.target.value) })}
                                        className="w-full border rounded-lg px-4 py-2" required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => { setShowForm(false); setEditingTicket(null); resetForm(); }}
                                    className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    {editingTicket ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Match Tickets</h2>
                    <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                        + New Ticket
                    </button>
                </div>

                {ticketsByMatch.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-xl mb-2">No upcoming matches</p>
                        <p className="text-sm">Add matches first to create tickets</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {ticketsByMatch.map(({ match, tickets: matchTickets }) => (
                            <div key={match.id} className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {match.is_home ? 'Amal Tiznit VS ' : 'Amal Tiznit VS '}
                                            <span className="text-blue-600">{match.opponent}</span>
                                        </h3>
                                        <p className="text-sm text-gray-400">{formatDate(match.match_date)} • {match.stadium}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.is_home ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {match.is_home ? 'Home' : 'Away'}
                                    </span>
                                </div>

                                {matchTickets.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-400 text-sm">
                                        No tickets configured for this match
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-8 items-center">
                                        {matchTickets.map(ticket => (
                                            <div
                                                key={ticket.id}
                                                className="flex flex-col md:flex-row w-full max-w-[800px] bg-gradient-to-br from-[#1a5fb4] to-[#0d3c7a] rounded-xl shadow-2xl overflow-hidden text-white relative"
                                                style={{ fontFamily: "'Tajawal', sans-serif" }}
                                            >
                                                {/* Edit/Delete Overlay */}
                                                <div className="absolute top-2 right-2 flex gap-2 z-20">
                                                    <button onClick={() => handleEdit(ticket)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(ticket.id)} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>

                                                {/* Left Stub */}
                                                <div className="w-full md:w-[25%] bg-white/10 md:border-r-2 md:border-dashed border-white/40 flex flex-row md:flex-col justify-between p-4 relative text-center items-center md:items-stretch border-b-2 md:border-b-0">
                                                    {/* Cutouts for large screens */}
                                                    <div className="hidden md:block absolute -top-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                                                    <div className="hidden md:block absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 rounded-full"></div>

                                                    <div className="flex justify-between items-center w-full md:w-auto">
                                                        <img src={settings.branding.logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow" />
                                                        <span className="md:[writing-mode:vertical-rl] md:rotate-180 text-xs opacity-70 font-mono tracking-wider">2025/2026</span>
                                                    </div>

                                                    <div className="my-2 md:my-0">
                                                        <h3 className="text-sm font-bold leading-tight mb-1">{settings.title.split(' ').slice(0, 2).join(' ')}<br />{settings.title.split(' ').slice(2).join(' ')}</h3>
                                                        <p className="text-[10px] opacity-80 tracking-widest uppercase">{settings.subTitlePrefix} {match.opponent.substring(0, 3)}</p>
                                                        <div className="bg-black/20 px-3 py-1 rounded text-2xl font-black mt-2 inline-block">
                                                            {ticket.price} <span className="text-xs font-normal">DH</span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full md:w-auto text-right md:text-center">
                                                        <div className="bg-white text-black text-xs font-mono font-bold px-2 py-1 rotate-0 md:-rotate-2 inline-block shadow-sm">
                                                            N° {String(ticket.id).padStart(6, '0')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Main Body */}
                                                <div className="flex-1 flex flex-col p-5 relative">
                                                    <img src={settings.branding.logo} className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 opacity-[0.05] grayscale brightness-200 pointer-events-none mt-16" />
                                                    <div className="text-center mb-6">
                                                        <h2 className="text-lg font-bold m-0">{settings.title}</h2>
                                                        <p className="text-[10px] opacity-80 letter-spacing-2 uppercase">{settings.subTitlePrefix} {match.opponent}</p>
                                                    </div>

                                                    <div className="flex justify-between items-center flex-1 px-4 md:px-10">
                                                        <div className="flex flex-col items-center w-24">
                                                            <div className="w-[70px] h-[70px] bg-white rounded-full p-1 mb-2 shadow-lg">
                                                                <img src={settings.branding.logo} alt="USAT" className="w-full h-full object-contain" />
                                                            </div>
                                                            <span className="font-bold text-lg">{settings.branding.teamName}</span>
                                                        </div>

                                                        <div className="text-center flex-1 mx-4">
                                                            <span className="text-3xl font-black block drop-shadow-md">VS</span>
                                                            <div className="flex flex-col text-sm mt-1 opacity-90 font-mono">
                                                                <span className="font-bold">{new Date(match.match_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                                                <span>{match.match_date.split('T')[1]?.substring(0, 5) || '15:00'}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-center w-24">
                                                            <div className="w-[70px] h-[70px] bg-white rounded-full p-1 mb-2 shadow-lg flex items-center justify-center">
                                                                <span className="text-black font-bold text-xl">{match.opponent.substring(0, 2)}</span>
                                                            </div>
                                                            <span className="font-bold text-lg text-center leading-tight">{match.opponent}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-end mt-6 pt-4 border-t border-white/20">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-xs font-bold uppercase tracking-wider opacity-90">
                                                                Botola Pro Inwi 2 • Season 2025/2026
                                                            </div>
                                                            <div className="flex gap-2 bg-white/10 p-1.5 rounded-full backdrop-blur-sm">
                                                                {settings.sponsors.map((url, i) => (
                                                                    <div key={i} className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                                        <img src={url} alt="Sponsor" className="w-6 h-6 object-contain" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="text-right pl-6 border-l border-white/20">
                                                            <div className="text-3xl font-black leading-none">{ticket.price} <span className="text-lg">DH</span></div>
                                                            <div className="text-xs uppercase bg-white/20 px-2 py-0.5 rounded inline-block mt-1">
                                                                {ticket.seat_category}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTickets;

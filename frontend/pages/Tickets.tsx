import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, CreditCard, Ticket } from 'lucide-react';
import { API, Match, Ticket as TicketType, TicketSettings } from '../api';
import { TICKET_CONFIG } from '../ticketConfig'; // Fallback

const Tickets = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<TicketSettings>(TICKET_CONFIG);
    const [selectedTicket, setSelectedTicket] = useState<{ ticketId: number, matchId: number, category: string, price: number } | null>(null);

    // Handle ticket selection
    const handleSelectTicket = (ticket: TicketType, match: Match) => {
        if (ticket.quantity_available <= 0) {
            alert('Sorry, this ticket category is sold out!');
            return;
        }
        setSelectedTicket({
            ticketId: ticket.id,
            matchId: match.id,
            category: ticket.seat_category,
            price: ticket.price
        });
        alert(`🎟️ You selected a ${ticket.seat_category} ticket for ${ticket.price} DH\n\n${match.is_home ? 'Amal Tiznit vs' : 'Amal Tiznit @'} ${match.opponent}\n\nPayment integration coming soon!`);
    };

    // Handle season packages
    const handleSeasonPackages = () => {
        alert('🏟️ Season Tickets 2026\n\nThank you for your interest!\n\nSeason packages include:\n• All home games access\n• 15% merchandise discount\n• Priority cup match tickets\n• Exclusive member events\n\nContact the club office:\n📧 tickets@amaltiznit.ma\n📞 +212 528 XX XX XX');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesData, ticketsData, settingsData] = await Promise.all([
                    API.matches.getAll(),
                    API.tickets.getAll(),
                    API.settings.getTicketSettings().catch(() => TICKET_CONFIG)
                ]);
                // Filter only upcoming matches
                const upcomingMatches = matchesData.filter(m => m.status === 'upcoming');
                setMatches(upcomingMatches);
                setTickets(ticketsData);
                setConfig(settingsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Format date helper
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format time helper
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Get tickets for a specific match
    const getMatchTickets = (matchId: number) => {
        return tickets.filter(t => t.match_id === matchId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pt-32 pb-12 flex items-center justify-center">
                <div className="text-white text-xl">Loading tickets...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-32 pb-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-slide-up">
                    <span className="text-blue-600 font-bold text-sm uppercase tracking-[0.2em]">Match Day</span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic text-white mt-2 mb-4">
                        Buy <span className="text-blue-600">Tickets</span>
                    </h1>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        Secure your seat for upcoming home matches. Experience the passion and atmosphere of Amal Tiznit live at the Municipal Stadium.
                    </p>
                </div>

                <div className="flex flex-col gap-10 items-center max-w-5xl mx-auto">
                    {matches.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-xl">No upcoming matches available</p>
                            <p className="text-sm mt-2">Check back later for ticket availability</p>
                        </div>
                    ) : (
                        matches.map((match) => {
                            const matchTickets = getMatchTickets(match.id);
                            if (matchTickets.length === 0) return null;

                            return (
                                <div key={match.id} className="w-full flex flex-col gap-6 items-center">
                                    {matchTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            className="flex flex-col md:flex-row w-full max-w-[800px] bg-gradient-to-br from-[#1a5fb4] to-[#0d3c7a] rounded-xl shadow-2xl overflow-hidden text-white relative transition-transform hover:scale-[1.02] duration-300"
                                            style={{ fontFamily: "'Tajawal', sans-serif" }}
                                            onClick={() => handleSelectTicket(ticket, match)}
                                        >
                                            {/* Action Button Overlay */}
                                            <div className="absolute top-4 right-4 z-20 hidden md:block opacity-0 hover:opacity-100 transition-opacity">
                                                <button className="bg-white text-blue-800 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100">
                                                    Select Ticket
                                                </button>
                                            </div>

                                            {/* Left Stub */}
                                            <div className="w-full md:w-[25%] bg-white/10 md:border-r-2 md:border-dashed border-white/40 flex flex-row md:flex-col justify-between p-4 relative text-center items-center md:items-stretch border-b-2 md:border-b-0">
                                                {/* Cutouts for large screens */}
                                                <div className="hidden md:block absolute -top-3 -right-3 w-6 h-6 bg-[#001226] rounded-full"></div>
                                                <div className="hidden md:block absolute -bottom-3 -right-3 w-6 h-6 bg-[#001226] rounded-full"></div>

                                                <div className="flex justify-between items-center w-full md:w-auto">
                                                    <img src={config.branding.logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow" />
                                                    <span className="md:[writing-mode:vertical-rl] md:rotate-180 text-xs opacity-70 font-mono tracking-wider">2025/2026</span>
                                                </div>

                                                <div className="my-2 md:my-0">
                                                    <h3 className="text-sm font-bold leading-tight mb-1">{config.title.split(' ').slice(0, 2).join(' ')}<br />{config.title.split(' ').slice(2).join(' ')}</h3>
                                                    <p className="text-[10px] opacity-80 tracking-widest uppercase">{config.subTitlePrefix} {match.opponent.substring(0, 3)}</p>
                                                    <div className="bg-black/20 px-3 py-1 rounded text-2xl font-black mt-2 inline-block">
                                                        {ticket.price} <span className="text-xs font-normal">DH</span>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-auto text-right md:text-center">
                                                    <div className={`text-xs font-mono font-bold px-2 py-1 rotate-0 md:-rotate-2 inline-block shadow-sm ${ticket.quantity_available > 0 ? 'bg-white text-black' : 'bg-red-500 text-white'}`}>
                                                        {ticket.quantity_available > 0 ? `AVAILABLE` : 'SOLD OUT'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Main Body */}
                                            <div className="flex-1 flex flex-col p-5 relative cursor-pointer">
                                                <img src={config.branding.logo} className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 opacity-[0.05] grayscale brightness-200 pointer-events-none mt-16" />
                                                <div className="text-center mb-6">
                                                    <h2 className="text-lg font-bold m-0">{config.title}</h2>
                                                    <p className="text-[10px] opacity-80 letter-spacing-2 uppercase">{config.subTitlePrefix} {match.opponent}</p>
                                                </div>

                                                <div className="flex justify-between items-center flex-1 px-4 md:px-10">
                                                    <div className="flex flex-col items-center w-24">
                                                        <div className="w-[70px] h-[70px] bg-white rounded-full p-1 mb-2 shadow-lg">
                                                            <img src={config.branding.logo} alt="USAT" className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="font-bold text-lg">{config.branding.teamName}</span>
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
                                                            {config.sponsors.map((url, i) => (
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
                            );
                        })
                    )}
                </div>

                <div className="mt-16 bg-[#001226] rounded-2xl p-8 md:p-12 relative overflow-hidden text-center text-white">
                    <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full filter blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 p-32 bg-red-600 rounded-full filter blur-[100px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-3xl font-black uppercase italic mb-4">Season Tickets 2026</h3>
                        <p className="text-gray-300 mb-8">
                            Guarantee your seat for every home game. Includes exclusive benefits, merchandise discounts, and priority access to cup matches.
                        </p>
                        <button
                            onClick={handleSeasonPackages}
                            className="bg-blue-600 hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-900/50">
                            View Season Packages
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tickets;

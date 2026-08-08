import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, CreditCard, Ticket as TicketIcon, User, Mail, Phone, CheckCircle, X, Printer, ArrowRight } from 'lucide-react';
import { API, Match, Ticket as TicketType, TicketSettings } from '../api';
import { TICKET_CONFIG } from '../ticketConfig'; // Fallback

interface SelectedTicketState {
    ticketId: number;
    matchId: number;
    category: string;
    price: number;
    opponent: string;
    date: string;
    stadium: string;
}

const Tickets = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<TicketSettings>(TICKET_CONFIG);
    
    // Checkout states
    const [selectedTicket, setSelectedTicket] = useState<SelectedTicketState | null>(null);
    const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '', quantity: 1 });
    const [paymentForm, setPaymentForm] = useState({ cardNumber: '', expiry: '', cvc: '' });
    const [checkoutStep, setCheckoutStep] = useState<'info' | 'payment' | 'success'>('info');
    const [bookingSuccess, setBookingSuccess] = useState<{ bookingId: number, totalPrice: number, ticketCategory: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    // Handle ticket selection
    const handleSelectTicket = (ticket: TicketType, match: Match) => {
        if (ticket.quantity_available <= 0) {
            alert('Désolé, cette catégorie est épuisée !');
            return;
        }
        setSelectedTicket({
            ticketId: ticket.id,
            matchId: match.id,
            category: ticket.seat_category,
            price: ticket.price,
            opponent: match.opponent,
            date: match.match_date,
            stadium: match.stadium
        });
        setCheckoutForm({ name: '', email: '', phone: '', quantity: 1 });
        setPaymentForm({ cardNumber: '', expiry: '', cvc: '' });
        setCheckoutStep('info');
        setCheckoutError('');
        setBookingSuccess(null);
    };

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.phone) {
            setCheckoutError('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        setCheckoutError('');
        setCheckoutStep('payment');
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;
        if (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvc) {
            setCheckoutError('Veuillez remplir les informations de paiement.');
            return;
        }

        setSubmitting(true);
        setCheckoutError('');

        try {
            const result = await API.tickets.book({
                ticket_id: selectedTicket.ticketId,
                customer_name: checkoutForm.name,
                customer_email: checkoutForm.email,
                customer_phone: checkoutForm.phone,
                quantity: checkoutForm.quantity
            });

            setBookingSuccess({
                bookingId: result.bookingId,
                totalPrice: result.totalPrice,
                ticketCategory: result.ticketCategory
            });
            setCheckoutStep('success');
            
            // Refresh available ticket counts
            const ticketsData = await API.tickets.getAll();
            setTickets(ticketsData);

        } catch (err: any) {
            console.error('Booking failed:', err);
            setCheckoutError(err.message || 'Échec de la réservation. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    // Print ticket helper
    const handlePrintTicket = () => {
        if (!selectedTicket || !bookingSuccess) return;
        const printWindow = window.open('', '_blank', 'width=500,height=700');
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Billet USAT #${bookingSuccess.bookingId}</title>
    <style>
        @media print { body { margin: 0; } .no-print { display: none; } }
        body { font-family: 'Inter', sans-serif; padding: 30px; color: #111; max-width: 450px; margin: 0 auto; }
        .ticket-card { border: 2px solid #002D62; border-radius: 12px; padding: 24px; position: relative; overflow: hidden; background: #fafafa; }
        .header { text-align: center; border-bottom: 2px dashed #002D62; padding-bottom: 15px; margin-bottom: 15px; }
        .header h1 { font-size: 20px; color: #002D62; margin: 0 0 5px; text-transform: uppercase; font-weight: 900; }
        .header p { font-size: 11px; margin: 2px 0; color: #666; letter-spacing: 1px; }
        .match-info { text-align: center; margin: 20px 0; }
        .match-info h2 { font-size: 24px; color: #111; margin: 5px 0; text-transform: uppercase; }
        .details { font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
        .details p { margin: 6px 0; border-bottom: 1px dotted #ccc; padding-bottom: 4px; }
        .details strong { color: #002D62; }
        .price-badge { background: #002D62; color: white; display: inline-block; padding: 8px 16px; font-weight: bold; border-radius: 6px; font-size: 18px; text-align: center; margin-top: 10px; }
        .footer { text-align: center; margin-top: 25px; font-size: 11px; color: #777; border-top: 1px dashed #ccc; padding-top: 15px; }
        .btn-print { display: block; width: 100%; padding: 12px; margin-top: 20px; background: #D4AF37; color: #001226; border: none; font-size: 14px; font-weight: bold; cursor: pointer; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
    </style>
</head>
<body>
    <div class="ticket-card">
        <div class="header">
            <h1>US AMAL TIZNIT</h1>
            <p>BILLET D'ACCÈS OFFICIEL • BOTOLA PRO</p>
        </div>
        <div class="match-info">
            <p style="font-size: 11px; color: #777; margin: 0; text-transform: uppercase; letter-spacing: 1px;">MATCH</p>
            <h2>USAT VS ${selectedTicket.opponent}</h2>
            <p style="font-size: 12px; font-weight: bold; color: #002D62;">${new Date(selectedTicket.date).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
        </div>
        <div class="details">
            <p><strong>N° Réservation:</strong> #${bookingSuccess.bookingId}</p>
            <p><strong>Détenteur:</strong> ${checkoutForm.name}</p>
            <p><strong>Téléphone:</strong> ${checkoutForm.phone}</p>
            <p><strong>Catégorie:</strong> ${bookingSuccess.ticketCategory}</p>
            <p><strong>Quantité:</strong> ${checkoutForm.quantity} Billet(s)</p>
            <p><strong>Stade:</strong> ${selectedTicket.stadium}</p>
        </div>
        <div style="text-align: center;">
            <div class="price-badge">${bookingSuccess.totalPrice} DH</div>
        </div>
        <div class="footer">
            <p>Veuillez présenter ce billet à l'entrée du stade.</p>
            <p>Bon match ! Dema USAT !</p>
        </div>
    </div>
    <button class="btn-print no-print" onclick="window.print()">🖨️ Imprimer le billet</button>
</body>
</html>`;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    // Handle season packages
    const handleSeasonPackages = () => {
        alert('🏟️ Cartes d\'Abonnement 2026\n\nMerci pour votre intérêt !\n\nL\'abonnement de saison comprend :\n• Accès à tous les matchs à domicile\n• 15% de réduction à la boutique\n• Priorité d\'achat pour les matchs de coupe\n• Événements exclusifs membres\n\nContactez le secrétariat du club :\n📧 tickets@amaltiznit.ma\n📞 +212 528 XX XX XX');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesData, ticketsData, settingsData] = await Promise.all([
                    API.matches.getAll(),
                    API.tickets.getAll(),
                    API.settings.getTicketSettings().catch(() => TICKET_CONFIG)
                ]);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getMatchTickets = (matchId: number) => {
        return tickets.filter(t => t.match_id === matchId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#040914] pt-32 pb-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-400 text-sm uppercase tracking-widest">Chargement de la billetterie...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#040914] pt-32 pb-12 text-[#F8FAFC]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-slide-up">
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-[0.2em] font-display">Billetterie En Ligne</span>
                    <h1 className="text-4xl md:text-5xl font-black uppercase text-white mt-2 mb-4 font-display">
                        Achetez Vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Billets</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed">
                        Réservez votre place pour les prochains chocs à domicile. Vivez la ferveur et l'ambiance unique de l'Amal Tiznit en direct du Stade El Massira.
                    </p>
                </div>

                <div className="flex flex-col gap-10 items-center max-w-5xl mx-auto">
                    {matches.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <TicketIcon size={48} className="mx-auto mb-4 opacity-30 text-amber-400" />
                            <p className="text-lg font-bold font-display">AUCUN MATCH À VENIR</p>
                            <p className="text-xs mt-2 text-gray-500">Revenez plus tard pour l'ouverture des ventes.</p>
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
                                            className="flex flex-col md:flex-row w-full max-w-[800px] bg-gradient-to-br from-[#002D62] to-[#0E182A] border border-white/10 hover:border-blue-500/25 rounded-2xl shadow-2xl overflow-hidden text-white relative transition-all hover:scale-[1.01] duration-300 group cursor-pointer"
                                            onClick={() => handleSelectTicket(ticket, match)}
                                        >
                                            {/* Action Button Overlay */}
                                            <div className="absolute top-4 right-4 z-20 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="bg-amber-400 hover:bg-amber-300 text-gray-900 px-6 py-2 rounded-xl text-xs font-bold shadow-lg cursor-pointer">
                                                    Réserver
                                                </button>
                                            </div>

                                            {/* Left Stub */}
                                            <div className="w-full md:w-[25%] bg-white/5 md:border-r-2 md:border-dashed border-white/10 flex flex-row md:flex-col justify-between p-4 relative text-center items-center md:items-stretch border-b-2 md:border-b-0">
                                                <div className="hidden md:block absolute -top-3 -right-3 w-6 h-6 bg-[#040914] rounded-full z-10"></div>
                                                <div className="hidden md:block absolute -bottom-3 -right-3 w-6 h-6 bg-[#040914] rounded-full z-10"></div>

                                                <div className="flex justify-between items-center w-full md:w-auto">
                                                    <img src="/Assets/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow" />
                                                    <span className="md:[writing-mode:vertical-rl] md:rotate-180 text-[10px] opacity-60 font-mono tracking-wider font-bold">2025/2026</span>
                                                </div>

                                                <div className="my-2 md:my-0 text-center">
                                                    <h3 className="text-xs font-bold leading-tight font-display tracking-tight text-gray-300">US AMAL TIZNIT</h3>
                                                    <p className="text-[9px] text-amber-400 font-mono tracking-widest uppercase mt-0.5">VS {match.opponent.substring(0, 3)}</p>
                                                    <div className="bg-black/40 px-3 py-1.5 rounded-lg text-xl font-black mt-2 inline-block font-mono text-amber-400">
                                                        {ticket.price} <span className="text-[10px] font-normal">DH</span>
                                                    </div>
                                                </div>

                                                <div className="w-full md:w-auto text-right md:text-center">
                                                    <div className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded shadow-sm inline-block ${ticket.quantity_available > 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/15 text-red-300 border border-red-500/20'}`}>
                                                        {ticket.quantity_available > 0 ? `DISPONIBLE` : 'ÉPUISÉ'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Main Body */}
                                            <div className="flex-1 flex flex-col p-5 relative cursor-pointer justify-between">
                                                <div className="text-center mb-6">
                                                    <h2 className="text-md font-bold m-0 text-white tracking-wide uppercase font-display">{config.title || 'US AMAL TIZNIT'}</h2>
                                                    <p className="text-[9px] opacity-75 letter-spacing-2 uppercase tracking-widest mt-1 text-gray-400">CHAMPIONNAT BOTOLA 2 • JEU À DOMICILE</p>
                                                </div>

                                                <div className="flex justify-between items-center flex-1 px-4 md:px-10">
                                                    <div className="flex flex-col items-center w-24">
                                                        <div className="w-12 h-12 bg-white/5 rounded-full p-2 mb-2 border border-white/10 flex items-center justify-center">
                                                            <img src="/Assets/logo.png" alt="USAT" className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="font-bold text-xs uppercase tracking-tight text-center">USAMAL TIZNIT</span>
                                                    </div>

                                                    <div className="text-center flex-1 mx-4">
                                                        <span className="text-2xl font-black block drop-shadow-md text-amber-400 font-display">VS</span>
                                                        <div className="flex flex-col text-[10px] mt-1 opacity-90 font-mono text-gray-400 uppercase">
                                                            <span className="font-bold">{formatDate(match.match_date)}</span>
                                                            <span className="text-amber-400 font-bold mt-0.5">{match.match_date.split('T')[1]?.substring(0, 5) || '16:00'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center w-24">
                                                        <div className="w-12 h-12 bg-white/5 rounded-full p-2 mb-2 border border-white/10 flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">{match.opponent.substring(0, 2).toUpperCase()}</span>
                                                        </div>
                                                        <span className="font-bold text-xs uppercase tracking-tight text-center leading-tight">{match.opponent}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-end mt-6 pt-4 border-t border-white/10">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                            <MapPin size={12} className="text-amber-400" />
                                                            <span>{match.stadium}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right pl-6 border-l border-white/10">
                                                        <div className="text-2xl font-black leading-none text-white font-mono">{ticket.price} <span className="text-xs">DH</span></div>
                                                        <div className="text-[9px] uppercase font-bold bg-white/5 px-2.5 py-1 rounded border border-white/10 inline-block mt-2 text-amber-400">
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

                <div className="mt-16 bg-[#0E182A] border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden text-center text-white max-w-4xl mx-auto shadow-2xl">
                    <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full filter blur-[100px] opacity-15 transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 p-32 bg-amber-500 rounded-full filter blur-[100px] opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase mb-4 font-display">Cartes d'Abonnement 2026</h3>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-8">
                            Garantissez votre siège pour toute la saison. Comprend l'accès à tous les matchs à domicile, des remises exclusives à la boutique, et un accès prioritaire.
                        </p>
                        <button
                            onClick={handleSeasonPackages}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-blue-500/30 cursor-pointer">
                            Découvrir les Abonnements
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Reservation Checkout Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
                    <div className="bg-[#0E182A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden my-8 animate-slide-up">
                        {/* Header banner glow */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-amber-500"></div>
                        
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedTicket(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white p-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <div className="p-6 sm:p-8">
                            
                            {/* Step Indicator */}
                            {checkoutStep !== 'success' && (
                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${checkoutStep === 'info' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-gray-400 border border-white/5'}`}>
                                        1. Infos Client
                                    </span>
                                    <div className="h-[1px] bg-white/10 flex-1"></div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${checkoutStep === 'payment' ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-gray-400 border border-white/5'}`}>
                                        2. Paiement
                                    </span>
                                </div>
                            )}

                            {/* Error Alert */}
                            {checkoutError && (
                                <div className="bg-red-500/10 border border-red-500/25 text-red-200 p-4 rounded-xl mb-6 text-xs font-bold flex gap-2 items-center">
                                    <X size={16} className="text-red-500 shrink-0" />
                                    <span>{checkoutError}</span>
                                </div>
                            )}

                            {/* STEP 1: INFO FORM */}
                            {checkoutStep === 'info' && (
                                <form onSubmit={handleInfoSubmit} className="space-y-4">
                                    <div className="text-center mb-6">
                                        <TicketIcon className="mx-auto text-amber-400 mb-2" size={32} />
                                        <h3 className="text-lg font-bold font-display uppercase tracking-tight text-white">Réservation de Billets</h3>
                                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                            Match : <span className="text-white font-bold">USAT vs {selectedTicket.opponent}</span><br />
                                            Catégorie <span className="text-amber-400 font-bold">{selectedTicket.category}</span> • {selectedTicket.price} DH / Billet
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Nom complet</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 text-gray-500" size={16} />
                                            <input 
                                                type="text" 
                                                required
                                                className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="ex: Youssef Ait Hammou"
                                                value={checkoutForm.name}
                                                onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Adresse E-mail</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 text-gray-500" size={16} />
                                            <input 
                                                type="email" 
                                                required
                                                className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="nom@exemple.com"
                                                value={checkoutForm.email}
                                                onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Numéro de téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-3.5 text-gray-500" size={16} />
                                            <input 
                                                type="tel" 
                                                required
                                                className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="ex: +212 600000000"
                                                value={checkoutForm.phone}
                                                onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Nombre de billets</label>
                                        <select 
                                            className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                                            value={checkoutForm.quantity}
                                            onChange={(e) => setCheckoutForm({...checkoutForm, quantity: parseInt(e.target.value)})}
                                        >
                                            <option value={1}>1 Billet</option>
                                            <option value={2}>2 Billets</option>
                                            <option value={3}>3 Billets</option>
                                            <option value={4}>4 Billets</option>
                                            <option value={5}>5 Billets</option>
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <button 
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-900/30"
                                        >
                                            <span>Passer au paiement</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* STEP 2: PAYMENT FORM */}
                            {checkoutStep === 'payment' && (
                                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                    <div className="text-center mb-6">
                                        <CreditCard className="mx-auto text-amber-400 mb-2" size={32} />
                                        <h3 className="text-lg font-bold font-display uppercase text-white">Paiement Sécurisé</h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Montant Total : <span className="text-amber-400 font-bold font-mono text-sm">{selectedTicket.price * checkoutForm.quantity} DH</span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Numéro de carte</label>
                                        <input 
                                            type="text" 
                                            required
                                            maxLength={19}
                                            className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 font-mono"
                                            placeholder="1111 2222 3333 4444"
                                            value={paymentForm.cardNumber}
                                            onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Expiration</label>
                                            <input 
                                                type="text" 
                                                required
                                                maxLength={5}
                                                className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 font-mono"
                                                placeholder="MM/AA"
                                                value={paymentForm.expiry}
                                                onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">CVC</label>
                                            <input 
                                                type="password" 
                                                required
                                                maxLength={3}
                                                className="w-full bg-[#040914] border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-blue-500 font-mono"
                                                placeholder="•••"
                                                value={paymentForm.cvc}
                                                onChange={(e) => setPaymentForm({...paymentForm, cvc: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setCheckoutStep('info')}
                                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                                        >
                                            Retour
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={submitting}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-lg shadow-blue-500/20"
                                        >
                                            {submitting ? 'Validation...' : 'Confirmer & Payer'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* STEP 3: SUCCESS VIEW */}
                            {checkoutStep === 'success' && bookingSuccess && (
                                <div className="text-center space-y-6 py-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                                        <CheckCircle size={36} />
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xl font-bold font-display uppercase text-white">Réservation Confirmée !</h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Votre commande de billets pour <span className="text-white font-bold">USAT vs {selectedTicket.opponent}</span> a été validée.
                                        </p>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto font-mono text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Code de Réservation :</span>
                                            <span className="font-bold text-amber-400">#{bookingSuccess.bookingId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Catégorie :</span>
                                            <span className="font-bold text-white uppercase">{bookingSuccess.ticketCategory}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Quantité :</span>
                                            <span className="font-bold text-white">{checkoutForm.quantity}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-white/10">
                                            <span className="text-gray-400">Montant réglé :</span>
                                            <span className="font-bold text-amber-400">{bookingSuccess.totalPrice} DH</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 max-w-sm mx-auto pt-2">
                                        <button 
                                            type="button"
                                            onClick={handlePrintTicket}
                                            className="flex-1 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                                        >
                                            <Printer size={14} />
                                            <span>Imprimer le Billet</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedTicket(null)}
                                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;

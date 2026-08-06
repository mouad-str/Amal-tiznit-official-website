import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, CreditCard, Ticket as TicketIcon, CheckCircle2, QrCode, XCircle, ChevronRight, User, Smartphone, ShieldCheck } from 'lucide-react';
import { API, Match, Ticket as TicketType, TicketSettings } from '../api';
import { TICKET_CONFIG } from '../ticketConfig';

interface BookingResult {
    booking_ref: string;
    category: string;
    seat_zone: string;
    quantity: number;
    total_price: number;
    customer_name: string;
    customer_phone: string;
}

const Tickets: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState<TicketSettings>(TICKET_CONFIG);

    // Modal state for seat booking
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [selectedZone, setSelectedZone] = useState<'VIP' | 'Tribune' | 'Virage'>('Tribune');
    const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '', quantity: 1 });
    const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const zones = [
        {
            id: 'VIP',
            name: 'Tribune Honorifique (VIP)',
            price: 150,
            color: 'border-amber-400 bg-amber-500/20 text-amber-300',
            desc: 'Sièges premium en hauteur avec accès salon & boisson'
        },
        {
            id: 'Tribune',
            name: 'Tribune Couverte (Officielle)',
            price: 50,
            color: 'border-blue-500 bg-blue-600/20 text-blue-300',
            desc: 'Tribune principale couverte à l\'abri du soleil'
        },
        {
            id: 'Virage',
            name: 'Virage Ultras Tiznit (Supporters)',
            price: 30,
            color: 'border-emerald-500 bg-emerald-600/20 text-emerald-300',
            desc: 'Zone de l\'ambiance supporter Ultras Tiznit 🔵🟡'
        }
    ];

    useEffect(() => {
        document.title = "Billetterie Officielle | Stade El Massira Tiznit";
        window.scrollTo(0, 0);

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

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMatch) return;
        if (!bookingForm.name || !bookingForm.phone) {
            alert('Veuillez remplir votre nom et numéro de téléphone');
            return;
        }

        setIsSubmitting(true);
        const currentZoneObj = zones.find(z => z.id === selectedZone)!;
        const total = currentZoneObj.price * bookingForm.quantity;

        try {
            const res = await API.tickets.book({
                match_id: selectedMatch.id,
                category: selectedZone,
                seat_zone: currentZoneObj.name,
                quantity: bookingForm.quantity,
                total_price: total,
                customer_name: bookingForm.name,
                customer_phone: bookingForm.phone,
                customer_email: bookingForm.email
            });

            setBookingResult(res);
        } catch (err: any) {
            alert(err?.message || 'Erreur lors de la réservation du billet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent pt-32 pb-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-300 text-xs font-bold uppercase tracking-widest font-display">Chargement de la billetterie…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-24 text-white">
            
            {/* Header */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center max-w-3xl">
                <span className="text-xs font-bold uppercase text-[#D4AF37] tracking-[0.25em] font-display">Stade El Massira • Tiznit</span>
                <h1 className="text-4xl sm:text-6xl font-black uppercase text-white font-display mt-2 mb-4">
                    Billetterie <span className="text-[#D4AF37]">USAT</span>
                </h1>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    Réservez votre place pour les prochains matchs à domicile de l'US Amal Tiznit en Botola Pro. Choisissez votre tribune sur le plan interactif du stade.
                </p>
            </div>

            {/* Matches List */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">
                {matches.length === 0 ? (
                    <div className="bg-[#0B1528]/80 border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto backdrop-blur-xl shadow-2xl">
                        <TicketIcon size={48} className="text-[#D4AF37] mx-auto mb-3 opacity-40" />
                        <h3 className="text-2xl font-black uppercase text-white font-display mb-2">Aucun Match Prochainement</h3>
                        <p className="text-gray-400 text-xs">Les prochains billets seront disponibles dès l'annonce du calendrier officiel.</p>
                    </div>
                ) : (
                    matches.map((match) => (
                        <div 
                            key={match.id}
                            className="bg-[#0B1528]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[#D4AF37]/50 transition-all group"
                        >
                            {/* Teams Info */}
                            <div className="flex items-center gap-6 text-center sm:text-left flex-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#0E182A] border border-white/10 rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-lg">
                                        <img src="/Assets/logo.png" alt="USAT" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-2xl font-black text-white font-display">USAT</span>
                                </div>

                                <div className="text-2xl font-black text-[#D4AF37] font-display">VS</div>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-[#0E182A] border border-white/10 rounded-2xl p-2 flex items-center justify-center font-black text-[#D4AF37] text-xl shrink-0 shadow-lg font-mono">
                                        {match.opponent.substring(0, 2)}
                                    </div>
                                    <span className="text-2xl font-black text-white font-display">{match.opponent}</span>
                                </div>
                            </div>

                            {/* Match Specs */}
                            <div className="space-y-1 text-xs text-gray-300 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 font-bold">
                                    <Calendar size={14} />
                                    <span>{new Date(match.match_date).toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                                    <MapPin size={14} className="text-blue-400" />
                                    <span>{match.stadium || 'Stade El Massira, Tiznit'}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => setSelectedMatch(match)}
                                className="w-full md:w-auto px-8 py-4 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl font-display shrink-0 flex items-center justify-center gap-2"
                            >
                                <TicketIcon size={16} className="text-[#D4AF37]" /> Choisir Ma Place (Plan)
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Stadium Seat Map & Booking Modal */}
            {selectedMatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => { setSelectedMatch(null); setBookingResult(null); }}></div>
                    
                    <div className="bg-[#0B1528] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto text-white shadow-2xl">
                        <button onClick={() => { setSelectedMatch(null); setBookingResult(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                            <XCircle size={24} />
                        </button>

                        {bookingResult ? (
                            <div className="text-center space-y-6 py-4 animate-slide-up">
                                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                    <CheckCircle2 size={36} />
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black uppercase text-white font-display">Billet Confirmé!</h3>
                                    <p className="text-gray-400 text-xs mt-1">Présentez ce QR Code à l'entrée du Stade El Massira.</p>
                                </div>

                                {/* Digital Ticket QR Pass */}
                                <div className="bg-gradient-to-br from-[#002D62] via-[#0E182A] to-[#001226] border border-[#D4AF37]/60 rounded-2xl p-6 max-w-sm mx-auto shadow-2xl text-left space-y-4 relative overflow-hidden">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                        <div>
                                            <div className="font-black text-sm text-white font-display">US AMAL TIZNIT</div>
                                            <div className="text-[10px] text-amber-300 font-mono">VS {selectedMatch.opponent}</div>
                                        </div>
                                        <div className="bg-white p-1 rounded-lg">
                                            <QrCode size={40} className="text-slate-950" />
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between"><span className="text-gray-400">Réf Billet:</span><strong className="text-white font-mono">{bookingResult.booking_ref}</strong></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Tribune:</span><strong className="text-amber-400 font-bold">{bookingResult.seat_zone}</strong></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Titulaire:</span><strong className="text-white">{bookingResult.customer_name}</strong></div>
                                        <div className="flex justify-between"><span className="text-gray-400">Total:</span><strong className="text-emerald-400 font-mono font-black">{bookingResult.total_price} DH</strong></div>
                                    </div>
                                </div>

                                <button onClick={() => window.print()} className="px-8 py-3.5 bg-[#002D62] border border-[#D4AF37]/50 text-white font-bold uppercase text-xs rounded-2xl font-display shadow-xl">
                                    🖨️ Imprimer Mon Billet Match
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <span className="text-xs text-[#D4AF37] font-bold uppercase font-display tracking-widest">Plan Interactif Du Stade</span>
                                    <h3 className="text-2xl font-black uppercase text-white font-display">Selectionner Votre Zone & Tribune</h3>
                                </div>

                                {/* SVG Interactive Stadium Map Visualizer */}
                                <div className="bg-[#0E182A] border border-white/10 rounded-2xl p-6 text-center space-y-4">
                                    <div className="text-[10px] font-bold uppercase text-gray-400 tracking-wider font-display">Terrain De Jeu (Pelouse Synthétique / Naturelle)</div>
                                    <div className="w-full h-24 bg-emerald-700/40 border-2 border-dashed border-emerald-400/50 rounded-xl flex items-center justify-center text-emerald-200 font-black text-xs font-display tracking-widest">
                                        ⚽ PELOUSE EL MASSIRA TIZNIT
                                    </div>

                                    {/* Stadium Stands Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {zones.map((zone) => (
                                            <div
                                                key={zone.id}
                                                onClick={() => setSelectedZone(zone.id as any)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedZone === zone.id ? `${zone.color} ring-2 ring-[#D4AF37]` : 'bg-white/5 border-white/10 text-gray-400'}`}
                                            >
                                                <div className="font-bold text-xs uppercase font-display">{zone.id}</div>
                                                <div className="text-sm font-black font-mono mt-1">{zone.price} DH</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Zone Selected Details */}
                                {zones.find(z => z.id === selectedZone) && (
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-xs text-gray-300">
                                        <strong className="text-white block font-display uppercase">{zones.find(z => z.id === selectedZone)?.name}</strong>
                                        <p className="mt-0.5 text-gray-400">{zones.find(z => z.id === selectedZone)?.desc}</p>
                                    </div>
                                )}

                                {/* Booking Form */}
                                <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-bold uppercase text-gray-300 mb-1">Nom & Prénom *</label>
                                            <input
                                                type="text"
                                                required
                                                value={bookingForm.name}
                                                onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                                                placeholder="Ahmed Mansouri"
                                                className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold uppercase text-gray-300 mb-1">Téléphone Marocain *</label>
                                            <input
                                                type="tel"
                                                required
                                                value={bookingForm.phone}
                                                onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                                placeholder="+212 6XX XXX XXX"
                                                className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div>
                                            <span className="text-gray-400">Total Réservation:</span>
                                            <div className="text-2xl font-black text-amber-400 font-mono">
                                                {(zones.find(z => z.id === selectedZone)?.price || 50) * bookingForm.quantity} DH
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 py-3.5 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl font-display"
                                        >
                                            {isSubmitting ? 'Réservation En Cours...' : 'Valider Et Obtenir Mon Billet'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;

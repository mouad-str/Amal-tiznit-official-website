import React from 'react';
import { ASSETS } from '../constants';
import { MapPin, Users, Navigation, ShieldCheck, Car, Coffee, Compass, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StadiumGuide: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white pt-28 pb-20 relative overflow-hidden font-sans">
            {/* Ambient Background Lights */}
            <div className="absolute top-20 right-1/4 w-[700px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Hero Title */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest">
                        <MapPin size={14} /> Guide Matchday • Stade El Massira
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent">
                        Stade El Massira Tiznit
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Le chaudron mythique de l'Ittihad Al-Riyadi Amal Tiznit. Consultez les informations pratiques d'accès, les portes d'entrée et le règlement du stade.
                    </p>
                </div>

                {/* Key Stadium Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
                    {[
                        { label: 'Capacité Totale', val: '10 000 Spectateurs', sub: 'Places Assises & Debout', icon: Users },
                        { label: 'Localisation', val: 'Tiznit, Maroc', sub: 'Centre Ville', icon: MapPin },
                        { label: 'Surface Terrain', val: 'Pelouse Synthétique', sub: 'Norme FIFA Quality', icon: Compass },
                        { label: 'Inauguration', val: 'Stade Historique', sub: 'Rénové en 2023', icon: ShieldCheck },
                    ].map((s, i) => (
                        <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 text-center">
                            <s.icon className="w-6 h-6 text-blue-400 mx-auto" />
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">{s.label}</span>
                            <div className="text-base font-black text-white uppercase font-display">{s.val}</div>
                            <span className="text-[10px] text-slate-500 block">{s.sub}</span>
                        </div>
                    ))}
                </div>

                {/* Entrance Gates Map Grid */}
                <div className="mb-20 space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                        <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Plan d'Accès</span>
                            <h2 className="text-2xl font-black uppercase text-white font-display">Portes d'Accès Spectateurs</h2>
                        </div>
                        <Link 
                            to="/tickets"
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-blue-600/20"
                        >
                            <Ticket size={16} /> Réserver Un Billet
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Gate 1 VIP */}
                        <div className="bg-slate-900/60 border border-amber-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center font-black font-mono text-lg border border-amber-500/20">
                                P1
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Tribune VIP / Presse</span>
                                <h3 className="text-xl font-black text-white uppercase font-display mt-0.5">Porte Honorifique 1</h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                    Accès réservé aux détenteurs de billets Tribune VIP, membres du Conseil d'Administration et journalistes accrédités.
                                </p>
                            </div>
                            <div className="pt-2 text-xs font-mono text-amber-400/90 font-bold border-t border-slate-800">
                                Tarif Fixe: 150 DH • Sièges Couverts
                            </div>
                        </div>

                        {/* Gate 2 Official Stand */}
                        <div className="bg-slate-900/60 border border-blue-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center font-black font-mono text-lg border border-blue-500/20">
                                P2
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tribune Couverte</span>
                                <h3 className="text-xl font-black text-white uppercase font-display mt-0.5">Porte Officielle 2</h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                    Accès principal pour le grand public, familles et supporters détenteurs de billets en Tribune Couverte.
                                </p>
                            </div>
                            <div className="pt-2 text-xs font-mono text-blue-400/90 font-bold border-t border-slate-800">
                                Tarif: 50 DH • Vue Centrale
                            </div>
                        </div>

                        {/* Gate 3 Ultras */}
                        <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6 space-y-4 relative overflow-hidden">
                            <div className="w-12 h-12 bg-slate-800 text-slate-300 rounded-2xl flex items-center justify-center font-black font-mono text-lg border border-slate-700">
                                P3
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Virage Ultras Tiznit</span>
                                <h3 className="text-xl font-black text-white uppercase font-display mt-0.5">Porte Virage 3</h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                    Zone d'animation dédiée aux groupes de supporters Ultras Tiznit. Ambiance garantie !
                                </p>
                            </div>
                            <div className="pt-2 text-xs font-mono text-slate-300 font-bold border-t border-slate-800">
                                Tarif Populaire: 30 DH • Virage Animé
                            </div>
                        </div>
                    </div>
                </div>

                {/* Practical Info & Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Parking & Transport */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4">
                        <h3 className="text-lg font-black uppercase text-white font-display flex items-center gap-3">
                            <Car className="text-blue-400" size={22} /> Transport & Parking Jour De Match
                        </h3>
                        <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span><strong>Parking Public Gratuit:</strong> Situé à 200m de l'entrée principale du stade.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span><strong>Ouverture des Portes:</strong> Les portes ouvrent 2 heures avant le coup d'envoi.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-blue-400 font-bold">•</span>
                                <span><strong>Kiosques Buvette & Boutique:</strong> Restauration rapide et maillots officiels à l'intérieur du périmètre.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Stadium Rules */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4">
                        <h3 className="text-lg font-black uppercase text-white font-display flex items-center gap-3">
                            <ShieldCheck className="text-emerald-400" size={22} /> Consignes De Sécurité
                        </h3>
                        <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>Contrôle de sécurité et vérification du QR Code billet obligatoires à chaque porte.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>Objets dangereux, bouteilles en verre et fumigènes strictement interdits.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>Respect de la sportivité et soutien passionné de notre club USAT !</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StadiumGuide;

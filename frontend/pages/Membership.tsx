import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, QrCode, CheckCircle2, ChevronRight, User, Mail, Smartphone, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import { API } from '../api';
import { ASSETS } from '../constants';

interface MemberCard {
    member_id_code: string;
    full_name: string;
    email: string;
    phone: string;
    tier: string;
    discount_percent: number;
    expires_at: string;
}

const Membership: React.FC = () => {
    const [selectedTier, setSelectedTier] = useState<'Bronze' | 'Gold' | 'Platinum'>('Gold');
    const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
    const [memberCard, setMemberCard] = useState<MemberCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = "Carte de Membre Officielle | US Amal Tiznit";
        window.scrollTo(0, 0);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.full_name || !form.email || !form.phone) {
            setError('Veuillez remplir tous les champs du formulaire.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await API.memberships.create({
                full_name: form.full_name,
                email: form.email,
                phone: form.phone,
                tier: selectedTier
            });
            setMemberCard(data);
        } catch (err: any) {
            setError(err?.message || 'Erreur lors de la création de la carte de membre.');
        } finally {
            setLoading(false);
        }
    };

    const tiers = [
        {
            name: 'Bronze',
            price: '200 DH / an',
            discount: '10%',
            badgeColor: 'from-amber-700 via-amber-800 to-amber-900',
            textColor: 'text-amber-300',
            border: 'border-amber-700/50',
            benefits: [
                'Carte de membre officielle USAT',
                '10% de réduction permanente sur la Boutique',
                'Newsletter exclusive du club & coulisses'
            ]
        },
        {
            name: 'Gold',
            price: '500 DH / an',
            discount: '15%',
            badgeColor: 'from-amber-400 via-yellow-500 to-amber-600',
            textColor: 'text-amber-300',
            border: 'border-amber-400/80 shadow-amber-500/20',
            recommended: true,
            benefits: [
                'Carte Digitale VIP USAT avec QR Code',
                '15% de réduction permanente sur la Boutique',
                '5 Entrées gratuites pour les matchs à domicile',
                'Accès prioritaire aux billetteries des grands matchs',
                'Invitation aux séances d\'entraînement ouvertes'
            ]
        },
        {
            name: 'Platinum',
            price: '1 200 DH / an',
            discount: '20%',
            badgeColor: 'from-slate-200 via-[#D4AF37] to-slate-400',
            textColor: 'text-yellow-200',
            border: 'border-[#D4AF37]',
            benefits: [
                'Abonnement complet (Tous les matchs de la saison)',
                '20% de réduction permanente sur la Boutique',
                'Siège réservé en Tribune Honorifique VIP',
                'Maillot Officiel de la saison offert & personnalisé',
                'Rencontre exclusive avec les joueurs & le staff'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-transparent pt-28 pb-24 text-white">
            
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-display uppercase tracking-wider">
                    <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                    <ChevronRight size={12} />
                    <span className="text-[#D4AF37] font-bold">Adhésion & Carte Membre</span>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="text-xs font-bold uppercase text-[#D4AF37] tracking-[0.25em] font-display">
                        Rejoignez La Famille USAT
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase text-white font-display leading-tight">
                        Devenez Membre Officiel <span className="text-[#D4AF37]">USAT</span>
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        Soutenez l'Ittihad Al-Riyadi Amal Tiznit, profitez de réductions exclusives sur la boutique officielle, et obtenez votre carte digitale avec QR Code.
                    </p>
                </div>

                {/* Membership Card Preview & Generated Result */}
                {memberCard ? (
                    <div className="bg-[#0B1528]/90 border border-[#D4AF37]/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl backdrop-blur-xl animate-slide-up text-center space-y-8">
                        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                            <CheckCircle2 size={36} />
                        </div>

                        <div>
                            <h2 className="text-3xl font-black uppercase text-white font-display">Carte De Membre Générée!</h2>
                            <p className="text-gray-400 text-xs mt-1">Félicitations! Votre carte de membre digitale est prête.</p>
                        </div>

                        {/* Visual Wallet Card */}
                        <div className="w-full max-w-md mx-auto aspect-[1.6/1] bg-gradient-to-br from-[#002D62] via-[#0E182A] to-[#001226] border border-[#D4AF37]/60 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between text-left">
                            
                            {/* Watermark Logo */}
                            <img src={ASSETS.logo} alt="" className="absolute -right-8 -bottom-8 w-48 h-48 opacity-15 pointer-events-none" />

                            {/* Top Bar */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img src={ASSETS.logo} alt="USAT" className="w-10 h-10 object-contain drop-shadow-md" />
                                    <div>
                                        <div className="font-black text-sm text-white font-display tracking-wider">US AMAL TIZNIT</div>
                                        <div className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-widest font-display">Carte De Membre Officielle</div>
                                    </div>
                                </div>
                                <span className="bg-[#D4AF37] text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-display">
                                    MEMBRE {memberCard.tier}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="space-y-1 relative z-10 my-2">
                                <div className="text-[10px] text-gray-400 uppercase font-display tracking-wider">Titulaire de la carte</div>
                                <div className="text-lg font-black text-white font-display truncate">{memberCard.full_name}</div>
                                <div className="text-xs text-amber-300 font-mono font-bold">{memberCard.member_id_code}</div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex justify-between items-end pt-2 border-t border-white/10 relative z-10 text-[10px]">
                                <div>
                                    <span className="text-gray-400 block">Réduction Boutique:</span>
                                    <strong className="text-emerald-400 font-mono font-bold text-xs">{memberCard.discount_percent}% De Réduction</strong>
                                </div>
                                <div className="bg-white p-1 rounded-lg">
                                    <QrCode size={36} className="text-slate-950" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => window.print()} className="flex-1 py-3.5 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs rounded-2xl font-display shadow-xl">
                                🖨️ Imprimer La Carte
                            </button>
                            <Link to="/shop" className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase text-xs rounded-2xl font-display shadow-xl flex items-center justify-center gap-2">
                                Profiter Des Réductions <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16">
                        
                        {/* Tiers Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {tiers.map((t) => (
                                <div 
                                    key={t.name}
                                    onClick={() => setSelectedTier(t.name as any)}
                                    className={`bg-[#0B1528]/90 border rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 relative backdrop-blur-xl ${selectedTier === t.name ? 'border-[#D4AF37] shadow-2xl shadow-blue-900/50 scale-105 bg-[#002D62]/40' : 'border-white/10 opacity-80 hover:opacity-100'}`}
                                >
                                    {t.recommended && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-display shadow-lg">
                                            Recommandé
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-xs font-black uppercase tracking-widest font-display ${t.textColor}`}>Pass {t.name}</span>
                                            <Award size={24} className={t.textColor} />
                                        </div>
                                        <div className="text-3xl font-black text-white font-mono mb-2">{t.price}</div>
                                        <div className="text-xs text-emerald-400 font-bold font-mono mb-6">Réduction Boutique: {t.discount}</div>

                                        <ul className="space-y-3 text-xs text-gray-300 border-t border-white/10 pt-4">
                                            {t.benefits.map((b, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <CheckCircle2 size={14} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button className={`w-full mt-8 py-3.5 rounded-2xl font-bold uppercase text-xs font-display tracking-wider border transition-all ${selectedTier === t.name ? 'bg-[#002D62] text-white border-[#D4AF37]' : 'bg-white/5 border-white/10 text-gray-300'}`}>
                                        {selectedTier === t.name ? 'Formule Sélectionnée ✓' : 'Sélectionner'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Registration Form */}
                        <div className="bg-[#0B1528]/90 border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto backdrop-blur-xl shadow-2xl space-y-6">
                            <h3 className="text-2xl font-black uppercase text-white font-display border-b border-white/10 pb-4">
                                Formulaire De Demande — Pass <span className="text-[#D4AF37]">{selectedTier}</span>
                            </h3>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Nom & Prénom Complet *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.full_name}
                                        onChange={e => setForm({ ...form, full_name: e.target.value })}
                                        placeholder="Ex: Youssef El Mansouri"
                                        className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Adresse Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="youssef@example.com"
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Téléphone Marocain *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="+212 6XX XXX XXX"
                                            className="w-full bg-[#0E182A] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-400 font-bold">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#002D62] hover:bg-blue-900 border border-[#D4AF37]/50 text-white font-bold uppercase text-xs tracking-wider rounded-2xl transition-all shadow-xl font-display flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Génération De La Carte...' : `Obtenir Ma Carte Membre ${selectedTier}`}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Membership;

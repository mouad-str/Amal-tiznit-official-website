import React, { useState, useEffect } from 'react';
import { 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    Send, 
    MessageSquare, 
    HelpCircle, 
    CheckCircle2, 
    Globe, 
    ChevronDown, 
    ChevronUp, 
    ExternalLink, 
    ShieldCheck, 
    Sparkles, 
    Users,
    AlertCircle
} from 'lucide-react';
import { API } from '../api';
import Button from '../components/ui/Button';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'General Fan Inquiry',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [responseMessage, setResponseMessage] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        document.title = "Contact Us | US Amal Tiznit Official";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Concatenate subject and phone into message payload for API compatibility
        const formattedMessage = `[Subject: ${formData.subject}]${formData.phone ? ` [Phone: ${formData.phone}]` : ''}\n\n${formData.message}`;

        try {
            const result = await API.contact.create({
                name: formData.name,
                email: formData.email,
                message: formattedMessage
            });
            setStatus('success');
            setResponseMessage(result.message || 'Thank you for reaching out! Your message has been received.');
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: 'General Fan Inquiry',
                message: ''
            });
        } catch (error) {
            setStatus('error');
            setResponseMessage('Failed to send message. Please check your network connection or try again later.');
        }
    };

    const inquirySubjects = [
        'General Fan Inquiry',
        'Tickets & Matchday Assistance',
        'Sponsorship & Business Partnerships',
        'Youth Academy & Player Trials',
        'Press & Media Accreditation'
    ];

    const faqs = [
        {
            question: "How can I purchase tickets for US Amal Tiznit home matches?",
            answer: "You can purchase tickets directly online via our official Tickets page, or at the Stade El Massira ticket counters on matchdays starting 3 hours before kickoff."
        },
        {
            question: "How do young players apply for Youth Academy trials?",
            answer: "Youth academy open trials are announced seasonally for U15, U17, and U19 divisions. You can also select 'Youth Academy & Player Trials' in the contact form with your playing details."
        },
        {
            question: "How can local businesses partner with US Amal Tiznit?",
            answer: "We offer commercial partnership packages including stadium LED advertising, jersey sponsorship, and hospitality options. Choose 'Sponsorship & Business Partnerships' for a corporate kit."
        },
        {
            question: "What stadium entry regulations should fans be aware of?",
            answer: "Pyrotechnics, glass bottles, large flags on wooden poles, and unauthorized commercial cameras are strictly forbidden inside Stade El Massira for safety reasons."
        }
    ];

    const socialLinks = [
        { name: 'Facebook', handle: '@AmalTiznitOfficial', url: 'https://facebook.com', badge: '100K+ Fans' },
        { name: 'Instagram', handle: '@amaltiznit_official', url: 'https://instagram.com', badge: 'Official Photos' },
        { name: 'YouTube', handle: 'Amal Tiznit TV', url: 'https://youtube.com', badge: 'Highlights' },
        { name: 'WhatsApp Channel', handle: 'US Amal Tiznit News', url: 'https://whatsapp.com', badge: 'Live Updates' }
    ];

    return (
        <div className="pt-24 pb-20 min-h-screen bg-transparent">
            {/* Header Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="max-w-4xl pt-6 border-b border-white/10 pb-8">
                    <div className="flex items-center space-x-3 mb-3">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-blue-500 font-bold text-xs uppercase tracking-[0.4em]">Official Fan Support & Desk</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-display">
                        Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Touch</span>
                    </h1>
                    <p className="text-gray-300 mt-3 text-base md:text-lg leading-relaxed max-w-2xl">
                        Have a question about tickets, commercial partnerships, academy trials, or press accreditation? Reach out directly to the official administration of US Amal Tiznit.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: Contact Information, Map & Working Hours */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Quick Contact Cards */}
                        <div className="bg-[#0B1528]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-2 border-b border-white/10 pb-4">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                Contact Information
                            </h3>

                            <div className="space-y-6">
                                {/* Phone Card */}
                                <a 
                                    href="tel:+212528123456" 
                                    className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                >
                                    <div className="w-11 h-11 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-xs tracking-wider text-gray-400 mb-0.5">Phone Lines</h4>
                                        <p className="text-white font-mono font-bold text-sm group-hover:text-blue-400 transition-colors">+212 528 123 456</p>
                                        <span className="text-[11px] text-gray-400">Matchday hotline & secretariat</span>
                                    </div>
                                </a>

                                {/* Email Card */}
                                <a 
                                    href="mailto:contact@amaltiznit.ma" 
                                    className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                >
                                    <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-xs tracking-wider text-gray-400 mb-0.5">Official Email</h4>
                                        <p className="text-white font-mono font-bold text-sm group-hover:text-amber-400 transition-colors">contact@amaltiznit.ma</p>
                                        <span className="text-[11px] text-gray-400">Direct inbox for all inquiries</span>
                                    </div>
                                </a>

                                {/* Stadium Address Card */}
                                <div className="flex items-start space-x-4 p-3">
                                    <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase text-xs tracking-wider text-gray-400 mb-0.5">Stadium & Headquarters</h4>
                                        <p className="text-white font-bold text-sm">Stade El Massira</p>
                                        <p className="text-gray-400 text-xs mt-0.5">Boulevard Moulay Rachid, Tiznit, Morocco</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Working Hours & Response SLA Box */}
                        <div className="bg-gradient-to-br from-[#0B1528] to-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <h4 className="font-bold text-white uppercase text-sm tracking-wider">Office Working Hours</h4>
                                </div>
                                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                    Open Today
                                </span>
                            </div>

                            <div className="space-y-2.5 text-xs text-gray-300 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Monday – Friday:</span>
                                    <span className="font-mono font-bold text-white">09:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Saturday:</span>
                                    <span className="font-mono font-bold text-white">09:00 - 13:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Matchdays:</span>
                                    <span className="font-mono font-bold text-amber-400">Desk opens 3h before kickoff</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                                <span className="flex items-center gap-1.5 text-blue-300">
                                    <ShieldCheck className="w-4 h-4 text-blue-400" /> Guaranteed SLA
                                </span>
                                <span className="font-semibold text-white">Response within 24 hours</span>
                            </div>
                        </div>

                        {/* Google Maps Directions Widget */}
                        <div className="bg-[#0B1528]/90 border border-white/10 rounded-2xl p-5 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-blue-400" />
                                    Stade El Massira Map
                                </span>
                                <a 
                                    href="https://maps.google.com/?q=Stade+El+Massira+Tiznit" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1"
                                >
                                    Get Directions <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>

                            {/* Stylized Map Frame */}
                            <div className="w-full h-40 bg-slate-800 rounded-xl overflow-hidden relative border border-white/10 group">
                                <iframe 
                                    title="Stade El Massira Map"
                                    src="https://maps.google.com/maps?q=Tiznit,Morocco&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity filter grayscale contrast-125 hover:filter-none"
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Interactive Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-[#0B1528]/95 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                    Send An Official Message
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Fill out the details below. Our secretariat team will review and reply promptly.
                                </p>
                            </div>

                            {status === 'success' ? (
                                <div className="text-center py-12 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                        Message Sent Successfully!
                                    </h4>
                                    <p className="text-gray-300 text-sm max-w-md mx-auto mb-6">
                                        {responseMessage}
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="md"
                                        onClick={() => setStatus('idle')}
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    {status === 'error' && (
                                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            {responseMessage}
                                        </div>
                                    )}

                                    {/* Name & Email Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                                                Full Name <span className="text-blue-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Youssef El Mansouri"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                                                Email Address <span className="text-blue-400">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="youssef@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone & Subject Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                                                Phone Number <span className="text-gray-500 text-[10px]">(Optional)</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+212 600 000 000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                                                Inquiry Subject <span className="text-blue-400">*</span>
                                            </label>
                                            <select
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full bg-[#0E182A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                                            >
                                                {inquirySubjects.map((sub) => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Message Textarea */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                                                Your Message <span className="text-blue-400">*</span>
                                            </label>
                                            <span className="text-[10px] text-gray-500">
                                                {formData.message.length}/1000 chars
                                            </span>
                                        </div>
                                        <textarea
                                            rows={5}
                                            required
                                            maxLength={1000}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Write your message or detailed inquiry here..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                                        ></textarea>
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={status === 'loading'}
                                        className="w-full justify-center gap-2 py-4"
                                    >
                                        {status === 'loading' ? (
                                            'Sending Message...'
                                        ) : (
                                            <>
                                                Send Official Message <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ ACCORDION SECTION */}
                <div className="mt-24 border-t border-white/10 pt-16">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-blue-400 font-bold text-xs uppercase tracking-[0.3em] block mb-2">Quick Assistance</span>
                        <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
                            Frequently Asked <span className="text-amber-400">Questions</span>
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaq === index;
                            return (
                                <div 
                                    key={index}
                                    className="bg-[#0B1528]/80 border border-white/10 rounded-2xl overflow-hidden transition-all duration-200"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : index)}
                                        className="w-full px-6 py-4 text-left flex items-center justify-between text-white font-bold text-sm sm:text-base hover:text-blue-400 transition-colors"
                                    >
                                        <span className="flex items-center gap-3">
                                            <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                            {faq.question}
                                        </span>
                                        {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-5 pt-1 text-gray-300 text-sm leading-relaxed border-t border-white/5 font-sans pl-14">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SOCIAL MEDIA QUICK CONNECT */}
                <div className="mt-20 bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-1">Follow The Club</span>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Official Social Channels
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.name}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-[#0B1528] border border-white/10 hover:border-blue-500/50 p-4 rounded-xl text-center group transition-all"
                                >
                                    <span className="text-xs font-bold text-white block group-hover:text-blue-400 transition-colors">{s.name}</span>
                                    <span className="text-[10px] text-gray-400 block mt-0.5">{s.badge}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Home } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiFetch<{ token: string; user: any }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            login(response.token, response.user);
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Login failed:', err);
            setError('Identifiant ou mot de passe incorrect. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#001226] flex items-center justify-center relative overflow-hidden px-4">
            {/* Background Premium Glow Effects */}
            <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[150px]"></div>
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[180px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                
                {/* Back to Home Button */}
                <div className="mb-6 flex justify-start">
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-white transition-colors duration-200 uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md"
                    >
                        <Home size={14} />
                        <span>Retour à l'accueil</span>
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <img 
                        src="/Assets/logo.png" 
                        alt="US Amal Tiznit Logo" 
                        className="w-24 h-24 mx-auto mb-4 drop-shadow-[0_10px_15px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105" 
                    />
                    <h1 className="text-3xl font-black uppercase text-white tracking-tighter font-display">
                        Portail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Administration</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-2 uppercase tracking-wider">Accès sécurisé réservé au personnel du club</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-8 rounded-2xl shadow-2xl transition-all duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold">
                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-widest">Adresse E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#000d1a]/80 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-mono font-bold"
                                    placeholder="admin@amaltiznit.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-widest">Mot de passe</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full bg-[#000d1a]/80 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-mono font-bold"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3 text-gray-500 hover:text-white"
                                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me and Forgot Password placeholders */}
                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-white/10 bg-transparent text-blue-600 focus:ring-0 focus:ring-offset-0" 
                                />
                                <span>Se souvenir de moi</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-xs cursor-pointer"
                        >
                            {isLoading ? 'Authentification...' : 'Se Connecter'}
                            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">© 2026 US Amal Tiznit • Tous droits réservés</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

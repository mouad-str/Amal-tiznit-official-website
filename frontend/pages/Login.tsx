import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Home, User, CheckCircle2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setError('Les mots de passe ne correspondent pas.');
                setIsLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('Le mot de passe doit contenir au moins 6 caractères.');
                setIsLoading(false);
                return;
            }
        }

        try {
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login' 
                ? { email, password } 
                : { name, email, password };

            const response = await apiFetch<{ token: string; user: any }>(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            login(response.token, response.user);
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || 'Authentification échouée. Veuillez vérifier vos identifiants.');
        } finally {
            setIsLoading(false);
        }
    };

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleMockGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            const mockCredential = JSON.stringify({
                name: 'Utilisateur Google Dev',
                email: 'user.google@amaltiznit.ma',
                googleId: 'google_mock_id_12345'
            });

            const response = await apiFetch<{ token: string; user: any }>('/auth/google', {
                method: 'POST',
                body: JSON.stringify({ credential: mockCredential })
            });

            login(response.token, response.user);
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Google Mock Auth Error:', err);
            setError('Échec de la connexion Google Mock.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#001226] flex items-center justify-center relative overflow-hidden px-4 py-12">
            {/* Background Glow Effects */}
            <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[150px]"></div>
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[180px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-slide-up">
                
                {/* Home navigation header */}
                <div className="mb-6 flex justify-between items-center">
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-white transition-colors duration-200 uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md"
                    >
                        <Home size={14} />
                        <span>Retour à l'accueil</span>
                    </Link>

                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(''); }}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                mode === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Connexion
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('register'); setError(''); }}
                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                mode === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Inscription
                        </button>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <img 
                        src="/Assets/logo.png" 
                        alt="US Amal Tiznit Logo" 
                        className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_10px_15px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105" 
                    />
                    <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tighter font-display">
                        {mode === 'login' ? 'Espace' : 'Créer Un'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">{mode === 'login' ? 'Connexion' : 'Compte Admin'}</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-1 uppercase tracking-wider">
                        {mode === 'login' ? 'Accès sécurisé pour la gestion du club' : 'Rejoignez l\'équipe d\'administration du club'}
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl transition-all duration-300">
                    
                    {/* Google OAuth Login Button */}
                    <div className="w-full mb-6">
                        {googleClientId ? (
                            <GoogleOAuthProvider clientId={googleClientId}>
                                <div className="flex justify-center w-full">
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            if (credentialResponse.credential) {
                                                setIsLoading(true);
                                                setError('');
                                                try {
                                                    const response = await apiFetch<{ token: string; user: any }>('/auth/google', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ credential: credentialResponse.credential })
                                                    });
                                                    login(response.token, response.user);
                                                    navigate('/admin/dashboard');
                                                } catch (err: any) {
                                                    setError(err.message || 'Échec de la validation Google.');
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }
                                        }}
                                        onError={() => {
                                            setError('Échec de la connexion Google.');
                                        }}
                                        theme="filled_blue"
                                        size="large"
                                        shape="pill"
                                        locale="fr"
                                    />
                                </div>
                            </GoogleOAuthProvider>
                        ) : (
                            <button
                                type="button"
                                onClick={handleMockGoogleLogin}
                                disabled={isLoading}
                                className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md transition-all border border-gray-200 cursor-pointer hover:scale-[1.01]"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                    />
                                </svg>
                                <span>Continuer avec Google</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">ou par email</span>
                        <div className="h-[1px] bg-white/10 flex-1"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold">
                                <AlertCircle size={16} className="text-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold">
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                                {successMsg}
                            </div>
                        )}

                        {/* Full Name for Register Mode */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Nom & Prénom</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3 text-gray-500" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#000d1a]/80 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-bold"
                                        placeholder="ex: Reda El Amrani"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Adresse E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3 text-gray-500" size={16} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[#000d1a]/80 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-mono font-bold"
                                    placeholder="admin@amaltiznit.ma"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 text-gray-500" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full bg-[#000d1a]/80 border border-white/10 rounded-xl py-2.5 pl-11 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-mono font-bold"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-2.5 text-gray-500 hover:text-white"
                                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password for Register Mode */}
                        {mode === 'register' && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-widest">Confirmer Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3 text-gray-500" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full bg-[#000d1a]/80 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-xs font-mono font-bold"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Remember Me Checkbox */}
                        {mode === 'login' && (
                            <div className="flex items-center justify-between text-xs pt-1">
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
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-xs cursor-pointer mt-2"
                        >
                            {isLoading ? 'Traitement en cours...' : (mode === 'login' ? 'Se Connecter' : 'Créer Mon Compte')}
                            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Mode Toggle Footer Prompt */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-400">
                            {mode === 'login' ? 'Vous n\'avez pas encore de compte ?' : 'Vous possédez déjà un compte ?'}{' '}
                            <button
                                type="button"
                                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer ml-1"
                            >
                                {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">© 2026 US Amal Tiznit • Tous droits réservés</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

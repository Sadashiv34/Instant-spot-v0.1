import React, { useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { X, Mail, Lock, Loader2, AlertCircle, KeyRound, CheckCircle, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onClose: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'login' | 'signup' | 'reset'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Helper to make error messages friendlier
  const mapAuthError = (errCode: string, rawMessage: string) => {
    if (errCode.includes('user-not-found') || errCode.includes('wrong-password')) {
        return "Invalid email or password.";
    }
    if (errCode.includes('email-already-in-use')) {
        return "This email is already registered. Please log in.";
    }
    if (errCode.includes('weak-password')) {
        return "Password should be at least 6 characters.";
    }
    if (errCode.includes('invalid-email')) {
        return "Please enter a valid email address.";
    }
    if (errCode.includes('too-many-requests')) {
        return "Too many failed attempts. Please try again later.";
    }
    return rawMessage.replace('Firebase: ', '').replace('auth/', '').replace(/-/g, ' ');
  };

  const handleSuccess = () => {
      setLoading(false);
      setAuthSuccess(true);
      // Delay closing to show success animation
      setTimeout(() => {
          onClose();
      }, 1500);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      handleSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(mapAuthError(err.code || '', err.message));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      handleSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(mapAuthError(err.code || '', err.message));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSuccess(false);
    try {
        await sendPasswordResetEmail(auth, email);
        setResetSuccess(true);
    } catch (err: any) {
        setError(mapAuthError(err.code || '', err.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-green-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"
        >
          <X size={24} />
        </button>

        {/* SUCCESS STATE OVERLAY */}
        {authSuccess ? (
            <div className="absolute inset-0 bg-[#0a0a0a] z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="text-green-400 w-10 h-10 animate-bounce" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase">Access Granted</h2>
                <p className="text-green-400 font-mono text-sm tracking-widest animate-pulse">ESTABLISHING SESSION...</p>
            </div>
        ) : (
            <>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                        {view === 'reset' ? <KeyRound className="text-green-400" size={32}/> : <ShieldCheck className="text-green-400" size={32} />}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {view === 'login' && 'Identify Yourself'}
                        {view === 'signup' && 'Welcome Explorer — create your account to Continue'}
                        {view === 'reset' && 'Reset Credentials'}
                    </h2>
                    {view === 'reset' && (
                        <p className="text-gray-500 text-sm font-mono">
                            RECOVERY PROTOCOL
                        </p>
                    )}
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300 font-medium leading-tight">{error}</p>
                    </div>
                )}

                {view === 'reset' ? (
                    resetSuccess ? (
                        <div className="text-center p-6 bg-green-500/10 border border-green-500/30 rounded-xl mb-8 flex flex-col items-center animate-in fade-in duration-300">
                            <CheckCircle className="text-green-400 mb-2" size={24} />
                            <h3 className="text-green-400 font-bold mb-1">Link Transmitted</h3>
                            <p className="text-sm text-green-300/80">Check your inbox for the recovery key.</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordReset} className="space-y-5 mb-8">
                            <div className="space-y-1">
                                <label className="text-[10px] text-green-400 font-bold uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black border border-white/10 focus:border-green-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-700 outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wide"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                            </button>
                        </form>
                    )
                ) : (
                    <>
                        <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
                            <div className="space-y-1">
                                <label className="text-[10px] text-green-400 font-bold uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black border border-white/10 focus:border-green-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-700 outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] text-green-400 font-bold uppercase tracking-wider ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={18} />
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black border border-white/10 focus:border-green-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-700 outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            {view === 'login' && (
                                <div className="text-right -mt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setView('reset')}
                                        className="text-xs text-gray-500 hover:text-green-400 hover:underline underline-offset-4 font-medium transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wide group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        {view === 'login' ? 'Authenticate' : 'Initialize Account'}
                                        <div className="w-0 group-hover:w-2 transition-all"></div>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <span className="relative bg-[#0a0a0a] px-3 text-xs text-gray-600 uppercase font-bold">Or Connect With</span>
                        </div>

                        <button 
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 mb-6"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google Access
                        </button>
                    </>
                )}


                <div className="text-center">
                    <button 
                        onClick={() => {
                            if (view === 'reset') {
                                setView('login');
                            } else {
                                setView(view === 'login' ? 'signup' : 'login');
                            }
                            setError(null);
                            setResetSuccess(false);
                        }} 
                        className="text-xs text-green-500 hover:text-green-400 hover:underline underline-offset-4 font-medium transition-colors"
                    >
                        {view === 'login' && "New explorer? Set up your profile."}
                        {view === 'signup' && "Have credentials? Return to login"}
                        {view === 'reset' && "Return to login"}
                    </button>
                </div>
            </>
        )}

      </div>
    </div>
  );
};

export default AuthPage;
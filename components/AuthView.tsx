
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Sparkles, ArrowRight, User, AlertCircle, Fingerprint, Dna, Activity } from 'lucide-react';
import { translations } from '../translations';
import { backend } from '../backend';

interface AuthViewProps {
  onLogin: (username: string) => void;
  language: 'en' | 'zh-TW';
}

const MorseGrid: React.FC<{ 
  bits: string[]; 
  onToggle: (i: number) => void; 
  disabled?: boolean;
}> = ({ bits, onToggle, disabled }) => (
  <div className="grid grid-cols-4 gap-3 mt-2">
    {bits.map((bit, i) => (
      <button 
        key={i}
        type="button"
        disabled={disabled}
        onClick={() => onToggle(i)}
        className={`h-12 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
          bit === '.' ? 'bg-black/20 border-white/10' : 'bg-[#c5a059]/10 border-[#c5a059]/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/30'}`}
      >
        <div className={`transition-all duration-300 ${
          bit === '.' ? 'w-2 h-2 rounded-full bg-white/20' : 'w-6 h-1 rounded-full bg-[#c5a059]'
        }`} />
      </button>
    ))}
  </div>
);

const AuthView: React.FC<AuthViewProps> = ({ onLogin, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth Modes
  const [loginAuthMode, setLoginAuthMode] = useState<'password' | 'morse'>('password');
  const [useMorseInRegister, setUseMorseInRegister] = useState(false);
  
  // 8-bit Morse State
  const [morseCode, setMorseCode] = useState<string[]>(Array(8).fill('.'));

  const t = translations[language].auth;

  const toggleMorseBit = (index: number) => {
    setMorseCode(prev => {
      const next = [...prev];
      next[index] = next[index] === '.' ? '-' : '.';
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return;
    
    setIsLoading(true);
    try {
      let result;
      const morseString = morseCode.join('');
      
      if (isLogin) {
        if (loginAuthMode === 'password') {
          result = await backend.login(email, password);
        } else {
          result = await backend.login(email, undefined, morseString);
        }
      } else {
        result = await backend.register(
          username, 
          email, 
          password, 
          useMorseInRegister ? morseString : undefined
        );
      }
      onLogin(result.name);
    } catch (err: any) {
      setError(err.message || 'Temporal Sync Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0b0d] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05)_0%,transparent_60%)] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#c5a059]/10 to-transparent" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,160,89,0.1)]">
            <ShieldCheck size={40} className="text-[#c5a059]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 leading-none">Chronos</h1>
          <p className="text-[10px] font-black text-[#c5a059] tracking-[0.4em] uppercase opacity-60">Identity Interface</p>
        </div>

        <div className="bg-[#111318]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={32} className="text-[#c5a059]" />
          </div>
          
          <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase">
            {isLogin ? t.login : t.register}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-in shake duration-300">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">{t.username}</label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c5a059] transition-colors" />
                  <input 
                    type="text"
                    maxLength={30}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Commander Alias"
                    className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-white/5 outline-none focus:border-[#c5a059]/40 focus:ring-1 focus:ring-[#c5a059]/20 transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">{t.email}</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c5a059] transition-colors" />
                <input 
                  type="email"
                  value={email}
                  maxLength={30}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nasa-id@nexus.gov"
                  className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-white/5 outline-none focus:border-[#c5a059]/40 focus:ring-1 focus:ring-[#c5a059]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Login Mode Toggle */}
            {isLogin && (
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 mb-2">
                <button 
                  type="button"
                  onClick={() => setLoginAuthMode('password')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${loginAuthMode === 'password' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/30'}`}
                >
                  <Lock size={12} /> Key-Code
                </button>
                <button 
                  type="button"
                  onClick={() => setLoginAuthMode('morse')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${loginAuthMode === 'morse' ? 'bg-[#c5a059] text-black shadow-lg' : 'text-white/30'}`}
                >
                  <Fingerprint size={12} /> Temporal
                </button>
              </div>
            )}

            {/* Conditional Password Input */}
            {(!isLogin || (isLogin && loginAuthMode === 'password')) && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">{t.password}</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c5a059] transition-colors" />
                  <input 
                    type="password"
                    maxLength={20}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 text-sm text-white placeholder:text-white/5 outline-none focus:border-[#c5a059]/40 focus:ring-1 focus:ring-[#c5a059]/20 transition-all"
                    required={!isLogin || (isLogin && loginAuthMode === 'password')}
                  />
                </div>
              </div>
            )}

            {/* Registration Morse Option */}
            {!isLogin && (
              <div className="space-y-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setUseMorseInRegister(!useMorseInRegister)}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${useMorseInRegister ? 'text-[#c5a059]' : 'text-white/30'}`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useMorseInRegister ? 'bg-[#c5a059] border-[#c5a059]' : 'border-white/20'}`}>
                    {useMorseInRegister && <ArrowRight size={10} className="text-black" />}
                  </div>
                  Optional Temporal Pattern (8-bit)
                </button>
                
                {useMorseInRegister && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <MorseGrid bits={morseCode} onToggle={toggleMorseBit} disabled={isLoading} />
                  </div>
                )}
              </div>
            )}

            {/* Login Morse Input */}
            {isLogin && loginAuthMode === 'morse' && (
              <div className="space-y-2 animate-in zoom-in-95 duration-300">
                <label className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest ml-1">Input 8-Bit Pattern</label>
                <MorseGrid bits={morseCode} onToggle={toggleMorseBit} disabled={isLoading} />
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden mt-6 ${
                isLoading 
                ? 'bg-white/5 text-white/20 cursor-wait' 
                : 'bg-[#c5a059] text-black shadow-[0_10px_30px_rgba(197,160,89,0.3)] active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Dna size={18} />
                  {isLogin ? t.submit_login : t.submit_register}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-[10px] font-black text-white/30 hover:text-[#c5a059] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? t.no_account : t.has_account}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">Temporal Encryption V4.0.2 // STABLE</p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

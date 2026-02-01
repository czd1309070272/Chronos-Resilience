
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sliders, User, Bot, Sparkles, X, Check, Brain, Shield, UserPlus, ChevronLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { backend } from '../backend';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface CoachViewProps {
  onBack?: () => void;
  language: 'en' | 'zh-TW';
}

const CoachView: React.FC<CoachViewProps> = ({ onBack, language }) => {
  const t = translations[language].coach;
  
  // Movie accuracy: Honesty 90% is default, Humor 75% is default
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: language === 'en' 
        ? "Greetings, Alex. I am TARS. Your life telemetry is synced. Honesty is at 90%, humor level is at 75%. How can I assist with your Plan A today?"
        : "你好 Alex，我是 TARS。你的生命遙測數據已同步。誠實度已設為 90%，幽默感已設為 75%。今天我可以如何協助你的 A 計劃？",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Movie specific settings
  const [honesty, setHonesty] = useState(90);
  const [humor, setHumor] = useState(75);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Use backend.askTARS to generate TARS responses based on personality settings
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userPrompt = inputValue;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userPrompt,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call centralized backend AI interface
      const aiResponse = await backend.askTARS(userPrompt, honesty, humor, language);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message || (language === 'en' ? "Static interference detected." : "檢測到靜電干擾。"),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0b0d] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.03)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-[#0a0b0d]/80 backdrop-blur-xl border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors mr-1">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/30 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
            <Bot size={20} className="text-[#c5a059]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-none uppercase tracking-tight">{t.title}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-1 h-1 rounded-full bg-[#c5a059] animate-pulse" />
              <p className="text-[9px] font-black text-[#c5a059]/70 uppercase tracking-[0.15em]">H: {honesty}% • U: {humor}%</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/5 rounded-2xl border border-white/5 text-white/40 hover:text-[#c5a059] hover:bg-[#c5a059]/5 transition-all active:scale-95"
        >
          <Sliders size={18} />
        </button>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto no-scrollbar px-6 py-8 space-y-8 z-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-400`}>
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mr-3 mt-1 border border-white/5 shrink-0">
                <Bot size={12} className="text-[#c5a059]" />
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-[2rem] ${
              msg.sender === 'user' 
                ? 'bg-[#c5a059] text-black font-bold rounded-tr-none shadow-[0_10px_25px_rgba(197,160,89,0.2)]' 
                : 'bg-[#111318] border border-white/5 text-white/90 rounded-tl-none shadow-xl'
            }`}>
              <p className="text-[13px] leading-relaxed tracking-tight font-medium whitespace-pre-wrap">{msg.text}</p>
              <div className="flex items-center justify-end gap-1.5 mt-3 opacity-30">
                <span className={`text-[8px] font-mono font-black uppercase tracking-widest ${msg.sender === 'user' ? 'text-black' : 'text-white'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'user' && <Check size={8} className="text-black" />}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mr-3 mt-1 border border-white/5">
              <Bot size={12} className="text-[#c5a059] animate-pulse" />
            </div>
            <div className="bg-[#111318] border border-white/5 p-4 rounded-[2rem] rounded-tl-none flex items-center gap-2 shadow-sm">
              <Loader2 size={14} className="text-[#c5a059] animate-spin" />
              <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 pb-10 pt-4 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d] to-transparent z-20">
        <div className="relative group">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            placeholder={isLoading ? "TARS is thinking..." : t.input_placeholder}
            className="w-full h-16 bg-[#111318] border border-white/5 rounded-[2rem] pl-6 pr-16 text-[13px] font-medium text-white placeholder:text-white/10 outline-none focus:border-[#c5a059]/40 focus:bg-[#16181d] focus:shadow-[0_0_25px_rgba(197,160,89,0.05)] transition-all disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={`absolute right-2 top-2 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-[#c5a059] text-black shadow-[0_5px_15px_rgba(197,160,89,0.4)] active:scale-90' 
                : 'bg-white/5 text-white/10 cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-center text-[9px] font-black text-white/10 uppercase tracking-[0.2em] mt-4">AI Advisor • Chronos Intelligence V1.0</p>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowSettings(false)} />
          <div className="relative bg-[#0d0f14] border-t border-[#c5a059]/20 rounded-t-[3rem] p-8 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full duration-500 cubic-bezier(0.23, 1, 0.32, 1)">
            <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
            
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <Sliders className="text-[#c5a059]" size={20} />
                <h2 className="text-xl font-black tracking-tight uppercase">{t.settings}</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="p-3 bg-white/5 rounded-2xl text-white/40 border border-white/5 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-12">
              {/* Honesty Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t.persona}</label>
                   <span className="text-2xl font-mono font-black text-[#c5a059]">{honesty}%</span>
                </div>
                <div className="relative">
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={honesty}
                    onChange={(e) => setHonesty(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                  />
                </div>
                {honesty > 90 && (
                  <div className="flex items-center gap-2 text-red-500 animate-pulse">
                    <AlertTriangle size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">{t.warning_high}</span>
                  </div>
                )}
              </div>

              {/* Humor Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{t.tone}</label>
                   <span className="text-2xl font-mono font-black text-white">{humor}%</span>
                </div>
                <div className="relative">
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={humor}
                    onChange={(e) => setHumor(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
                {humor > 90 && (
                  <div className="flex items-center gap-2 text-[#c5a059]">
                    <Sparkles size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest">{t.warning_humor}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full h-16 bg-[#c5a059] text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-[0_15px_35px_rgba(197,160,89,0.2)] mt-4 active:scale-95 transition-all"
              >
                {t.sync}
              </button>
            </div>
            <div className="h-10" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachView;


import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Layout, Sparkles, Play, Pause, TrendingUp, Lightbulb, Zap, Plus, X, Mic, Image as ImageIcon, Check, Loader2, Trash2, Orbit, AlertTriangle } from 'lucide-react';
import { LogEntry } from '../types';
import { translations } from '../translations';
import { backend } from '../backend';

interface LogsViewProps {
  language: 'en' | 'zh-TW';
  logs: LogEntry[];
  onUpdateLogs: (logs: LogEntry[]) => void;
  onOverlayStateChange?: (isOpen: boolean) => void;
}

const PulseGraph = ({ logsCount, language }: { logsCount: number; language: 'en' | 'zh-TW' }) => {
  const rows = 2;
  const cols = 20;
  const t = translations[language].logs;
  
  return (
    <div className="bg-[#111318]/40 border border-[#c5a059]/10 rounded-[2.5rem] p-6 mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[10px] font-black text-[#c5a059] tracking-[0.2em] uppercase">{t.pulse_title}</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-[#c5a059]">{logsCount + 280}</span>
          <span className="text-[10px] font-bold text-white/30 uppercase">Logs</span>
        </div>
      </div>
      
      <div className="grid grid-cols-20 gap-1.5 mb-4">
        {Array.from({ length: rows * cols }).map((_, i) => {
          const intensity = Math.random();
          let colorClass = "bg-white/5";
          let glowClass = "";
          
          if (intensity > 0.9) {
            colorClass = "bg-[#c5a059]";
            glowClass = "shadow-[0_0_8px_rgba(197,160,89,0.8)]";
          } else if (intensity > 0.7) {
            colorClass = "bg-[#c5a059]/60";
          } else if (intensity > 0.4) {
            colorClass = "bg-[#c5a059]/20";
          }
          
          return (
            <div 
              key={i} 
              className={`aspect-square rounded-[2px] ${colorClass} ${glowClass}`}
            />
          );
        })}
      </div>
      
      <div className="flex justify-end items-center gap-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
        <span>{t.less}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-[1px] bg-white/5"></div>
          <div className="w-2 h-2 rounded-[1px] bg-[#c5a059]/20"></div>
          <div className="w-2 h-2 rounded-[1px] bg-[#c5a059]/60"></div>
          <div className="w-2 h-2 rounded-[1px] bg-[#c5a059]"></div>
        </div>
        <span>{t.more}</span>
      </div>
    </div>
  );
};

const Tag: React.FC<{ tag: LogEntry['tags'][0] }> = ({ tag }) => {
  const getIcon = () => {
    switch (tag.type) {
      case 'growth': return <TrendingUp size={12} />;
      case 'insight': return <Lightbulb size={12} />;
      case 'mindfulness': return <Zap size={12} />;
      default: return null;
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111318] border border-[#c5a059]/20 rounded-full text-[9px] font-black text-[#c5a059] uppercase tracking-tighter">
      {getIcon()}
      {tag.label}
    </div>
  );
};

const LogItem: React.FC<{ 
  entry: LogEntry; 
  isLast: boolean; 
  isNewest?: boolean; 
  showMonthHeader?: string;
  onDeleteRequest: (id: string) => void;
  language: 'en' | 'zh-TW';
}> = ({ entry, isLast, isNewest, showMonthHeader, onDeleteRequest, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupAudio = () => {
    // 關鍵修正：先暫停並移除所有監聽器，防止清理過程觸發 onerror 通知
    if (audioRef.current) {
      const audio = audioRef.current;
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.src = "";
      audio.load(); // 釋放解碼資源
      audioRef.current = null;
    }
    
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  const togglePlayback = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!entry.voiceData) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      if (!audioRef.current) {
        let src = entry.voiceData;
        
        if (src.startsWith('idb://')) {
          const blob = await backend.getFileBlob(src);
          if (blob) {
            objectUrlRef.current = URL.createObjectURL(blob);
            src = objectUrlRef.current;
          } else {
            throw new Error("Blob missing");
          }
        }

        const audio = new Audio();
        audio.src = src;
        audio.load();

        audio.onended = () => setIsPlaying(false);
        audio.onerror = (err) => {
          // 如果是因為組件卸載或手動清理導致的錯誤，則不發送通知
          if (audioRef.current === null) return;
          console.error("Audio Playback Error:", err);
          setIsPlaying(false);
          backend.notify(language === 'en' ? 'Signal decoherence detected.' : '偵測到信號退相干（播放失敗）。', 'warning');
        };
        
        audioRef.current = audio;
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio Toggle Error:", err);
      // 只有當組件還活著時才報錯
      if (audioRef.current) {
        backend.notify(language === 'en' ? 'Link failure.' : '同步鏈接失效。', 'warning');
      }
      cleanupAudio();
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleOpenWipeConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRequest(entry.id);
    setShowActions(false);
  };

  return (
    <div className={`relative pl-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${showMonthHeader ? 'pt-14' : ''}`}>
      {showMonthHeader && (
        <div className="absolute top-2 right-0 z-10">
          <div className="px-3 py-1 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full text-[9px] font-black text-[#c5a059] uppercase shadow-[0_0_15px_rgba(197,160,89,0.1)] backdrop-blur-md">
            {showMonthHeader}
          </div>
        </div>
      )}

      <div className="absolute left-0 top-3 w-8 h-8 flex items-center justify-center z-10">
        <div className={`w-3 h-3 rounded-full bg-[#0a0b0d] border-2 transition-all duration-500 ${
          isNewest 
            ? 'border-[#c5a059] bg-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,1)] scale-110' 
            : entry.isHighlight 
              ? 'border-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.6)]' 
              : 'border-white/20'
        }`} />
      </div>
      
      {!isLast && (
        <div className="absolute left-4 top-11 bottom-[-32px] w-[1px] bg-gradient-to-b from-white/10 to-white/5" />
      )}

      <div 
        onClick={() => setShowActions(!showActions)}
        className={`bg-[#111318]/60 border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden group hover:border-[#c5a059]/20 transition-all cursor-pointer ${isNewest ? 'border-[#c5a059]/10 bg-[#111318]/80' : ''}`}
      >
        {entry.isHighlight && <Sparkles size={16} className="absolute top-4 right-4 text-[#c5a059]/40" />}
        
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-20 ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button 
            onClick={handleOpenWipeConfirmation}
            className="flex flex-col items-center gap-2 text-red-500 hover:scale-110 active:scale-95 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Trash2 size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Wipe Signal</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
            className="absolute top-4 right-4 text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-[11px] font-bold text-[#c5a059] mb-4 tracking-tight uppercase">
          {entry.time} • {entry.date}
        </div>
        <p className="text-[13px] leading-relaxed text-white/80 font-medium mb-6 selectable-content">{entry.content}</p>

        {entry.images && entry.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {entry.images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-white/5">
                <img src={img} alt="Log" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
              </div>
            ))}
          </div>
        )}
        
        {entry.hasVoice && entry.voiceData && (
          <button 
            disabled={isLoadingAudio}
            onClick={togglePlayback} 
            className="bg-[#0a0b0d]/80 border border-white/5 rounded-full px-4 py-3 flex items-center gap-4 mb-6 hover:bg-[#111318] transition-colors w-full disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center text-black">
              {isLoadingAudio ? <Loader2 size={14} className="animate-spin" /> : isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </div>
            <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest">
              {isLoadingAudio ? 'Syncing...' : `Audio Chronicle • ${entry.duration}`}
            </span>
          </button>
        )}
        
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag, idx) => <Tag key={idx} tag={tag} />)}
        </div>
      </div>
    </div>
  );
};

const WipeConfirmationModal: React.FC<{ 
  language: 'en' | 'zh-TW'; 
  onClose: () => void; 
  onConfirm: () => void;
  isDeleting: boolean;
}> = ({ language, onClose, onConfirm, isDeleting }) => {
  const t = translations[language].logs;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 p-6">
      <div className="relative w-full max-w-sm bg-[#0d0f14] border border-red-500/30 rounded-[3rem] p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-500 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="w-full h-1 bg-red-500 animate-[scan_3s_linear_infinite]" />
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 animate-pulse">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          
          <h2 className="text-lg font-black text-white uppercase tracking-tight mb-4">
            {t.confirm_wipe_title}
          </h2>
          
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-10">
            {t.confirm_wipe_desc}
          </p>
          
          <div className="flex flex-col w-full gap-3">
            <button 
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full h-14 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-[0_10px_25px_rgba(239,68,68,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {t.wipe_confirmed}
            </button>
            
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="w-full h-14 bg-white/5 text-white/40 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] active:scale-95 transition-all"
            >
              {t.abort}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateLogOverlay: React.FC<{ language: 'en' | 'zh-TW'; onClose: () => void; onSave: (entry: LogEntry) => void }> = ({ language, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{label: string, type: 'growth'|'insight'|'mindfulness'|'custom'}[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [hasVoice, setHasVoice] = useState(false);
  const [voiceDataId, setVoiceDataId] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[language].logs;

  const tagOptions: {label: string, type: 'growth'|'insight'|'mindfulness'}[] = [
    { label: language === 'en' ? '#GROWTH' : '#進化', type: 'growth' },
    { label: language === 'en' ? '#INSIGHT' : '#發現', type: 'insight' },
    { label: language === 'en' ? '#MINDFULNESS' : '#停滯', type: 'mindfulness' }
  ];

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTag = (tag: typeof tagOptions[0]) => {
    if (selectedTags.some(t => t.type === tag.type)) {
      setSelectedTags(prev => prev.filter(t => t.type !== tag.type));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    setIsUploading(true);
    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 2); i++) {
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(files[i]);
        });
        newImages.push(dataUrl);
      } catch (err) {
        console.error("Upload error", err);
      }
    }
    setImages(prev => [...prev, ...newImages].slice(0, 4));
    setIsUploading(false);
  };

  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') 
            ? 'audio/ogg;codecs=opus' 
            : 'audio/mp4';

        const recorder = new MediaRecorder(stream, { mimeType });
          
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          setIsUploading(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
          try {
            const idbPath = await backend.uploadFile(audioBlob);
            setVoiceDataId(idbPath);
            setHasVoice(true);
            backend.notify(language === 'en' ? 'Signal localized.' : '信號已本地化。', 'success');
          } catch (e) {
            backend.notify('STORAGE_OVERFLOW', 'warning');
          } finally {
            setIsUploading(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
        backend.notify(language === 'en' ? 'Initializing comm link...' : '正在初始化通訊鏈接...', 'info');
      } catch (err) {
        backend.notify(language === 'en' ? 'Microphone offline.' : '麥克風離線。', 'warning');
      }
    }
  };

  const handleSave = async () => {
    if (!content.trim() || isUploading) return;
    setIsUploading(true);
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    const newEntry: LogEntry = {
      id: Date.now().toString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: formattedDate,
      content,
      images: images.length > 0 ? images : undefined,
      hasVoice,
      voiceData: voiceDataId || undefined,
      duration: hasVoice ? formatSeconds(recordingSeconds) : undefined,
      tags: selectedTags.length > 0 ? selectedTags : [{ label: 'LOG_ENTRY', type: 'custom' }],
      isHighlight
    };
    
    try {
      await backend.addLog(newEntry);
      onSave(newEntry);
      backend.notify(language === 'en' ? 'Transmission success.' : '發射成功。', 'success');
      onClose(); 
    } catch (err) {
      backend.notify(language === 'en' ? 'Archive error.' : '存檔錯誤。', 'warning');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-[#0d0f14] border-t border-[#c5a059]/20 rounded-t-[3.5rem] p-8 shadow-[0_-25px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full duration-500 ease-out flex flex-col max-h-[90vh]">
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />
        
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-black tracking-tight text-white uppercase">{t.new_title}</h2>
          <button 
            onClick={() => setIsHighlight(!isHighlight)}
            className={`p-2.5 rounded-xl border transition-all ${isHighlight ? 'bg-[#c5a059]/20 border-[#c5a059]/40 text-[#c5a059]' : 'bg-white/5 border-white/5 text-white/20'}`}
          >
            <Sparkles size={20} className={isHighlight ? 'animate-pulse' : ''} />
          </button>
        </div>

        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={language === 'en' ? "Commence transmission..." : "開始數據傳輸..."}
          className="w-full flex-grow min-h-[120px] bg-transparent text-lg font-medium text-white/90 placeholder:text-white/10 outline-none resize-none no-scrollbar mb-6"
        />

        <div className="space-y-6 mb-8 shrink-0">
          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0">
                   <img src={img} className="w-full h-full object-cover" alt="preview" />
                   <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-black/60 p-1 text-white/60"><X size={10}/></button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
             {tagOptions.map(tag => (
               <button 
                key={tag.type}
                onClick={() => handleToggleTag(tag)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${selectedTags.some(t => t.type === tag.type) ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.3)]' : 'bg-white/5 text-white/30 border-white/5'}`}
               >
                 {tag.label}
               </button>
             ))}
          </div>

          <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-2xl">
             <div className="flex items-center gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-xl transition-all ${images.length > 0 ? 'text-[#c5a059] bg-[#c5a059]/10' : 'text-white/30 hover:bg-white/5'}`}
                >
                   <ImageIcon size={20} />
                   <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                </button>
                <div className="flex items-center gap-2 px-1">
                  <button 
                    onClick={handleRecord}
                    className={`p-3 rounded-xl transition-all ${hasVoice ? 'text-[#c5a059] bg-[#c5a059]/10' : isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-white/30 hover:bg-white/5'}`}
                  >
                    <Mic size={20} />
                  </button>
                  {(isRecording || hasVoice) && (
                    <span className={`text-[10px] font-mono font-black w-10 text-center ${isRecording ? 'text-red-500 animate-pulse' : 'text-[#c5a059]'}`}>
                      {formatSeconds(recordingSeconds)}
                    </span>
                  )}
                </div>
             </div>
             
             <div className="flex items-center gap-2 pr-2">
                <span className="text-[10px] font-mono font-black text-white/20 uppercase tracking-widest">Protocol: V5-Secure</span>
                <div className="w-2 h-2 rounded-full bg-[#c5a059] shadow-[0_0_8px_#c5a059] animate-pulse" />
             </div>
          </div>
        </div>

        <div className="flex gap-4 shrink-0">
          <button onClick={onClose} className="flex-1 h-16 bg-white/5 text-white/60 font-black text-xs uppercase tracking-widest rounded-3xl active:scale-95 transition-all">{t.discard}</button>
          <button 
            onClick={handleSave} 
            disabled={isUploading || !content.trim()} 
            className="flex-[2.5] h-16 bg-[#c5a059] text-black font-black text-xs uppercase tracking-[0.2em] rounded-3xl flex items-center justify-center gap-2 shadow-[0_15px_30px_rgba(197,160,89,0.3)] active:scale-95 transition-all"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
            {t.save_btn}
          </button>
        </div>
      </div>
    </div>
  );
};

const LogsView: React.FC<LogsViewProps> = ({ language, logs: initialLogs, onUpdateLogs, onOverlayStateChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<LogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [isSyncingMore, setIsSyncingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isActuallyDeleting, setIsActuallyDeleting] = useState(false);

  const PAGE_SIZE = 10;
  const loaderRef = useRef<HTMLDivElement>(null);
  const t = translations[language].logs;

  const getMonthYear = (dateStr: string) => {
    const parts = dateStr.replace(',', '').split(' ');
    if (parts.length < 3) return dateStr.toUpperCase();
    return `${parts[0]} ${parts[2]}`.toUpperCase();
  };

  useEffect(() => {
    setDisplayedLogs(initialLogs.slice(0, (page + 1) * PAGE_SIZE));
    setHasMore(initialLogs.length > (page + 1) * PAGE_SIZE);
  }, [initialLogs, page]);

  const loadMoreLogs = async () => {
    if (isSyncingMore || !hasMore) return;
    setIsSyncingMore(true);
    const nextPage = page + 1;
    const result = await backend.getLogsPaginated(nextPage, PAGE_SIZE);
    setDisplayedLogs(prev => [...prev, ...result.data]);
    setPage(nextPage);
    setHasMore(result.hasMore);
    setIsSyncingMore(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLogId || isActuallyDeleting) return;
    setIsActuallyDeleting(true);
    try {
      await backend.deleteLog(deletingLogId);
      const updated = initialLogs.filter(l => l.id !== deletingLogId);
      onUpdateLogs(updated);
      backend.notify(language === 'en' ? 'Signal erased.' : '信號已擦除。', 'info');
      setDeletingLogId(null);
    } catch (err) {
      backend.notify(language === 'en' ? 'Wipe failure.' : '擦除失敗。', 'warning');
    } finally {
      setIsActuallyDeleting(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isSyncingMore) loadMoreLogs();
    }, { threshold: 1.0 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isSyncingMore, page]);

  return (
    <div className="min-h-full pb-40 relative">
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 z-30 bg-[#0a0b0d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20">
          <Layout size={20} className="text-[#c5a059]" />
        </div>
        <h1 className="text-xl font-black tracking-tight">{t.title}</h1>
        <button onClick={() => { setIsCreating(true); onOverlayStateChange?.(true); }} className="w-10 h-10 rounded-xl bg-[#c5a059] flex items-center justify-center active:scale-90 transition-all">
          <Plus size={24} className="text-black" strokeWidth={3} />
        </button>
      </div>

      <div className="px-6 pt-6">
        <PulseGraph logsCount={initialLogs.length} language={language} />
        <div className="relative pt-8">
          <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/5" />
          {displayedLogs.map((log, i) => {
            const currentMY = getMonthYear(log.date);
            const prevMY = i > 0 ? getMonthYear(displayedLogs[i - 1].date) : null;
            const showMonthHeader = currentMY !== prevMY ? currentMY : undefined;

            return (
              <LogItem 
                key={log.id} 
                entry={log} 
                isLast={i === displayedLogs.length - 1 && !hasMore} 
                isNewest={i === 0 && page === 0}
                showMonthHeader={showMonthHeader}
                onDeleteRequest={(id) => setDeletingLogId(id)}
                language={language}
              />
            );
          })}

          {hasMore && (
            <div ref={loaderRef} className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Orbit size={24} className="text-[#c5a059] animate-spin" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059]/60">Syncing with Station...</p>
            </div>
          )}
        </div>
      </div>

      {isCreating && (
        <CreateLogOverlay 
          language={language} 
          onClose={() => { setIsCreating(false); onOverlayStateChange?.(false); }} 
          onSave={(entry) => onUpdateLogs([entry, ...initialLogs])} 
        />
      )}

      {deletingLogId && (
        <WipeConfirmationModal 
          language={language}
          isDeleting={isActuallyDeleting}
          onClose={() => setDeletingLogId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default LogsView;

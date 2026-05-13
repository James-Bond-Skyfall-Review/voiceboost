import { Mic, MicOff, Settings2, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { ProficiencyLevel } from '@/types';
import { cn } from '@/lib/utils';

interface ControlBarProps {
  isRecording: boolean;
  proficiency: ProficiencyLevel;
  onToggleRecording: () => void;
  onProficiencyChange: (level: ProficiencyLevel) => void;
  isProcessing: boolean;
  onToggleDebug: () => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  isSpeaking: boolean;
}

export function ControlBar({
  isRecording,
  proficiency,
  onToggleRecording,
  onProficiencyChange,
  isProcessing,
  onToggleDebug,
  speechRate,
  onSpeechRateChange,
  isSpeaking,
}: ControlBarProps) {
  return (
    <footer className="z-40 p-6 pb-10 bg-black/40 backdrop-blur-2xl border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Settings Label & Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Speech Rate</label>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/40">{speechRate}x</span>
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div 
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(speechRate / 1.5) * 100}%` }}
                />
              </div>
              <select 
                value={speechRate}
                onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                className="bg-transparent text-[10px] font-mono font-bold text-blue-400 focus:outline-none cursor-pointer border border-white/10 rounded px-1"
              >
                {[0.5, 0.8, 1.0, 1.2, 1.5].map(r => (
                  <option key={r} value={r} className="bg-gray-900">{r}x</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleDebug}
              className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <Settings2 className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* Center: Mic & Proficiency */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Proficiency</span>
            <div className="flex gap-1.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as ProficiencyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onProficiencyChange(level)}
                  className={cn(
                    "px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all border",
                    proficiency === level 
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-400" 
                      : "bg-white/5 border-white/5 text-white/30 hover:text-white/60"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            {isRecording && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute w-20 h-20 bg-red-500 rounded-full blur-2xl"
              />
            )}
            {!isRecording && isSpeaking && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.2, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute w-20 h-20 bg-blue-500 rounded-full blur-2xl"
              />
            )}
            
            <motion.button
              onClick={onToggleRecording}
              disabled={isProcessing}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all z-10 border-4 border-black/40 shadow-2xl",
                isRecording 
                  ? "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]" 
                  : "bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]",
                isProcessing && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>
            
            {isProcessing && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none">Thinking</span>
              </div>
            )}
          </div>

          <div className="hidden sm:block">
             <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors text-white/80">Skip Turn</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

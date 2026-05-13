import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transcript } from './components/VoiceTutor/Transcript';
import { ControlBar } from './components/VoiceTutor/ControlBar';
import { Visualizer } from './components/VoiceTutor/Visualizer';
import { DebugConsole } from './components/VoiceTutor/DebugConsole';
import { useGeminiLive } from './hooks/useGeminiLive';
import { Message, ProficiencyLevel, DebugLog } from './types';
import { SPEECH_RATES } from './constants';
import { cn } from './lib/utils';

export default function App() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('Beginner');
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState(SPEECH_RATES.Beginner);

  // Gemini Live Hook
  const { 
    isActive, 
    isReady, 
    isSpeaking, 
    error: liveError, 
    connect, 
    disconnect 
  } = useGeminiLive(proficiency);

  // Helpers
  const addLog = useCallback((message: string, type: DebugLog['type'] = 'info') => {
    setLogs(prev => [{
      id: uuidv4(),
      timestamp: Date.now(),
      type,
      message
    }, ...prev].slice(0, 100));
  }, []);

  // Handle Response/Transcript update from hook
  const handleLiveMessage = useCallback((msg: Message) => {
    setMessages(prev => {
      // If the message is from assistant and the last one was also and it's short, maybe merge?
      // For now just append.
      return [...prev, msg].slice(-50);
    });
  }, []);

  // Handle Level Change
  const handleProficiencyChange = useCallback((level: ProficiencyLevel) => {
    setProficiency(level);
    setSpeechRate(SPEECH_RATES[level]);
    addLog(`Changed proficiency to ${level}. Reconnect to apply.`);
  }, [addLog]);

  // Handle Toggle
  const handleToggleRecording = useCallback(() => {
    if (isActive) {
      addLog("Ending session");
      disconnect();
    } else {
      addLog("Starting live session...");
      connect(handleLiveMessage);
    }
  }, [isActive, connect, disconnect, handleLiveMessage, addLog]);

  useEffect(() => {
    if (liveError) addLog(`Live Error: ${liveError}`, 'error');
    if (isReady) addLog("Gemini is ready and listening!", 'success');
  }, [liveError, isReady, addLog]);

  return (
    <div className="flex flex-col h-screen bg-[#05070A] text-[#E0E6ED] overflow-hidden safe-paddings relative transition-colors duration-500">
      {/* Ambient Backgrounds */}
      <div className="ambient-bg-1" />
      <div className="ambient-bg-2" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white text-lg font-bold tracking-tighter">V.</span>
          </div>
          <div>
            <h1 className="text-xs font-semibold tracking-widest uppercase opacity-90">VoiceTutor AI</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={cn("w-1.5 h-1.5 rounded-full ring-2 ring-offset-2 ring-offset-black/20", (isSpeaking || isReady) ? "bg-blue-500 animate-pulse ring-blue-500/30" : "bg-gray-500 ring-gray-500/30")} />
              <span className="text-[9px] text-[#E0E6ED]/60 font-mono tracking-widest uppercase">
                {isSpeaking ? "AI Speaking" : isReady ? "Listening..." : "System Idle"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Latency</span>
            <span className="text-[10px] font-mono text-white/80">{latency ? `${latency}ms` : '--'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-24 overflow-hidden relative z-10">
        <Transcript messages={messages} />
        
        {/* Active Speech Visualizer */}
        <div className="absolute top-28 left-0 right-0 flex justify-center pointer-events-none z-20">
          <Visualizer isActive={isActive && !isSpeaking} isSpeaking={isSpeaking} />
        </div>
      </main>

      {/* Controls */}
      <ControlBar 
        isRecording={isActive && !isSpeaking}
        proficiency={proficiency}
        onToggleRecording={handleToggleRecording}
        onProficiencyChange={handleProficiencyChange}
        isProcessing={isActive && !isReady}
        onToggleDebug={() => setIsDebugOpen(true)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        isSpeaking={isSpeaking}
        isAutoListen={false} // Managed by Live context now
        onAutoListenToggle={() => {}} 
      />

      {/* Debug Overly */}
      <DebugConsole 
        logs={logs}
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        latency={latency}
      />

      {/* Responsive Guard */}
      <div className="hidden lg:flex fixed inset-0 bg-gray-900/10 backdrop-blur-sm z-[100] items-center justify-center p-8">
        <div className="bg-white p-8 rounded-3xl max-w-sm text-center shadow-2xl">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">📱</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Mobile Only Design</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            This app is optimized for mobile browser use. Please resize your window or open on your phone for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useEffect, useRef } from 'react';
import { float32ToPcm16, arrayBufferToBase64, base64ToFloat32 } from '@/lib/audio-utils';
import { ProficiencyLevel, Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export function useGeminiLive(proficiency: ProficiencyLevel) {
  const [isActive, setIsActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  const onMessageCallback = useRef<((msg: Message) => void) | null>(null);

  const playNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0 || !audioCtxRef.current) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    isPlayingRef.current = true;
    setIsSpeaking(true);
    const chunk = audioQueueRef.current.shift()!;
    const buffer = audioCtxRef.current.createBuffer(1, chunk.length, 16000);
    buffer.getChannelData(0).set(chunk);
    
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.onended = () => playNextChunk();
    source.start();
  }, []);

  const connect = useCallback(async (onMessage: (msg: Message) => void) => {
    onMessageCallback.current = onMessage;
    setError(null);
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws-live`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'setup', proficiency }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        if (msg.type === 'ready') {
          setIsReady(true);
        } else if (msg.type === 'audio') {
          const float32 = base64ToFloat32(msg.data);
          audioQueueRef.current.push(float32);
          if (!isPlayingRef.current) {
            playNextChunk();
          }
        } else if (msg.type === 'transcription') {
          onMessage({
            id: uuidv4(),
            role: 'assistant',
            content: msg.data,
            timestamp: Date.now()
          });
        } else if (msg.type === 'user_transcription') {
           onMessage({
            id: uuidv4(),
            role: 'user',
            content: msg.data,
            timestamp: Date.now()
          });
        } else if (msg.type === 'interrupted') {
          audioQueueRef.current = [];
          // In a real app we'd stop the current source too
        }
      };

      ws.onerror = (e) => {
        console.error("WS Error", e);
        setError("WebSocket connection failed");
      };

      ws.onclose = () => {
        setIsActive(false);
        setIsReady(false);
      };

      // Audio Setup
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && isActive) {
          const input = e.inputBuffer.getChannelData(0);
          const pcm = float32ToPcm16(input);
          const base64 = arrayBufferToBase64(pcm);
          ws.send(JSON.stringify({ type: 'audio', data: base64 }));
        }
      };
      processorRef.current = processor;

      setIsActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [proficiency, playNextChunk, isActive]);

  const disconnect = useCallback(() => {
    setIsActive(false);
    setIsReady(false);
    
    if (wsRef.current) wsRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (processorRef.current) processorRef.current.disconnect();
    if (audioCtxRef.current) audioCtxRef.current.close();
    
    wsRef.current = null;
    streamRef.current = null;
    processorRef.current = null;
    audioCtxRef.current = null;
  }, []);

  return {
    isActive,
    isReady,
    isSpeaking,
    error,
    connect,
    disconnect,
  };
}

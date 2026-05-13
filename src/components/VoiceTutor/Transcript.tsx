import { useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';

interface TranscriptProps {
  messages: Message[];
}

export function Transcript({ messages }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-12 space-y-8 scroll-smooth relative z-10"
    >
      <AnimatePresence initial={false}>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative z-10 backdrop-blur-xl">
                <span className="text-4xl">🎙️</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold tracking-widest uppercase text-white/80">Awaiting Input</p>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Tap the core to begin session</p>
            </div>
          </motion.div>
        )}
        
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className={cn(
              "flex items-start gap-4 max-w-[90%]",
              message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold tracking-tighter shadow-lg",
              message.role === 'user' ? "bg-white/10 text-white/60" : "bg-blue-600 text-white"
            )}>
              {message.role === 'user' ? 'ME' : 'AI'}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "rounded-2xl px-5 py-3 text-sm backdrop-blur-xl border shadow-xl relative",
                message.role === 'user' 
                  ? "bg-white/5 border-white/10 text-white/90 rounded-tr-none italic" 
                  : "bg-blue-600/10 border-blue-500/20 text-white/90 rounded-tl-none"
              )}
            >
              <div className={cn(
                "markdown-body",
                message.role === 'user' ? "prose-invert italic font-light" : ""
              )}>
                <Markdown components={{
                  p: ({ children }) => {
                    const text = String(children);
                    if (text.includes('[FEEDBACK]')) {
                      return (
                        <div className="my-3 p-3 bg-white/5 border border-white/10 rounded-xl text-blue-400 text-xs font-medium">
                          <span className="font-bold mr-1 text-blue-500 uppercase tracking-widest text-[9px]">Feedback:</span>
                          {text.replace('[FEEDBACK]', '').trim()}
                        </div>
                      );
                    }
                    if (text.includes('[TRANSLATE]')) {
                      return (
                        <div className="my-3 p-3 bg-black/20 border border-white/5 rounded-xl text-white/50 text-xs font-mono italic">
                          <span className="font-bold mr-1 text-white/30 uppercase tracking-widest text-[9px] not-italic">Translation:</span>
                          {text.replace('[TRANSLATE]', '').trim()}
                        </div>
                      );
                    }
                    return <p className="leading-relaxed">{children}</p>;
                  },
                  strong: ({ children }) => (
                    <strong className="text-blue-400 font-bold border-b border-blue-400/30 pb-0.5">{children}</strong>
                  )
                }}>{message.content}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

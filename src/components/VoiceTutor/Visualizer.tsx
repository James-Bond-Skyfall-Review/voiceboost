import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface VisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
  className?: string;
}

export function Visualizer({ isActive, isSpeaking, className }: VisualizerProps) {
  const bars = Array.from({ length: 9 });

  return (
    <div className={cn("relative flex items-center justify-center p-8", className)}>
      {/* Ambient Glows */}
      {isActive && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute w-48 h-48 bg-red-500/30 rounded-full blur-3xl pointer-events-none" 
        />
      )}
      {isSpeaking && (
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute w-48 h-48 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" 
        />
      )}

      {/* Visualizer Bars */}
      <div className="flex items-center gap-1.5 h-24 relative z-10">
        {bars.map((_, i) => {
          const height = [8, 16, 24, 32, 20, 12, 6][i % 7];
          return (
            <motion.div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-shadow duration-300",
                isActive 
                  ? "bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]" 
                  : isSpeaking 
                    ? "bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.6)]" 
                    : "bg-white/10"
              )}
              animate={{
                height: (isActive || isSpeaking) 
                  ? [height * 0.5, height, height * 1.5, height] 
                  : 6,
              }}
              transition={{
                repeat: Infinity,
                duration: 0.5 + (i * 0.1),
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

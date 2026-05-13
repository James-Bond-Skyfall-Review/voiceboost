import { DebugLog } from '@/types';
import { X, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DebugConsoleProps {
  logs: DebugLog[];
  isOpen: boolean;
  onClose: () => void;
  latency: number | null;
}

export function DebugConsole({ logs, isOpen, onClose, latency }: DebugConsoleProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="fixed inset-0 z-50 bg-gray-900 flex flex-col font-mono"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Debug Console</span>
              {latency && (
                <span className="text-[10px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded border border-green-800">
                  {latency}ms Latency
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {logs.length === 0 && (
              <p className="text-gray-600 text-xs italic">No logs yet...</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="text-[11px] leading-relaxed break-all">
                <span className="text-gray-500 mr-2">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-blue-400'
                }>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

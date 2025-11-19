import { X } from 'lucide-react';
import ChatEnhanced from '../pages/ChatEnhanced';

interface ChatModalProps {
  personaName: string;
  onClose: () => void;
}

export function ChatModal({ personaName, onClose }: ChatModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#0f0f0f] rounded-2xl border border-white/10 w-full h-[90vh] max-w-6xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-white">Chat with {personaName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
            title="Close chat"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          <ChatEnhanced />
        </div>
      </div>
    </div>
  );
}

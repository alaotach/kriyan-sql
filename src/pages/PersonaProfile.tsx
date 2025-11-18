import { useState } from 'react';
import { MessageCircle, Share2, Heart, Bookmark, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Persona } from '../types';

interface PersonaProfileProps {
  persona: Persona;
  onBack?: () => void;
  onStartChat?: () => void;
}

export function PersonaProfile({ persona, onStartChat }: PersonaProfileProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat();
    } else {
      navigate(`/chat?persona=${persona.name}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#0f0f0f]">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-all text-white/50"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white">Character Profile</h1>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* Persona Header */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl flex-shrink-0">
                  {persona.avatar || persona.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">{persona.name}</h1>
                  <p className="text-white/60 text-lg mb-4">{persona.subtitle || persona.description}</p>
                  <p className="text-white/40 text-sm mb-4">By @creator • 21.2k interactions</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                    {persona.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/5 rounded-full text-sm text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={handleStartChat}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Chat
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-all">
                      <Share2 size={18} />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-all">
                      <Heart size={18} />
                    </button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-all">
                      <Bookmark size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">About</h2>
              <p className="text-white/70 leading-relaxed">
                {persona.longDescription || persona.description || 'A unique AI personality ready to chat with you.'}
              </p>
            </div>

            {/* Stats */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-white">
                    {persona.messageCount?.toLocaleString() || '21.2k'}
                  </p>
                  <p className="text-sm text-white/40">Total Chats</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-400">
                    {persona.category || 'General'}
                  </p>
                  <p className="text-sm text-white/40">Category</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

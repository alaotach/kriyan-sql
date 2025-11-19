import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Share2, 
  Heart, 
  Bookmark,
  MessageCircle,
  Mic,
  History,
  Pin,
  User,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Sparkles,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserConversations, deleteConversation } from '../services/firebase';

interface PersonaInfoSidebarProps {
  personaName: string;
  personaSummary: string;
  onNewChat?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface Conversation {
  id?: string;
  personaName: string;
  title?: string;
  lastMessage?: string;
  timestamp?: any;
}

export const PersonaInfoSidebar = ({ 
  personaName, 
  personaSummary,
  onNewChat,
  isOpen,
  onClose
}: PersonaInfoSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentConversationId = searchParams.get('conversation');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const tags = [
    'Dominant',
    'Twitch Streamer',
    'Never sleeps',
    'Clingy',
    'Gaming',
  ];

  const options = [
    { icon: MessageCircle, label: 'New chat', action: onNewChat },
    { icon: Mic, label: 'Voice', subtitle: 'Default', action: () => setShowVoiceSettings(true) },
    { icon: Pin, label: 'Pinned', action: () => {} },
    { icon: User, label: 'Persona', action: () => setShowPersonaPicker(true) },
  ];

  useEffect(() => {
    loadConversationHistory();
  }, [personaName, user]);

  const loadConversationHistory = async () => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    try {
      const allConversations = await getUserConversations(user.uid);
      // Filter conversations for this persona
      const personaConversations = allConversations
        .filter((conv: any) => conv.personaName === personaName)
        .sort((a: any, b: any) => b.timestamp?.seconds - a.timestamp?.seconds)
        .slice(0, 10); // Show last 10 conversations
      
      setConversations(personaConversations);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat?persona=${personaName}&conversation=${conversationId}`);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    try {
      // Immediately remove from local state for instant UI update
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Delete from server
      await deleteConversation(conversationId);
      
      // If we're viewing the deleted conversation, start a new chat
      if (currentConversationId === conversationId && onNewChat) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
      // Refresh to restore state if deletion failed
      await loadConversationHistory();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 right-0 z-50 w-[280px] sm:w-[320px] bg-[#0f0f0f] border-l border-white/10 overflow-y-auto flex-shrink-0 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
      {/* Persona Header */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl sm:text-3xl mb-2 sm:mb-3">
            {personaName.charAt(0)}
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white mb-1">
            {personaName}
          </h2>
          <p className="text-sm text-white/50 mb-1">By @creator</p>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <MessageCircle size={12} />
            <span>21.2k</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Share2 size={16} className="sm:w-[18px] sm:h-[18px] text-white/60" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Heart size={16} className="sm:w-[18px] sm:h-[18px] text-white/60" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Bookmark size={16} className="sm:w-[18px] sm:h-[18px] text-white/60" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
        <h3 className="text-xs font-medium text-white/40 mb-2 sm:mb-3">About</h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 border border-white/10 rounded-full text-[10px] sm:text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Options List */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
        {options.map((option, index) => {
          const Icon = option.icon;
          return (
            <button
              key={index}
              onClick={option.action}
              className="w-full flex items-center justify-between px-2 sm:px-3 py-2 sm:py-3 hover:bg-white/5 rounded-lg transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Icon size={16} className="sm:w-[18px] sm:h-[18px] text-white/60" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm text-white">{option.label}</div>
                  {option.subtitle && (
                    <div className="text-xs text-white/40">{option.subtitle}</div>
                  )}
                </div>
              </div>
              <ChevronRight 
                size={16} 
                className="text-white/30 group-hover:text-white/50 transition-colors" 
              />
            </button>
          );
        })}
      </div>

      {/* Chat History Section */}
      <div className="flex-shrink-0">
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <History size={14} className="sm:w-4 sm:h-4 text-white/40" />
            <h3 className="text-[10px] sm:text-xs font-medium text-white/40">Chat History</h3>
          </div>
          
          {loadingHistory ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-6 px-4">
              <MessageCircle size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/40">No chat history yet</p>
              <p className="text-xs text-white/30 mt-1">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="relative hover:bg-white/5 rounded-lg transition-all group"
                >
                  <button
                    onClick={() => conv.id && handleConversationClick(conv.id)}
                    className="w-full text-left px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <MessageCircle size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="text-sm text-white font-medium line-clamp-1 group-hover:text-white transition-colors">
                          {conv.title || 'New conversation'}
                        </p>
                        <p className="text-xs text-white/40 line-clamp-1 mt-0.5">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-white/30 mt-1">
                          {formatTimestamp(conv.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => conv.id && handleDeleteConversation(conv.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className="fixed inset-0 lg:inset-y-0 lg:right-0 w-full lg:w-[320px] bg-[#0f0f0f] z-[100] p-4 overflow-y-auto border-l border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Mic size={18} className="sm:w-5 sm:h-5 text-purple-400" />
              Voice Settings
            </h3>
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-white/60" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Enable Voice Input</label>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    voiceEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      voiceEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-white/50">
                {voiceEnabled 
                  ? 'Voice input is enabled. Click the mic button in chat to speak.' 
                  : 'Enable to use voice input instead of typing.'}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-white block mb-2">Voice Output</label>
              <select className="w-full bg-[#1a1a1a] border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                <option className="bg-[#1a1a1a] text-white">None (Text only)</option>
                <option className="bg-[#1a1a1a] text-white">Read responses aloud</option>
                <option className="bg-[#1a1a1a] text-white">Auto-play responses</option>
              </select>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <label className="text-sm font-medium text-white block mb-2">Voice Speed</label>
              <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full" />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persona Quick Picker Modal */}
      {showPersonaPicker && (
        <div className="fixed inset-0 lg:inset-y-0 lg:right-0 w-full lg:w-[320px] bg-[#0f0f0f] z-[100] p-4 overflow-y-auto border-l border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <Users size={18} className="sm:w-5 sm:h-5 text-purple-400" />
              Switch Persona
            </h3>
            <button
              onClick={() => setShowPersonaPicker(false)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-white/60" />
            </button>
          </div>

          <p className="text-sm text-white/60 mb-4">
            Quickly switch to a different persona for your current chat
          </p>

          <div className="space-y-2">
            {['Kriyan', 'Kritika', 'Aloo', 'Developer', 'Therapist', 'Writer'].map((persona) => (
              <button
                key={persona}
                onClick={() => {
                  navigate(`/chat?persona=${encodeURIComponent(persona)}`);
                  setShowPersonaPicker(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {persona.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{persona}</div>
                  <div className="text-xs text-white/40">Click to switch</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              navigate('/');
              setShowPersonaPicker(false);
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all text-purple-400 text-sm font-medium"
          >
            <Sparkles size={16} />
            View All Personas
          </button>
        </div>
      )}
    </aside>
    </>
  );
};

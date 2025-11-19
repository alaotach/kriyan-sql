import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Compass, 
  Search, 
  Sparkles,
  User,
  Settings,
  LogOut,
  Crown,
  Brain,
  ChevronLeft,
  MessageCircle,
  Trash2,
  Mic,
  Palette,
  Pin,
  Users,
  Wand2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserConversations, deleteConversation } from '../services/firebase';
import { PersonaCreatorModal } from './PersonaCreatorModal';
import { MemoryModal } from './MemoryModal';

interface SidebarProps {
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

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentConversationId = searchParams.get('conversation');
  const currentPersona = searchParams.get('persona');
  const { user, logOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [pinnedChats, setPinnedChats] = useState<Set<string>>(new Set());
  const [showPersonaCreator, setShowPersonaCreator] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [recentPersonas, setRecentPersonas] = useState<string[]>([]);

  useEffect(() => {
    loadConversations();
  }, [user]);

  // Reload conversations when sidebar opens and poll every 2 seconds while open
  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
      
      // Poll for updates every 2 seconds while sidebar is open
      const interval = setInterval(() => {
        loadConversations();
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, user]);

  // Reload conversations when the conversation ID changes (new chat created or switched)
  useEffect(() => {
    if (user && currentConversationId) {
      loadConversations();
    }
  }, [currentConversationId, user]);

  const loadConversations = async () => {
    if (!user) {
      setLoadingConversations(false);
      return;
    }

    try {
      const allConversations = await getUserConversations(user.uid);
      const sortedConversations = allConversations
        .sort((a: any, b: any) => b.timestamp?.seconds - a.timestamp?.seconds);
      
      setConversations(sortedConversations as any);
      
      // Extract unique recent personas
      const personas = Array.from(new Set(
        sortedConversations.map((c: any) => c.personaName)
      )).slice(0, 10);
      setRecentPersonas(personas);
      
      // Load pinned chats from localStorage
      const saved = localStorage.getItem('pinnedChats');
      if (saved) {
        setPinnedChats(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const togglePinChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPinned = new Set(pinnedChats);
    if (newPinned.has(chatId)) {
      newPinned.delete(chatId);
    } else {
      newPinned.add(chatId);
    }
    setPinnedChats(newPinned);
    localStorage.setItem('pinnedChats', JSON.stringify(Array.from(newPinned)));
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation? This cannot be undone.')) return;

    try {
      // Immediately remove from local state for instant UI update
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Remove from pinned chats if it was pinned
      const newPinned = new Set(pinnedChats);
      if (newPinned.has(conversationId)) {
        newPinned.delete(conversationId);
        setPinnedChats(newPinned);
        localStorage.setItem('pinnedChats', JSON.stringify(Array.from(newPinned)));
      }
      
      // Delete from server
      await deleteConversation(conversationId);
      
      // If we're viewing the deleted conversation, go home
      if (currentConversationId === conversationId) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
      // Refresh to restore state if deletion failed
      await loadConversations();
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedChats(new Set());
  };

  const toggleChatSelection = (chatId: string) => {
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedChats.size === 0) return;
    
    const count = selectedChats.size;
    if (!confirm(`Delete ${count} conversation${count > 1 ? 's' : ''}? This cannot be undone.`)) return;

    try {
      // Immediately remove from local state for instant UI update
      setConversations(prev => prev.filter(conv => !conv.id || !selectedChats.has(conv.id)));
      
      // Remove from pinned chats
      const newPinned = new Set(pinnedChats);
      selectedChats.forEach(id => newPinned.delete(id));
      setPinnedChats(newPinned);
      localStorage.setItem('pinnedChats', JSON.stringify(Array.from(newPinned)));
      
      // Delete all selected conversations from server
      await Promise.all(Array.from(selectedChats).map(id => deleteConversation(id)));
      
      // Exit select mode
      setSelectMode(false);
      setSelectedChats(new Set());
      
      // If we're viewing a deleted conversation, go home
      if (currentConversationId && selectedChats.has(currentConversationId)) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting conversations:', error);
      alert('Failed to delete some conversations. Please try again.');
      // Refresh to restore state if deletion failed
      await loadConversations();
    }
  };

  const selectAll = () => {
    setSelectedChats(new Set(filteredConversations.map(c => c.id).filter(Boolean) as string[]));
  };

  const deselectAll = () => {
    setSelectedChats(new Set());
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#0f0f0f] border-r border-white/10 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Kriyan AI
            </h1>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-white/60" />
            </button>
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={() => {
              setShowPersonaCreator(true);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all mb-2 text-white text-sm font-medium"
          >
            <Plus size={18} />
            Create Persona
          </button>
          
          <button
            onClick={() => {
              // If in chat with a persona, start new chat with same persona
              if (currentPersona) {
                window.location.href = `/chat?persona=${encodeURIComponent(currentPersona)}`;
              } else {
                // Otherwise show recent personas modal
                setShowNewChatModal(true);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl transition-all text-white/70 hover:text-white text-sm"
          >
            <Compass size={18} />
            New Chat
          </button>
        </div>

        {/* Feature Menu Items */}
        {/* Removed Feature Menu Items block as requested. */}

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 min-h-0">
          {pinnedChats.size > 0 && (
            <>
              <div className="flex items-center justify-between px-3 mb-2">
                <div className="text-xs font-medium text-yellow-400 flex items-center gap-1">
                  <Pin size={12} />
                  Pinned Chats
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between px-3 mb-2">
            <div className="text-xs font-medium text-white/40">
              {pinnedChats.size > 0 ? 'Other Chats' : 'Recent Chats'}
            </div>
            {user && conversations.length > 0 && (
              <button
                onClick={toggleSelectMode}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                {selectMode ? 'Cancel' : 'Select'}
              </button>
            )}
          </div>
          
          {selectMode && (
            <div className="px-3 mb-2 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Select All
                </button>
                {selectedChats.size > 0 && (
                  <button
                    onClick={deselectAll}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Deselect All
                  </button>
                )}
              </div>
              {selectedChats.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  Delete ({selectedChats.size})
                </button>
              )}
            </div>
          )}
          
          {loadingConversations ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : !user ? (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-white/40">Sign in to see your chats</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <MessageCircle size={24} className="text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/40">
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Pinned Conversations */}
              {filteredConversations.filter(c => c.id && pinnedChats.has(c.id)).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    if (!conv.id) return;
                    if (selectMode) {
                      toggleChatSelection(conv.id);
                    } else {
                      navigate(`/chat?persona=${encodeURIComponent(conv.personaName)}&conversation=${conv.id}`);
                    }
                  }}
                  data-chat-id={conv.id}
                  className={`relative rounded-lg transition-all mb-1 group ${
                    selectMode && conv.id && selectedChats.has(conv.id)
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'hover:bg-white/5'
                  } w-full text-left px-3 py-2.5`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {conv.personaName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-sm font-medium text-white line-clamp-1 group-hover:text-white/90">
                        {conv.title || conv.personaName}
                      </p>
                      <p className="text-xs text-white/40 line-clamp-1 mt-0.5">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        {formatTimestamp(conv.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => conv.id && togglePinChat(conv.id, e)}
                      className="p-2 hover:bg-yellow-500/20 rounded-lg transition-all"
                      title="Unpin"
                    >
                      <Pin size={14} className="text-yellow-400 fill-yellow-400" />
                    </button>
                    <button
                      onClick={(e) => conv.id && handleDeleteConversation(conv.id, e)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </button>
              ))}

              {/* Non-Pinned Conversations */}
              {filteredConversations.filter(c => !c.id || !pinnedChats.has(c.id)).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    if (!conv.id) return;
                    if (selectMode) {
                      toggleChatSelection(conv.id);
                    } else {
                      navigate(`/chat?persona=${encodeURIComponent(conv.personaName)}&conversation=${conv.id}`);
                    }
                  }}
                  data-chat-id={conv.id}
                  className={`relative rounded-lg transition-all mb-1 group ${
                    selectMode && conv.id && selectedChats.has(conv.id)
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'hover:bg-white/5'
                  } w-full text-left px-3 py-2.5`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {conv.personaName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-sm font-medium text-white line-clamp-1 group-hover:text-white/90">
                        {conv.title || conv.personaName}
                      </p>
                      <p className="text-xs text-white/40 line-clamp-1 mt-0.5">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        {formatTimestamp(conv.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => conv.id && togglePinChat(conv.id, e)}
                      className="p-2 hover:bg-yellow-500/20 rounded-lg transition-all"
                      title="Pin"
                    >
                      <Pin size={14} className="text-white/40" />
                    </button>
                    <button
                      onClick={(e) => conv.id && handleDeleteConversation(conv.id, e)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </button>
              ))}
          </>
          )}
        </div>

        {/* Upgrade Section */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all">
            <Crown size={18} className="text-purple-400" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">Upgrade</div>
              <div className="text-xs text-white/50">Get premium features</div>
            </div>
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white truncate">
                {user?.displayName || user?.email || 'Guest'}
              </div>
              <div className="text-xs text-white/50">View profile</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-white text-sm"
              >
                <User size={16} />
                Profile
              </button>
              <button
                onClick={() => {
                  setShowMemory(true);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-white text-sm"
              >
                <Brain size={16} />
                Memory
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-white text-sm"
              >
                <Settings size={16} />
                Settings
              </button>
              <div className="h-px bg-white/10" />
              <button
                onClick={async () => {
                  await logOut();
                  setShowUserMenu(false);
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-red-400 text-sm"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className="fixed inset-0 bg-[#0f0f0f] z-[100] p-4 overflow-y-auto lg:left-0 lg:w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Mic size={20} className="text-purple-400" />
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
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>None (Text only)</option>
                  <option>Read responses aloud</option>
                  <option>Auto-play responses</option>
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

        {/* Customize Settings Modal */}
        {showCustomize && (
          <div className="fixed inset-0 bg-[#0f0f0f] z-[100] p-4 overflow-y-auto lg:left-0 lg:w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Wand2 size={20} className="text-purple-400" />
                Customize Chat
              </h3>
              <button
                onClick={() => setShowCustomize(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-2">Font Size</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>Small</option>
                  <option>Medium (Default)</option>
                  <option>Large</option>
                  <option>Extra Large</option>
                </select>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-2">Message Density</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>Compact</option>
                  <option>Comfortable (Default)</option>
                  <option>Spacious</option>
                </select>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-2">Code Highlighting</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>Auto-detect</option>
                  <option>Always on</option>
                  <option>Off</option>
                </select>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Show Timestamps</label>
                  <button className="relative w-12 h-6 rounded-full bg-purple-500">
                    <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Markdown Preview</label>
                  <button className="relative w-12 h-6 rounded-full bg-purple-500">
                    <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Persona Quick Picker Modal */}
        {showPersonaPicker && (
          <div className="fixed inset-0 bg-[#0f0f0f] z-[100] p-4 overflow-y-auto lg:left-0 lg:w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users size={20} className="text-purple-400" />
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
                    onClose();
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
                onClose();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all text-purple-400 text-sm font-medium"
            >
              <Sparkles size={16} />
              View All Personas
            </button>
          </div>
        )}

        {/* Style/Theme Settings Modal */}
        {showStyleSettings && (
          <div className="fixed inset-0 bg-[#0f0f0f] z-[100] p-4 overflow-y-auto lg:left-0 lg:w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Palette size={20} className="text-purple-400" />
                Style & Theme
              </h3>
              <button
                onClick={() => setShowStyleSettings(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-black border-2 border-purple-500 rounded-lg text-white text-sm font-medium">
                    Dark
                  </button>
                  <button className="p-3 bg-white border border-white/20 rounded-lg text-black text-sm font-medium">
                    Light
                  </button>
                  <button className="p-3 bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-lg text-white text-sm font-medium">
                    System
                  </button>
                  <button className="p-3 bg-gradient-to-br from-blue-900 to-purple-900 border border-white/20 rounded-lg text-white text-sm font-medium">
                    Midnight
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-3">Accent Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {['#a855f7', '#ec4899', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b'].map((color) => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-2">Background Blur</label>
                <input type="range" min="0" max="20" step="1" defaultValue="10" className="w-full" />
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <label className="text-sm font-medium text-white block mb-2">Animation Speed</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option>Off</option>
                  <option>Slow</option>
                  <option>Normal (Default)</option>
                  <option>Fast</option>
                </select>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Reduce Motion</label>
                  <button className="relative w-12 h-6 rounded-full bg-white/20">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Modals */}
      {showPersonaCreator && <PersonaCreatorModal onClose={() => setShowPersonaCreator(false)} />}
      {showMemory && <MemoryModal onClose={() => setShowMemory(false)} />}
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewChatModal(false)}>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">Start New Chat</h3>
              <p className="text-sm text-white/50 mt-1">Select a persona to chat with</p>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {recentPersonas.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-white/40 uppercase font-medium px-2 mb-3">Recent Personas</p>
                  {recentPersonas.map((persona) => (
                    <button
                      key={persona}
                      onClick={() => {
                        setShowNewChatModal(false);
                        onClose();
                        window.location.href = `/chat?persona=${encodeURIComponent(persona)}`;
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {persona.charAt(0)}
                      </div>
                      <span className="text-white font-medium">{persona}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle size={40} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">No recent chats</p>
                  <p className="text-white/30 text-xs mt-1">Go to home to select a persona</p>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 px-6 py-4">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  onClose();
                  navigate('/');
                }}
                className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-all"
              >
                Browse All Personas
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

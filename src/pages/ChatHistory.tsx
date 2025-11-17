import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserConversations, deleteConversation, Conversation } from '../services/firebase';
import { ArrowLeft, MessageCircle, Trash2, Calendar, Sparkles } from 'lucide-react';
import EncryptionBadge from '../components/EncryptionBadge';

const ChatHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const data = await getUserConversations(user.uid);
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  const handleOpenConversation = (conversation: Conversation) => {
    navigate(`/chat?persona=${conversation.personaName}&conversation=${conversation.id}`);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-white" size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageCircle size={28} />
                Chat History
              </h1>
              <p className="text-sm text-gray-400">Your saved conversations</p>
            </div>
            <EncryptionBadge />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-white mb-2">No conversations yet</h2>
            <p className="text-gray-400 mb-6">Start chatting with personas to build your history</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Browse Personas
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenConversation(conversation)}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        {conversation.personaName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {conversation.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          with {conversation.personaName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-15 space-y-2">
                      {/* Preview of last message */}
                      {conversation.messages.length > 0 && (
                        <p className="text-gray-300 line-clamp-2">
                          {conversation.messages[conversation.messages.length - 1]?.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(conversation.updatedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          {conversation.messages.length} messages
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles size={14} />
                          {conversation.model}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => conversation.id && handleDeleteConversation(conversation.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    <Trash2 className="text-red-400" size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;

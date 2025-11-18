import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { saveConversation, getUserConversations } from '../services/firebase';
import { Globe, Calendar, Eye, Clock, ArrowLeft, MessageCircle } from 'lucide-react';

export const SharedChatView: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [chatData, setChatData] = useState<{
    messages: Array<{ role: string; content: string }>;
    personaName: string;
    title: string;
    createdAt: string;
    updatedAt?: string;
    expiresAt?: string;
    views: number;
  } | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    const fetchSharedChat = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getSharedChat(shareId);
        setChatData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared chat');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [shareId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatExpiry = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Expires soon';
  };

  const handleContinueChat = async () => {
    if (!chatData || !user || !shareId) return;

    try {
      // First check backend for existing mapping
      const backendCheck = await api.checkUserConversation(shareId, user.uid);
      if (backendCheck.exists && backendCheck.conversationId) {
        // User already imported this share - open their existing conversation
        navigate(`/chat?persona=${encodeURIComponent(chatData.personaName)}&conversation=${backendCheck.conversationId}`);
        return;
      }

      // Fallback: check Firebase directly (in case backend mapping was missed)
      const myConvos = await getUserConversations(user.uid);
      const existing = myConvos.find((c: any) => (c as any).shareId === shareId);
      if (existing) {
        // Register this mapping in backend for future
        await api.registerSharedConversation(shareId, user.uid, existing.id!);
        navigate(`/chat?persona=${encodeURIComponent(existing.personaName)}&conversation=${existing.id}`);
        return;
      }

      // Create a new conversation for this user with the shared messages
      const conversationData: any = {
        personaName: chatData.personaName,
        title: chatData.title || `Shared: ${chatData.personaName}`,
        lastMessage: chatData.messages[chatData.messages.length - 1]?.content.slice(0, 100) || '',
        messages: chatData.messages.map(m => ({ role: m.role, content: m.content, timestamp: new Date() })),
        model: 'command-r24',
        shareId: shareId
      };

      const newId = await saveConversation(user.uid, conversationData);
      
      // Register the mapping in backend
      await api.registerSharedConversation(shareId, user.uid, newId);
      
      navigate(`/chat?persona=${encodeURIComponent(chatData.personaName)}&conversation=${newId}`);
    } catch (err) {
      console.error('Failed to continue shared chat:', err);
      navigate(`/chat?persona=${encodeURIComponent(chatData.personaName)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error || !chatData) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6 text-center">
          <Globe className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {error === 'This shared chat has expired' ? 'Chat Expired' : 'Chat Not Found'}
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors mb-3 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white mb-1">{chatData.title}</h1>
              <p className="text-sm text-gray-400">with {chatData.personaName}</p>
            </div>
            <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <span className="text-xs text-blue-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Shared Chat
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created {formatDate(chatData.createdAt)}
            </span>
            {chatData.updatedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {formatDate(chatData.updatedAt)}
              </span>
            )}
            {chatData.expiresAt && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Clock className="w-3 h-3" />
                {formatExpiry(chatData.expiresAt)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {chatData.views} view{chatData.views !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {chatData.messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {chatData.personaName.charAt(0)}
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-[#1a1a1a] text-gray-100 rounded-tl-sm border border-[#2a2a2a]'
              }`}>
                <div className="whitespace-pre-wrap break-words">{message.content}</div>
              </div>
              {message.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  U
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#2a2a2a] text-center">
          <p className="text-sm text-gray-500 mb-4">
            {user 
              ? 'Want to continue this conversation? Start chatting with this persona.'
              : 'This is a shared conversation. To start your own chat, visit Kriyan.'
            }
          </p>
          <div className="flex gap-3 justify-center">
            {user ? (
              <button
                onClick={handleContinueChat}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Continue Chat with {chatData?.personaName}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/chat?persona=${chatData.personaName}&shared=${shareId}`)}`)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Sign In to Continue
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
                >
                  Explore Kriyan
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

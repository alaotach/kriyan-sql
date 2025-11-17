import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Settings,
  Bot,
  Image as ImageIcon,
  Mic,
  Edit2,
  RotateCw,
  Copy,
  Trash2,
  Save,
  GitBranch,
  Volume2,
} from 'lucide-react';
import { api, ModelInfo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  saveConversation,
  updateConversation,
  getUserConversations,
} from '../services/firebase';
import EncryptionBadge from '../components/EncryptionBadge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  editing?: boolean;
}

const Chat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const personaName = searchParams.get('persona') || 'Kriyan';
  const conversationId = searchParams.get('conversation');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personaSummary, setPersonaSummary] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    loadPersona();
    loadModels();
    if (conversationId && user) {
      loadConversation();
    }
  }, [personaName, conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Auto-save conversation every 30 seconds if user is logged in
    if (user && messages.length > 0) {
      const interval = setInterval(() => {
        saveCurrentConversation();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPersona = async () => {
    try {
      const data = await api.getPersona(personaName);
      setPersonaSummary(data.summary);
      
      if (messages.length === 0) {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Hey! I'm ${personaName}. ${data.summary} Let's chat!`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to load persona:', error);
      setPersonaSummary('A unique personality');
    }
  };

  const loadModels = async () => {
    try {
      const data = await api.getModels();
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadConversation = async () => {
    if (!conversationId || !user) return;
    
    try {
      const conversation = await getUserConversations(user.uid);
      const current = conversation.find(c => c.id === conversationId);
      if (current) {
        setMessages(current.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate() || new Date()
        })));
        setSelectedModel(current.model);
        setCurrentConversationId(current.id || null);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const saveCurrentConversation = async () => {
    if (!user || messages.length === 0) return;

    try {
      const conversationData: any = {
        personaName,
        title: messages[0]?.content.slice(0, 50) || 'New Chat',
        messages: messages.map(m => {
          const msg: any = {
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          };
          // Only include imageUrl if it exists
          if (m.imageUrl) {
            msg.imageUrl = m.imageUrl;
          }
          return msg;
        }),
        model: selectedModel,
      };

      if (currentConversationId) {
        await updateConversation(currentConversationId, user.uid, conversationData);
      } else {
        const newId = await saveConversation(user.uid, conversationData);
        setCurrentConversationId(newId);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || messageInput;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    // Capture history BEFORE state update (includes all previous messages)
    const history = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput('');
    setIsTyping(true);

    try {
      const data = await api.sendMessage({
        persona: personaName,
        message: textToSend,
        history, // Send all previous messages (user + assistant)
        model: selectedModel,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Auto-save after new message
      if (user) {
        setTimeout(saveCurrentConversation, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerateResponse = async (messageIndex: number) => {
    if (messageIndex === 0) return; // Can't regenerate first message
    
    const previousUserMessage = messages[messageIndex - 1];
    if (previousUserMessage.role !== 'user') return;

    // Remove the message to regenerate and all after it
    setMessages(prev => prev.slice(0, messageIndex));
    setIsTyping(true);

    try {
      const history = messages.slice(0, messageIndex - 1).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const data = await api.sendMessage({
        persona: personaName,
        message: previousUserMessage.content,
        history,
        model: selectedModel,
      });

      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to regenerate:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.role !== 'user') return;

    setEditingMessageId(messageId);
    setEditContent(message.content);
  };

  const handleSaveEdit = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editContent,
    };

    // Remove all messages after this one (for branching)
    setMessages(updatedMessages.slice(0, messageIndex + 1));
    setEditingMessageId(null);
    setEditContent('');

    // Regenerate response with edited message
    await handleSendMessage(editContent);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleTextToSpeech = (text: string) => {
    if (!synth) return;

    if (synth.speaking) {
      synth.cancel();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setGeneratingImage(true);
    try {
      const data = await api.generateImage({
        prompt: imagePrompt,
        model: 'flux'
      });

      const imageMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Generated image: ${imagePrompt}`,
        timestamp: new Date(),
        imageUrl: data.url
      };

      setMessages(prev => [...prev, imageMessage]);
      setImagePrompt('');
      setShowImageGen(false);
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="text-white" size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                  {personaName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{personaName}</h1>
                  <p className="text-sm text-gray-400">{personaSummary}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && <EncryptionBadge />}
              {user && (
                <button
                  onClick={saveCurrentConversation}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Save conversation"
                >
                  <Save className="text-white" size={20} />
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="text-white" size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-purple-900/50 backdrop-blur-md border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Bot size={20} />
              AI Model Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowSettings(false);
                  }}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedModel === model.id
                      ? 'bg-purple-600 border-2 border-purple-400'
                      : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{model.name}</span>
                    {model.uncensored && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                        🔥 Uncensored
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300">{model.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Generation Panel */}
      {showImageGen && (
        <div className="bg-purple-900/50 backdrop-blur-md border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <ImageIcon size={20} />
              Generate Image with AI
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage || !imagePrompt.trim()}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                {generatingImage ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => setShowImageGen(false)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 group ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {personaName.charAt(0)}
                </div>
              )}
              <div className="flex-1 max-w-[70%]">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                  }`}
                >
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white/10 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(message.id)}
                          className="px-3 py-1 bg-green-600 rounded text-sm"
                        >
                          Save & Regenerate
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-600 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Generated"
                          className="mt-3 rounded-lg max-w-full"
                        />
                      )}
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Message Actions */}
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {message.role === 'user' && (
                    <button
                      onClick={() => handleEditMessage(message.id)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Edit message"
                    >
                      <Edit2 className="text-gray-400" size={16} />
                    </button>
                  )}
                  {message.role === 'assistant' && index > 0 && (
                    <button
                      onClick={() => handleRegenerateResponse(index)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Regenerate response"
                    >
                      <RotateCw className="text-gray-400" size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Copy message"
                  >
                    <Copy className="text-gray-400" size={16} />
                  </button>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleTextToSpeech(message.content)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Text to speech"
                    >
                      <Volume2 className="text-gray-400" size={16} />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1 hover:bg-white/10 rounded"
                      title="Delete message"
                    >
                      <Trash2 className="text-gray-400" size={16} />
                    </button>
                  )}
                  {message.role === 'user' && (
                    <button
                      className="p-1 hover:bg-white/10 rounded"
                      title="Create branch"
                    >
                      <GitBranch className="text-gray-400" size={16} />
                    </button>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                {personaName.charAt(0)}
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-black/30 backdrop-blur-md border-t border-white/10 sticky bottom-0">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-2 px-4">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${personaName}...`}
                className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none py-3 outline-none max-h-32"
                rows={1}
              />
              <button
                onClick={() => setShowImageGen(!showImageGen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Generate image"
              >
                <ImageIcon className="text-gray-400" size={20} />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Voice input">
                <Mic className="text-gray-400" size={20} />
              </button>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!messageInput.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl px-6 py-3 font-medium transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              Send
            </button>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            Using {models.find(m => m.id === selectedModel)?.name || selectedModel} • 100% Uncensored
            {!user && <span className="ml-2">• <button onClick={() => navigate('/login')} className="text-purple-400 hover:underline">Sign in</button> to save chats</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Bot,
} from 'lucide-react';
import { api, ModelInfo } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const personaName = searchParams.get('persona') || 'Kriyan';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personaSummary, setPersonaSummary] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-70b');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPersona();
    loadModels();
  }, [personaName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPersona = async () => {
    try {
      const data = await api.getPersona(personaName);
      setPersonaSummary(data.summary);
      
      // Add welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hey! I'm ${personaName}. ${data.summary} Let's chat!`,
        timestamp: new Date()
      }]);
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

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = messageInput;
    setMessageInput('');
    setIsTyping(true);

    try {
      // Prepare conversation history
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const data = await api.sendMessage({
        persona: personaName,
        message: userText,
        history,
        model: selectedModel,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
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
            <div className="flex items-center gap-2">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {personaName.charAt(0)}
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  U
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
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ImageIcon className="text-gray-400" size={20} />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl px-6 py-3 font-medium transition-colors flex items-center gap-2"
            >
              <Send size={20} />
              Send
            </button>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            Using {models.find(m => m.id === selectedModel)?.name || selectedModel} • 100% Uncensored
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Settings,
  Image as ImageIcon,
  Mic,
  Edit2,
  RotateCw,
  Copy,
  Trash2,
  Save,
  Volume2,
  Menu,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Globe,
  GitBranch,
} from 'lucide-react';
import { api, ModelInfo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { PersonaInfoSidebar } from '../components/PersonaInfoSidebar';
import { TypingIndicator } from '../components/TypingIndicator';
import { ShareChatModal } from '../components/ShareChatModal';
import {
  saveConversation,
  updateConversation,
  getUserConversations,
} from '../services/firebase';

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
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPersonaInfo, setShowPersonaInfo] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  const [processedSharedId, setProcessedSharedId] = useState<string | null>(null);
  const [existingShareId, setExistingShareId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (conversationId && user) {
      loadConversation();
    } else {
      // Clear messages when starting a new chat (no conversation ID)
      setMessages([]);
      setCurrentConversationId(null);
      setConversationTitle('');
      setExistingShareId('');
      loadPersona();
    }
  }, [personaName, conversationId, user]);

  // If redirected with a shared link after login, import or open the shared conversation
  useEffect(() => {
    const sharedId = searchParams.get('shared');
    if (!sharedId || !user) return;
    if (processedSharedId === sharedId) return;
    setProcessedSharedId(sharedId);

    (async () => {
      try {
        // First check backend for existing mapping (server-side deduplication)
        const backendCheck = await api.checkUserConversation(sharedId, user.uid);
        if (backendCheck.exists && backendCheck.conversationId) {
          // User already imported this share - navigate to their existing conversation
          navigate(`/chat?persona=${encodeURIComponent(personaName)}&conversation=${backendCheck.conversationId}`);
          return;
        }

        // Fallback: check Firebase directly (in case backend mapping was missed)
        const myConvos = await getUserConversations(user.uid);
        const existing = (myConvos as any).find((c: any) => (c as any).shareId === sharedId);
        if (existing) {
          // Register this mapping in backend for future
          await api.registerSharedConversation(sharedId, user.uid, existing.id!);
          // Navigate to existing conversation instead of loading in place
          navigate(`/chat?persona=${encodeURIComponent(existing.personaName)}&conversation=${existing.id}`);
          return;
        }

        // Otherwise fetch shared chat and create a new conversation
        const sharedData = await api.getSharedChat(sharedId);
        const conversationData: any = {
          personaName: sharedData.personaName,
          title: sharedData.title,
          lastMessage: sharedData.messages[sharedData.messages.length - 1]?.content.slice(0, 100) || '',
          messages: sharedData.messages.map((m: any) => ({ role: m.role, content: m.content, timestamp: new Date() })),
          model: 'command-r24',
          shareId: sharedId
        };

        const newId = await saveConversation(user.uid, conversationData);
        
        // Register the mapping in backend (server-side deduplication)
        await api.registerSharedConversation(sharedId, user.uid, newId);
        
        // Navigate to the new conversation (this will trigger loadConversation)
        navigate(`/chat?persona=${encodeURIComponent(sharedData.personaName)}&conversation=${newId}`);
      } catch (err) {
        console.error('Failed to import shared conversation:', err);
      }
    })();
  }, [user, searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Auto-save conversation every 30 seconds if user is logged in
    if (user) {
      const interval = setInterval(() => {
        if (messages.length > 0) {
          saveCurrentConversation();
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]); // Only depend on user, not messages

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPersona = async () => {
    try {
      const data = await api.getPersona(personaName);
      setPersonaSummary(data.summary);
      
      // Always add greeting when loading persona (persona loads only when starting fresh chat)
      const greetingMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hey! I'm ${personaName}. ${data.summary} Let's chat!`,
        timestamp: new Date()
      };
      setMessages([greetingMessage]);
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
        setConversationTitle(current.title || '');
        setExistingShareId((current as any).shareId || '');
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const saveCurrentConversation = async (messagesToSave?: Message[]) => {
    if (!user) return;
    if (isSaving) return; // Prevent concurrent saves
    
    const msgsToSave = messagesToSave || messages;
    if (msgsToSave.length === 0) return;

    // Only save if there's at least one user message AND one assistant response (after the user message)
    const userMessages = msgsToSave.filter(m => m.role === 'user');
    const assistantResponses = msgsToSave.filter(m => m.role === 'assistant');
    
    // Need at least one user message and at least one assistant response that's not just a greeting
    if (userMessages.length === 0) return;
    
    // Check if we have a real conversation (not just greeting)
    // A real conversation has: user message + assistant response (at least 2 messages total with 1 user)
    if (msgsToSave.length < 2 || assistantResponses.length === 0) return;

    setIsSaving(true);
    try {
      // Generate AI title ONLY for NEW conversations (when there's no conversation ID yet)
      // For existing conversations, reuse the existing title to avoid API spam
      let title = conversationTitle || 'New Chat';
      
      // Only generate a new title if this is a new conversation (no ID yet)
      if (!currentConversationId && userMessages.length > 0) {
        try {
          // Filter out the initial bot greeting - only include messages after first user message
          const firstUserIndex = msgsToSave.findIndex(m => m.role === 'user');
          const relevantMessages = firstUserIndex >= 0 ? msgsToSave.slice(firstUserIndex) : msgsToSave;
          
          // Use AI to generate a meaningful title from the user's conversation
          title = await api.generateTitle(relevantMessages.map(m => ({ role: m.role, content: m.content })));
          
          // Store title in state for sharing
          setConversationTitle(title);
        } catch (error) {
          console.error('Failed to generate title:', error);
          // Fallback: Create a short summary from first user message
          const firstUserMessage = userMessages[0]?.content || 'New Chat';
          const words = firstUserMessage.trim().split(' ');
          title = words.length <= 6 ? firstUserMessage.slice(0, 50) : words.slice(0, 6).join(' ') + '...';
          setConversationTitle(title);
        }
      }
      
      const conversationData: any = {
        personaName,
        title,
        lastMessage: msgsToSave[msgsToSave.length - 1]?.content.slice(0, 100) || '',
        messages: msgsToSave.map(m => {
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

      // Include shareId if it exists
      if (existingShareId) {
        conversationData.shareId = existingShareId;
      }

      if (currentConversationId) {
        await updateConversation(currentConversationId, user.uid, conversationData);
      } else {
        const newId = await saveConversation(user.uid, conversationData);
        setCurrentConversationId(newId);
        // Update URL so sidebar picks up the new conversation immediately
        window.history.replaceState({}, '', `/chat?persona=${encodeURIComponent(personaName)}&conversation=${newId}`);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    } finally {
      setIsSaving(false);
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

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      // Auto-save immediately after bot responds (now we have both user and assistant messages)
      if (user) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveCurrentConversation(updatedMessages), 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      const updatedMessages = [...messages, userMessage, errorMessage];
      setMessages(updatedMessages);
      
      // Save even when there's an error so the conversation isn't lost
      if (user) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveCurrentConversation(updatedMessages), 1000);
      }
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

      const updatedMessages = [...messages.slice(0, messageIndex), newMessage];
      setMessages(updatedMessages);
      
      // Auto-save after regeneration
      if (user) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => saveCurrentConversation(updatedMessages), 1000);
      }
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
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="border-b border-white/5 bg-[#0f0f0f] sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-all text-white/50 hover:text-white/70"
              >
                <Menu size={20} />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                {personaName.charAt(0)}
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">{personaName}</h1>
                <p className="text-xs text-white/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={() => saveCurrentConversation()}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/50 hover:text-white/70"
                  title="Save"
                >
                  <Save size={18} />
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/50 hover:text-white/70"
                  title="Share"
                >
                  <Share2 size={18} />
                </button>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/50 hover:text-white/70"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => setShowPersonaInfo(!showPersonaInfo)}
                className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/50 hover:text-white/70"
                title="Info"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-purple-900/50 backdrop-blur-md border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Globe size={20} />
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
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={`${message.id}-${index}`}
              className={`flex gap-3 group ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {message.role === 'assistant' ? (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                  {personaName.charAt(0)}
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                  )}
                </div>
              )}
              <div className="flex-1 max-w-[85%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    message.role === 'user'
                      ? 'bg-[#2a2a2a] text-white'
                      : 'bg-[#1f1f1f] text-white/90'
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
                      <div className="whitespace-pre-wrap">
                        {(() => {
                          const text = message.content;
                          const parts: React.ReactNode[] = [];
                          let i = 0;
                          let key = 0;
                          let currentText = '';

                          while (i < text.length) {
                            // Check for <em> (actions/narration from AI)
                            if (text.substring(i, i + 4) === '<em>') {
                              if (currentText) {
                                parts.push(currentText);
                                currentText = '';
                              }
                              const closeIndex = text.indexOf('</em>', i + 4);
                              if (closeIndex !== -1) {
                                parts.push(
                                  <em key={`e-${key++}`} className="italic text-purple-400">
                                    {text.substring(i + 4, closeIndex)}
                                  </em>
                                );
                                i = closeIndex + 5;
                                continue;
                              }
                            }
                            // Remove <strong> tags but keep the text
                            else if (text.substring(i, i + 8) === '<strong>') {
                              const closeIndex = text.indexOf('</strong>', i + 8);
                              if (closeIndex !== -1) {
                                currentText += text.substring(i + 8, closeIndex);
                                i = closeIndex + 9;
                                continue;
                              }
                            }
                            // Parse **bold** from user messages
                            else if (text.substring(i, i + 2) === '**' && message.role === 'user') {
                              if (currentText) {
                                parts.push(currentText);
                                currentText = '';
                              }
                              const closeIndex = text.indexOf('**', i + 2);
                              if (closeIndex !== -1 && closeIndex > i + 2) {
                                parts.push(
                                  <strong key={`b-${key++}`} className="font-bold">
                                    {text.substring(i + 2, closeIndex)}
                                  </strong>
                                );
                                i = closeIndex + 2;
                                continue;
                              }
                            }
                            // Parse *italic* from user messages
                            else if (text[i] === '*' && text[i + 1] !== '*' && message.role === 'user') {
                              if (currentText) {
                                parts.push(currentText);
                                currentText = '';
                              }
                              const closeIndex = text.indexOf('*', i + 1);
                              if (closeIndex !== -1 && closeIndex > i + 1 && text[closeIndex + 1] !== '*') {
                                parts.push(
                                  <em key={`i-${key++}`} className="italic text-purple-400">
                                    {text.substring(i + 1, closeIndex)}
                                  </em>
                                );
                                i = closeIndex + 1;
                                continue;
                              }
                            }
                            currentText += text[i];
                            i++;
                          }
                          if (currentText) parts.push(currentText);
                          return parts;
                        })()}
                      </div>
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
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {message.role === 'assistant' && index > 0 && (
                    <button
                      onClick={() => handleRegenerateResponse(index)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                      title="Regenerate response"
                    >
                      <RotateCw className="text-white/40" size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                    title="Copy message"
                  >
                    <Copy className="text-white/40" size={16} />
                  </button>
                  {message.role === 'assistant' && (
                    <>
                      <button
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                        title="Like"
                      >
                        <ThumbsUp className="text-white/40" size={16} />
                      </button>
                      <button
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                        title="Dislike"
                      >
                        <ThumbsDown className="text-white/40" size={16} />
                      </button>
                      <button
                        onClick={() => handleTextToSpeech(message.content)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                        title="Text to speech"
                      >
                        <Volume2 className="text-white/40" size={16} />
                      </button>
                    </>
                  )}
                  {message.role === 'user' && (
                    <button
                      onClick={() => handleEditMessage(message.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                      title="Edit message"
                    >
                      <Edit2 className="text-white/40" size={16} />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                      title="Delete message"
                    >
                      <Trash2 className="text-white/40" size={16} />
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
            <TypingIndicator personaName={personaName} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 bg-[#0f0f0f] sticky bottom-0">
        <div className="px-4 py-4 max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-2xl flex items-center gap-2 px-4 py-2 focus-within:border-white/20 transition-all">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${personaName}...`}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/40 resize-none py-2 outline-none max-h-32"
                rows={1}
              />
              <button
                onClick={() => setShowImageGen(!showImageGen)}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white/60"
                title="Generate image"
              >
                <ImageIcon size={18} />
              </button>
              <button className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white/60" title="Voice input">
                <Mic size={18} />
              </button>
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!messageInput.trim() || isTyping}
              className="bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed text-white disabled:text-white/30 rounded-xl p-2.5 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 text-center text-xs text-white/20">
            {!user && <span>• <button onClick={() => navigate('/login')} className="text-white/40 hover:text-white/60 transition-colors">Sign in</button> to save chats</span>}
          </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Persona Info */}
      {showPersonaInfo && (
        <PersonaInfoSidebar
          personaName={personaName}
          personaSummary={personaSummary || 'A unique AI personality ready to chat with you.'}
          onNewChat={() => {
            setMessages([]);
            setCurrentConversationId(null);
            setConversationTitle('');
            // Clear the conversation query param and stay on the same persona
            window.history.replaceState({}, '', `/chat?persona=${personaName}`);
            // Trigger persona reload to get greeting
            loadPersona();
          }}
        />
      )}

      {/* Share Chat Modal */}
      <ShareChatModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        messages={messages.map(m => ({ role: m.role, content: m.content }))}
        personaName={personaName}
        title={conversationTitle || messages.find(m => m.role === 'user')?.content.slice(0, 50) || 'Chat with ' + personaName}
        existingShareId={existingShareId}
        onShareCreated={(shareId) => {
          setExistingShareId(shareId);
          // Save the shareId to the conversation
          if (user && currentConversationId) {
            saveCurrentConversation();
          }
        }}
      />
    </div>
  );
};

export default Chat;
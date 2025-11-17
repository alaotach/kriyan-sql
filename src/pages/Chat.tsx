import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Menu,
  X,
  MoreVertical,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Persona, Message, Conversation } from '../types';
import { ConversationItem } from '../components/ConversationItem';
import { ChatMessage } from '../components/ChatMessage';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

const mockConversations: Conversation[] = [
  {
    id: '1',
    personaId: '1',
    personaName: 'Luna',
    personaAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: "That's such a thoughtful perspective!",
    timestamp: new Date(Date.now() - 300000),
    isPinned: true,
  },
  {
    id: '2',
    personaId: '2',
    personaName: 'Kai',
    personaAvatar: 'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Ready for the next adventure?',
    timestamp: new Date(Date.now() - 3600000),
    unreadCount: 2,
  },
  {
    id: '3',
    personaId: '3',
    personaName: 'Nova',
    personaAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    lastMessage: 'Let me explain how that algorithm works...',
    timestamp: new Date(Date.now() - 7200000),
  },
];

interface ChatProps {
  selectedPersona: Persona;
  onBack: () => void;
}

export function Chat({ selectedPersona, onBack }: ChatProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hey there! I'm ${selectedPersona.name}. ${selectedPersona.description} How can I help you today?`,
      isUser: false,
      timestamp: new Date(Date.now() - 60000),
      personaAvatar: selectedPersona.avatar,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState('1');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "That's a great question! Let me think about that...",
        "I love talking about this topic! Here's my perspective...",
        "Interesting point! Have you considered...",
        "I appreciate you sharing that with me.",
        "That makes a lot of sense. Tell me more about your thoughts on this.",
      ];
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
        personaAvatar: selectedPersona.avatar,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = ['Continue', 'Explain more', 'Tell me a story', 'Change topic'];

  return (
    <div className="h-screen flex bg-neutral-50 dark:bg-neutral-900">
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900 dark:text-white">Conversations</h2>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => setActiveConversationId(conversation.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <button onClick={onBack} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors lg:hidden">
              <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <Avatar
              src={selectedPersona.avatar}
              alt={selectedPersona.name}
              size="md"
              online={selectedPersona.isOnline}
            />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {selectedPersona.name}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {selectedPersona.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onRegenerate={() => console.log('Regenerate')}
              onDelete={() => console.log('Delete')}
              onRate={(positive) => console.log('Rate:', positive)}
            />
          ))}
          {isTyping && (
            <ChatMessage
              message={{
                id: 'typing',
                content: '',
                isUser: false,
                timestamp: new Date(),
                isTyping: true,
                personaAvatar: selectedPersona.avatar,
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Chip
                key={action}
                size="sm"
                onClick={() => setMessageInput(action)}
                className="flex-shrink-0"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {action}
              </Chip>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" className="mb-1">
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 rounded-2xl text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>
            <Button variant="ghost" size="sm" className="mb-1">
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              size="sm"
              className="mb-1"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

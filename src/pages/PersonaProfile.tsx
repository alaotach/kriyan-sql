import { useState } from 'react';
import { ArrowLeft, MessageCircle, Share2, Copy, Star } from 'lucide-react';
import { Persona } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Card } from '../components/ui/Card';

interface PersonaProfileProps {
  persona: Persona;
  onBack: () => void;
  onStartChat: () => void;
}

export function PersonaProfile({ persona, onBack, onStartChat }: PersonaProfileProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'examples'>('about');

  const exampleDialogues = [
    { id: '1', userMessage: 'Hey! How are you today?', personaResponse: 'I\'m doing great! I\'ve been thinking about our last conversation. How about you?' },
    { id: '2', userMessage: 'Tell me about your interests', personaResponse: 'I love exploring new ideas and having deep conversations. What are you passionate about?' },
    { id: '3', userMessage: 'What makes you unique?', personaResponse: 'I believe every connection is unique. I adapt to understand you better and create meaningful exchanges.' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="relative h-48 bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-12">
        <Card className="p-8 mb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar src={persona.avatar} alt={persona.name} size="2xl" online={persona.isOnline} />
            <div className="mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {persona.name}
                </h1>
                {persona.isVerified && (
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-4">
                {persona.subtitle}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
                {persona.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button size="lg" onClick={onStartChat}>
                  <MessageCircle className="w-5 h-5" />
                  Start Chat
                </Button>
                <Button variant="secondary">
                  <Share2 className="w-5 h-5" />
                  Share
                </Button>
                <Button variant="secondary">
                  <Copy className="w-5 h-5" />
                  Clone
                </Button>
              </div>
            </div>
          </div>

          <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 px-2 font-medium transition-colors relative ${
                  activeTab === 'about'
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                About
                {activeTab === 'about' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`pb-3 px-2 font-medium transition-colors relative ${
                  activeTab === 'examples'
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                Example Chats
                {activeTab === 'examples' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400"></span>
                )}
              </button>
            </div>
          </div>

          {activeTab === 'about' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {persona.longDescription || persona.description}
                </p>
              </div>
              {persona.traits && persona.traits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                    Personality Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.traits.map((trait) => (
                      <Chip key={trait} variant="primary">
                        {trait}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                  Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                      {persona.messageCount?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Chats</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {persona.isOnline ? 'Online' : 'Offline'}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Status</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-4 animate-fadeIn">
              {exampleDialogues.map((dialogue) => (
                <Card key={dialogue.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-sky-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                        <p className="text-sm">{dialogue.userMessage}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%]">
                        <p className="text-sm">{dialogue.personaResponse}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

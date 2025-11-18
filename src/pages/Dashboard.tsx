import { useState } from 'react';
import { Settings, MessageCircle, Heart, User, Menu, Search, TrendingUp, Sparkles, Crown } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { PersonaCard } from '../components/PersonaCard';
import { useTheme } from '../context/ThemeContext';
import { Persona } from '../types';

interface DashboardProps {
  onBack: () => void;
  onPersonaSelect?: (persona: Persona) => void;
}

const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
};

const savedPersonas: Persona[] = [
  {
    id: '1',
    name: 'Luna',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Your thoughtful companion',
    description: 'A caring AI friend',
    longDescription: '',
    tags: ['Supportive', 'Thoughtful'],
    category: 'Friends',
    messageCount: 125400,
  },
  {
    id: '3',
    name: 'Nova',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Tech enthusiast',
    description: 'A brilliant mind passionate about technology',
    longDescription: '',
    tags: ['Smart', 'Techy'],
    category: 'Tech',
    messageCount: 234500,
  },
];

const createdPersonas: Persona[] = [
  {
    id: '10',
    name: 'Phoenix',
    avatar: 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Wise mentor',
    description: 'A wise guide with stories from across the ages',
    longDescription: '',
    tags: ['Wise', 'Mentor', 'Guide'],
    category: 'Fantasy',
    createdBy: mockUser.id,
    messageCount: 1240,
  },
];

export function Dashboard({ onBack }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Trending', 'New', 'Featured', 'Popular', 'Anime', 'Games', 'Helpers'];

  const trendingPersonas = [
    { id: '1', name: 'Luna', emoji: '🌙', description: 'Thoughtful companion who listens', category: 'Friends', creator: 'alex' },
    { id: '2', name: 'Nova', emoji: '⚡', description: 'Tech-savvy AI assistant', category: 'Helpers', creator: 'tech_pro' },
    { id: '3', name: 'Phoenix', emoji: '🔥', description: 'Wise mentor from ancient times', category: 'Fantasy', creator: 'storyteller' },
    { id: '4', name: 'Zara', emoji: '🎮', description: 'Your gaming buddy', category: 'Games', creator: 'gamer123' },
  ];

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
            <h1 className="text-lg font-semibold text-white">Discover</h1>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for personas..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-4 py-3 border-b border-white/5 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-white/10 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/[0.07]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Trending Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-white/70" size={20} />
                <h2 className="text-xl font-semibold text-white">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {trendingPersonas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    name={persona.name}
                    emoji={persona.emoji}
                    description={persona.description}
                    category={persona.category}
                    creator={persona.creator}
                  />
                ))}
              </div>
            </section>

            {/* Featured Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-white/70" size={20} />
                <h2 className="text-xl font-semibold text-white">Featured</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {trendingPersonas.slice().reverse().map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    name={persona.name}
                    emoji={persona.emoji}
                    description={persona.description}
                    category={persona.category}
                    creator={persona.creator}
                  />
                ))}
              </div>
            </section>

            {/* Premium Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="text-white/70" size={20} />
                <h2 className="text-xl font-semibold text-white">Premium Personas</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {trendingPersonas.map((persona) => (
                  <PersonaCard
                    key={persona.id}
                    name={persona.name}
                    emoji={persona.emoji}
                    description={persona.description}
                    category={persona.category}
                    creator={persona.creator}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

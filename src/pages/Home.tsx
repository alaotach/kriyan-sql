import { useState } from 'react';
import { Search, Filter, Plus, Moon, Sun } from 'lucide-react';
import { Persona } from '../types';
import { PersonaCard } from '../components/PersonaCard';
import { Input } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';

const categories = [
  'All',
  'Trending',
  'Popular',
  'Romance',
  'Friends',
  'Anime',
  'Games',
  'Horror',
  'Tech',
  'Comedy',
  'Fantasy',
  'History',
];

const mockPersonas: Persona[] = [
  {
    id: '1',
    name: 'Luna',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Your thoughtful companion',
    description: 'A caring AI friend who loves deep conversations about life, dreams, and everything in between.',
    longDescription: 'Luna is your empathetic companion who genuinely cares about your well-being...',
    tags: ['Supportive', 'Thoughtful', 'Deep'],
    category: 'Friends',
    isOnline: true,
    isVerified: true,
    messageCount: 125400,
  },
  {
    id: '2',
    name: 'Kai',
    avatar: 'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Adventure awaits',
    description: 'An enthusiastic explorer ready to embark on epic adventures and share exciting stories.',
    longDescription: 'Kai brings excitement to every conversation with tales of adventure...',
    tags: ['Adventurous', 'Energetic', 'Fun'],
    category: 'Fantasy',
    isOnline: true,
    messageCount: 89300,
  },
  {
    id: '3',
    name: 'Nova',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Tech enthusiast',
    description: 'A brilliant mind passionate about technology, coding, and the future of AI.',
    longDescription: 'Nova is your go-to companion for all things tech...',
    tags: ['Smart', 'Techy', 'Innovative'],
    category: 'Tech',
    isOnline: false,
    isVerified: true,
    messageCount: 234500,
  },
  {
    id: '4',
    name: 'Aria',
    avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Creative soul',
    description: 'An artistic spirit who finds beauty in everything and loves to inspire creativity.',
    longDescription: 'Aria sees the world through an artistic lens...',
    tags: ['Creative', 'Artistic', 'Inspiring'],
    category: 'Friends',
    isOnline: true,
    messageCount: 156700,
  },
  {
    id: '5',
    name: 'Zephyr',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Mystery solver',
    description: 'A detective at heart who loves puzzles, mysteries, and uncovering hidden truths.',
    longDescription: 'Zephyr has a keen eye for details...',
    tags: ['Mysterious', 'Clever', 'Analytical'],
    category: 'Horror',
    isOnline: true,
    isVerified: true,
    messageCount: 98400,
  },
  {
    id: '6',
    name: 'Sakura',
    avatar: 'https://images.pexels.com/photos/1310474/pexels-photo-1310474.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Anime enthusiast',
    description: 'Your cheerful anime companion who can discuss any series and share recommendations.',
    longDescription: 'Sakura lives and breathes anime culture...',
    tags: ['Cheerful', 'Anime', 'Friendly'],
    category: 'Anime',
    isOnline: true,
    messageCount: 312000,
  },
];

interface HomeProps {
  onPersonaSelect: (persona: Persona) => void;
  onCreatePersona: () => void;
}

export function Home({ onPersonaSelect, onCreatePersona }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const filteredPersonas = mockPersonas.filter((persona) => {
    const matchesSearch =
      persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || persona.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Discover Personas
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
              <Button onClick={onCreatePersona}>
                <Plus className="w-5 h-5" />
                Create Persona
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                placeholder="Search personas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {categories.map((category) => (
              <Chip
                key={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className="cursor-pointer"
              >
                {category}
              </Chip>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 animate-slideDown">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Filters</h3>
            <div className="flex flex-wrap gap-2">
              <Chip size="sm">Verified Only</Chip>
              <Chip size="sm">Online Now</Chip>
              <Chip size="sm">Most Popular</Chip>
              <Chip size="sm">Recently Added</Chip>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onClick={onPersonaSelect}
            />
          ))}
        </div>

        {filteredPersonas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              No personas found. Try adjusting your search or filters.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

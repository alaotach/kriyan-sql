import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Star, Users, Flame, LogIn, User, LogOut, History, Key } from 'lucide-react';
import PersonaCard from '../components/PersonaCard';
import { useAuth } from '../context/AuthContext';
import EncryptionKeyPrompt from '../components/EncryptionKeyPrompt';
import KeyManagement from '../components/KeyManagement';

interface Persona {
  name: string;
  summary: string;
  category: string;
}

const categories = ['All', 'Anime', 'Celebrity', 'NSFW', 'Dark', 'Professional', 'Assistant', 'General'];

const Home = () => {
  const navigate = useNavigate();
  const { user, logOut } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showKeyManagement, setShowKeyManagement] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, []);

  useEffect(() => {
    filterPersonas();
  }, [searchQuery, selectedCategory, personas]);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://localhost:8000/personas');
      if (!response.ok) throw new Error('Failed to fetch personas');
      const data = await response.json();
      setPersonas(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load personas. Make sure the backend server is running.');
      setLoading(false);
    }
  };

  const filterPersonas = () => {
    let filtered = personas;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.summary.toLowerCase().includes(query)
      );
    }

    setFilteredPersonas(filtered);
  };

  const handlePersonaClick = (personaName: string) => {
    navigate(`/chat?persona=${personaName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-xl">Loading personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchPersonas}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header with User Menu */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Kriyan AI
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-white font-medium">{user.displayName || user.email}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-white/10 py-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/history');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <History size={16} />
                      Chat History
                    </button>
                    <button
                      onClick={() => {
                        setShowKeyManagement(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <Key size={16} />
                      Encryption Keys
                    </button>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={async () => {
                        await logOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <LogIn size={20} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
                Kriyan AI
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              100% Uncensored • No Filters • Ultimate Freedom
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>{personas.length}+ Personas</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={16} />
                <span>Unlimited Chat</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>AI Powered</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search personas by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 backdrop-blur-md text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="container mx-auto px-4 pb-16">
        {filteredPersonas.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No personas found</h3>
            <p className="text-gray-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedCategory === 'All' ? 'All Personas' : `${selectedCategory} Personas`}
              </h2>
              <span className="text-gray-400">{filteredPersonas.length} results</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPersonas.map((persona) => (
                <PersonaCard
                  key={persona.name}
                  name={persona.name}
                  summary={persona.summary}
                  category={persona.category}
                  onClick={() => handlePersonaClick(persona.name)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trending Section */}
      {selectedCategory === 'All' && (
        <div className="container mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-purple-400" size={24} />
              <h2 className="text-2xl font-bold text-white">Trending Now</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {personas.slice(0, 4).map((persona) => (
                <button
                  key={persona.name}
                  onClick={() => handlePersonaClick(persona.name)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="text-yellow-400 group-hover:scale-110 transition-transform" size={16} />
                    <span className="text-white font-medium">{persona.name}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{persona.summary}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Encryption Key Prompt for New Devices */}
      {user && <EncryptionKeyPrompt userId={user.uid} />}

      {/* Key Management Modal */}
      {showKeyManagement && user && (
        <KeyManagement userId={user.uid} onClose={() => setShowKeyManagement(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 Kriyan AI. Uncensored AI Chat Platform.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Server Online
              </span>
              <span>v2.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, TrendingUp, Sparkles, Crown, Star } from 'lucide-react';
import PersonaCard from '../components/PersonaCard';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import EncryptionKeyPrompt from '../components/EncryptionKeyPrompt';
import KeyManagement from '../components/KeyManagement';
import { PersonaCreatorModal } from '../components/PersonaCreatorModal';

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
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPersonaCreator, setShowPersonaCreator] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, []);

  useEffect(() => {
    filterPersonas();
  }, [searchQuery, selectedCategory, personas]);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('https://alaotach.hackclub.app/personas');
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
    navigate(`/chat?persona=${encodeURIComponent(personaName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/20 border-b-pink-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-white/90 text-lg font-medium">Loading personas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center max-w-md mx-auto p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Connection Error</h2>
          <p className="text-white/60 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchPersonas}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm font-medium"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {user && <EncryptionKeyPrompt userId={user.uid} />}
      {showKeyManagement && user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative">
            <KeyManagement userId={user.uid} onClose={() => setShowKeyManagement(false)} />
          </div>
        </div>
      )}
      
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10 bg-[#0f0f0f]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Menu size={20} className="text-white/70" />
              </button>
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-purple-400" />
                <h1 className="text-xl font-bold text-white">Kriyan AI</h1>
              </div>
            </div>
            {/* Search Bar */}
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Category Filters */}
          <div className="border-b border-white/10 sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur-xl">
            <div className="px-6 py-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personas Grid */}
          <div className="px-6 py-6 max-w-7xl mx-auto space-y-8">
            {filteredPersonas.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4 opacity-30">🔍</div>
                <h3 className="text-lg font-semibold text-white/70 mb-2">No personas found</h3>
                <p className="text-white/40 text-sm">Try adjusting your search or filter</p>
              </div>
            ) : (
              <>
                {/* Trending Section - Only show on All category with horizontal scroll */}
                {selectedCategory === 'All' && personas.length > 0 && (
                  <section className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-purple-400" size={20} />
                      <h2 className="text-xl font-semibold text-white">Trending Now</h2>
                    </div>
                    <div className="relative">
                      {/* Left scroll indicator */}
                      <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-[#0f0f0f] via-[#0a0a0a]/95 to-transparent pointer-events-none flex items-center justify-center z-20 opacity-0 transition-opacity duration-300" id="trending-left-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white animate-pulse">
                          <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      
                      <div 
                        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-container"
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          const leftArrow = document.getElementById('trending-left-arrow');
                          const rightArrow = document.getElementById('trending-right-arrow');
                          if (leftArrow) {
                            leftArrow.style.opacity = target.scrollLeft > 10 ? '1' : '0';
                          }
                          if (rightArrow) {
                            const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 10;
                            rightArrow.style.opacity = isAtEnd ? '0' : '1';
                          }
                        }}
                        onWheel={(e) => {
                          const target = e.currentTarget;
                          const isAtStart = target.scrollLeft === 0;
                          const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 1;
                          
                          if ((isAtStart && e.deltaX < 0) || (isAtEnd && e.deltaX > 0)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {personas.slice(0, 12).map((persona) => (
                          <div key={`trending-${persona.name}`} className="flex-shrink-0 w-64 snap-start">
                            <PersonaCard
                              name={persona.name}
                              summary={persona.summary}
                              category={persona.category}
                              onClick={() => handlePersonaClick(persona.name)}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Right scroll indicator */}
                      <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#0f0f0f] via-[#0a0a0a]/95 to-transparent pointer-events-none flex items-center justify-center z-20 transition-opacity duration-300" id="trending-right-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white animate-pulse">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </section>
                )}

                {/* For You Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">For you</h2>
                    <span className="text-white/40 text-sm">{filteredPersonas.length} personas</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
                </section>

                {/* Featured Section - horizontal scroll */}
                {selectedCategory === 'All' && personas.length > 8 && (
                  <section className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-pink-400" size={20} />
                      <h2 className="text-xl font-semibold text-white">Featured</h2>
                    </div>
                    <div className="relative group">
                      {/* Left scroll indicator */}
                      <div className="absolute left-0 top-0 bottom-4 w-32 bg-gradient-to-r from-[#0f0f0f] via-[#0a0a0a]/95 to-transparent pointer-events-none flex items-center justify-center z-10 opacity-0 transition-opacity duration-300" id="featured-left-arrow">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white animate-pulse">
                          <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div 
                        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                        onScroll={(e) => {
                          const target = e.currentTarget;
                          const leftArrow = document.getElementById('featured-left-arrow');
                          const rightArrow = document.getElementById('featured-right-arrow');
                          if (leftArrow) {
                            leftArrow.style.opacity = target.scrollLeft > 10 ? '1' : '0';
                          }
                          if (rightArrow) {
                            const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 10;
                            rightArrow.style.opacity = isAtEnd ? '0' : '1';
                          }
                        }}
                        onWheel={(e) => {
                          const target = e.currentTarget;
                          const isAtStart = target.scrollLeft === 0;
                          const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 1;
                          
                          if ((isAtStart && e.deltaX < 0) || (isAtEnd && e.deltaX > 0)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {personas.slice(8, 20).map((persona) => (
                          <div key={`featured-${persona.name}`} className="flex-shrink-0 w-64 snap-start">
                            <PersonaCard
                              name={persona.name}
                              summary={persona.summary}
                              category={persona.category}
                              onClick={() => handlePersonaClick(persona.name)}
                            />
                          </div>
                        ))}
                      </div>
                      {/* Right scroll indicator */}
                      <div className="absolute right-0 top-0 bottom-4 w-32 bg-gradient-to-l from-[#0f0f0f] via-[#0a0a0a]/95 to-transparent pointer-events-none flex items-center justify-center z-10 transition-opacity duration-300" id="featured-right-arrow">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white animate-pulse">
                          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        {/* Floating Create Persona Button */}
        <button
          onClick={() => setShowPersonaCreator(true)}
          className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center gap-2 group"
          title="Create Persona"
        >
          <Sparkles size={24} className="text-white" />
          <span className="text-white font-medium pr-1 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Create Persona
          </span>
        </button>
      </div>

      {/* Persona Creator Modal */}
      {showPersonaCreator && <PersonaCreatorModal onClose={() => setShowPersonaCreator(false)} />}
    </div>
  );
};

export default Home;

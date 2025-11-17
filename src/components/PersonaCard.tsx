import { MessageCircle, Sparkles } from 'lucide-react';

interface PersonaCardProps {
  name: string;
  summary: string;
  category: string;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  'Anime': 'from-pink-500 to-purple-500',
  'Celebrity': 'from-yellow-500 to-orange-500',
  'NSFW': 'from-red-500 to-pink-500',
  'Dark': 'from-purple-900 to-black',
  'Professional': 'from-blue-500 to-cyan-500',
  'Assistant': 'from-green-500 to-teal-500',
  'General': 'from-gray-500 to-slate-500',
};

const categoryEmojis: Record<string, string> = {
  'Anime': '🎌',
  'Celebrity': '⭐',
  'NSFW': '🔥',
  'Dark': '🌑',
  'Professional': '💼',
  'Assistant': '🤖',
  'General': '💬',
};

const PersonaCard = ({ name, summary, category, onClick }: PersonaCardProps) => {
  const gradientClass = categoryColors[category] || categoryColors['General'];
  const emoji = categoryEmojis[category] || '💬';

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1"
    >
      {/* Gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{emoji}</div>
            <div>
              <h3 className="font-bold text-white text-lg group-hover:text-purple-300 transition-colors">
                {name}
              </h3>
              <span className="text-xs text-gray-400">{category}</span>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="text-purple-400" size={20} />
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-300 line-clamp-3 mb-4 leading-relaxed">
          {summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MessageCircle size={14} />
            <span>Chat Now</span>
          </div>
          <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaCard;

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
      className="group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 cursor-pointer transition-all duration-200"
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm sm:text-base mb-0.5 truncate">
              {name}
            </h3>
            <span className="text-[10px] sm:text-xs text-white/30 font-medium">By @creator</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-white/60 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
          {summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/40">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <MessageCircle size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>Chat</span>
          </div>
          <span className="px-1.5 sm:px-2 py-0.5 bg-white/5 rounded-md text-white/50">{category}</span>
        </div>
      </div>
    </div>
  );
};

export default PersonaCard;

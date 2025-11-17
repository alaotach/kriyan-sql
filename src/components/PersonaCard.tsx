import { MessageCircle, Star } from 'lucide-react';
import { Persona } from '../types';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';

interface PersonaCardProps {
  persona: Persona;
  onClick: (persona: Persona) => void;
}

export function PersonaCard({ persona, onClick }: PersonaCardProps) {
  return (
    <Card hoverable onClick={() => onClick(persona)} className="p-5">
      <div className="flex items-start gap-4">
        <Avatar src={persona.avatar} alt={persona.name} size="lg" online={persona.isOnline} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
              {persona.name}
            </h3>
            {persona.isVerified && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            {persona.subtitle}
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 mb-3">
            {persona.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {persona.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} size="sm" variant="outlined">
                {tag}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{persona.messageCount?.toLocaleString() || 0} chats</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

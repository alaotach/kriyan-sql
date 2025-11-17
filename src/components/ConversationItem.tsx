import { Pin, Trash2 } from 'lucide-react';
import { Conversation } from '../types';
import { Avatar } from './ui/Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick: () => void;
  onPin?: () => void;
  onDelete?: () => void;
}

export function ConversationItem({
  conversation,
  isActive = false,
  onClick,
  onPin,
  onDelete,
}: ConversationItemProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-sky-50 dark:bg-sky-900/20'
          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }`}
      onClick={onClick}
    >
      <Avatar src={conversation.personaAvatar} alt={conversation.personaName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-neutral-900 dark:text-white truncate">
            {conversation.personaName}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-neutral-400">
              {formatTime(conversation.timestamp)}
            </span>
            {conversation.isPinned && <Pin className="w-3 h-3 text-sky-500 fill-sky-500" />}
          </div>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
          {conversation.lastMessage}
        </p>
        {conversation.unreadCount && conversation.unreadCount > 0 && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-sky-500 text-white text-xs font-medium rounded-full">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      <div className="hidden group-hover:flex items-center gap-1">
        {onPin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <Pin className="w-4 h-4 text-neutral-500" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
}

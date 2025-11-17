import { Copy, RotateCw, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { Avatar } from './ui/Avatar';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onRate?: (positive: boolean) => void;
}

export function ChatMessage({ message, onRegenerate, onDelete, onRate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.isTyping) {
    return (
      <div className="flex items-start gap-3 animate-fadeIn">
        {message.personaAvatar && (
          <Avatar src={message.personaAvatar} alt="Persona" size="sm" />
        )}
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 group animate-fadeIn ${message.isUser ? 'flex-row-reverse' : ''}`}>
      {!message.isUser && message.personaAvatar && (
        <Avatar src={message.personaAvatar} alt="Persona" size="sm" />
      )}
      <div className={`flex flex-col max-w-[70%] ${message.isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            message.isUser
              ? 'bg-sky-500 text-white rounded-tr-sm'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-tl-sm'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Style for actions: *text*
                em: ({node, ...props}) => (
                  <em className="not-italic text-purple-500 dark:text-purple-400" {...props} />
                ),
                // Style for bold: **text**
                strong: ({node, ...props}) => (
                  <strong className="font-bold" {...props} />
                ),
                // Style for paragraphs
                p: ({node, ...props}) => (
                  <p className="my-1" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <span className="text-xs text-neutral-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {!message.isUser && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Copy"
          >
            <Copy className="w-4 h-4 text-neutral-500" />
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Regenerate"
            >
              <RotateCw className="w-4 h-4 text-neutral-500" />
            </button>
          )}
          {onRate && (
            <>
              <button
                onClick={() => onRate(true)}
                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4 text-neutral-500 hover:text-green-600" />
              </button>
              <button
                onClick={() => onRate(false)}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                title="Bad response"
              >
                <ThumbsDown className="w-4 h-4 text-neutral-500 hover:text-red-600" />
              </button>
            </>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-neutral-500 hover:text-red-600" />
            </button>
          )}
        </div>
      )}
      {copied && (
        <span className="text-xs text-green-600 dark:text-green-400 animate-fadeIn">
          Copied!
        </span>
      )}
    </div>
  );
}

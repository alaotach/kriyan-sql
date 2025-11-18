interface TypingIndicatorProps {
  personaName?: string;
  personaEmoji?: string;
}

export function TypingIndicator({ personaName = 'AI', personaEmoji }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 items-end animate-fadeIn">
      {/* Persona Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
        {personaEmoji || personaName.charAt(0)}
      </div>

      {/* Typing Bubbles */}
      <div className="bg-[#1f1f1f] rounded-2xl px-5 py-4">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, Upload, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface PersonaCreatorModalProps {
  onClose: () => void;
}

export function PersonaCreatorModal({ onClose }: PersonaCreatorModalProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [greeting, setGreeting] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🎭');
  const [category, setCategory] = useState('General');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !tagline.trim() || !description.trim() || !greeting.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await api.createPersona({
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        greeting: greeting.trim(),
        category,
      });
      
      // Close modal and go to home
      onClose();
      navigate('/');
    } catch (err: any) {
      console.error('Failed to create persona:', err);
      setError(err.message || 'Failed to create persona. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create Character</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mb-3 group-hover:opacity-80 transition-all cursor-pointer">
                {avatarEmoji}
              </div>
              <button className="absolute bottom-2 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                <Upload size={16} className="text-white" />
              </button>
            </div>
            <p className="text-xs text-white/40 text-center mt-2">
              Click to upload an image or choose an emoji
            </p>
          </div>

          {/* Character Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Character name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="e.g. Luna"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
            />
            <div className="text-xs text-white/40 mt-1 text-right">{name.length}/20</div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Tagline *
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={50}
              placeholder="e.g. Your thoughtful companion"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
            />
            <div className="text-xs text-white/40 mt-1 text-right">{tagline.length}/50</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="How would you describe this character?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
            <div className="text-xs text-white/40 mt-1 text-right">{description.length}/500</div>
          </div>

          {/* Greeting */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Greeting *
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              maxLength={4096}
              rows={4}
              placeholder="What will this character say to start the conversation?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
            <div className="text-xs text-white/40 mt-1 text-right">{greeting.length}/4096</div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all"
            >
              <option value="General">General</option>
              <option value="Anime">Anime</option>
              <option value="Celebrity">Celebrity</option>
              <option value="Professional">Professional</option>
              <option value="Assistant">Assistant</option>
              <option value="Dark">Dark</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={creating}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !tagline.trim() || !description.trim() || !greeting.trim() || creating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Create Character
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

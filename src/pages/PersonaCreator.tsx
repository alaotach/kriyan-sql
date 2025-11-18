import { useState } from 'react';
import { ArrowLeft, Upload, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface PersonaCreatorProps {
  onBack?: () => void;
  onSave?: () => void;
}

export function PersonaCreator({ onBack }: PersonaCreatorProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [greeting, setGreeting] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🎭');
  const [category, setCategory] = useState('General');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

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
      
      // Navigate to the newly created persona
      navigate(`/chat?persona=${encodeURIComponent(name.trim())}`);
    } catch (err: any) {
      console.error('Failed to create persona:', err);
      setError(err.message || 'Failed to create persona. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white/5 rounded-lg transition-all text-white/70"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-white">Create character</h1>
          <button className="text-sm text-white/70 hover:text-white/90 transition-all flex items-center gap-1">
            <BookOpen size={16} />
            View Character Book
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 space-y-6">
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
              Character name
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
              Tagline
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
              Description
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
              Greeting
            </label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              maxLength={4096}
              rows={6}
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

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              Visibility
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setVisibility('public')}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  visibility === 'public'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.07]'
                }`}
              >
                <div className="font-medium">Public</div>
                <div className="text-xs text-white/40 mt-1">Anyone can chat</div>
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  visibility === 'private'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/[0.07]'
                }`}
              >
                <div className="font-medium">Private</div>
                <div className="text-xs text-white/40 mt-1">Only you</div>
              </button>
            </div>
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
              onClick={handleBack}
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
                  Create character
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

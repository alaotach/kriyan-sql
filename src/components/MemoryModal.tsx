import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getUserMemories, 
  deleteUserMemory, 
  saveUserMemory,
  getMemorySettings,
  setMemorySettings,
  UserMemory 
} from '../services/firebase';

interface MemoryModalProps {
  onClose: () => void;
}

export function MemoryModal({ onClose }: MemoryModalProps) {
  const { user } = useAuth();
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');

  useEffect(() => {
    if (user) {
      loadMemories();
      loadSettings();
    }
  }, [user]);

  const loadMemories = async () => {
    if (!user) return;
    try {
      const data = await getUserMemories(user.uid);
      setMemories(data);
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  };

  const loadSettings = async () => {
    if (!user) return;
    try {
      const settings = await getMemorySettings(user.uid);
      setMemoryEnabled(settings.enabled);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMemory = async () => {
    if (!user) return;
    try {
      const newValue = !memoryEnabled;
      await setMemorySettings(user.uid, newValue);
      setMemoryEnabled(newValue);
    } catch (error) {
      console.error('Failed to toggle memory:', error);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await deleteUserMemory(memoryId);
      setMemories(memories.filter(m => m.id !== memoryId));
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  const handleAddMemory = async () => {
    if (!user || !newMemory.trim()) return;
    try {
      await saveUserMemory(user.uid, newMemory.trim(), selectedCategory);
      await loadMemories();
      setNewMemory('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add memory:', error);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'work': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'relationships': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'preferences': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <p className="text-white">Please sign in to access memory settings</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Memory</h2>
              <p className="text-sm text-white/50">AI learns about you over time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <h3 className="text-white font-medium">Enable Memory</h3>
              <p className="text-sm text-white/50 mt-1">Let AI remember information about you</p>
            </div>
            <button
              onClick={handleToggleMemory}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                memoryEnabled ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  memoryEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Memories List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Your Memories ({memories.length})</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all"
              >
                <Plus size={16} />
                Add Memory
              </button>
            </div>

            {memories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-20">🧠</div>
                <p className="text-white/40">No memories yet</p>
                <p className="text-white/30 text-sm mt-1">Chat with AI to build your memory bank</p>
              </div>
            ) : (
              <div className="space-y-2">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/[0.07] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-white/90 text-sm leading-relaxed">{memory.content}</p>
                        {memory.category && (
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs border ${getCategoryColor(memory.category)}`}>
                            {memory.category}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => memory.id && handleDeleteMemory(memory.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete memory"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Memory</h3>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Enter something you want the AI to remember..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
            />
            <div className="mt-3">
              <label className="block text-sm text-white/70 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/20"
              >
                <option value="general">General</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="relationships">Relationships</option>
                <option value="preferences">Preferences</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewMemory('');
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                disabled={!newMemory.trim()}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-white/10 disabled:text-white/30 rounded-lg text-white transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

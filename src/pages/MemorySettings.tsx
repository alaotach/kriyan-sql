import { useState, useEffect } from 'react';
import { Trash2, Brain, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getUserMemories, 
  deleteUserMemory, 
  saveUserMemory,
  getMemorySettings,
  setMemorySettings,
  UserMemory 
} from '../services/firebase';

export function MemorySettings() {
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
      const id = await saveUserMemory(user.uid, newMemory.trim(), selectedCategory);
      await loadMemories();
      setNewMemory('');
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add memory:', error);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-500/20 text-blue-400';
      case 'work': return 'bg-green-500/20 text-green-400';
      case 'relationships': return 'bg-pink-500/20 text-pink-400';
      case 'preferences': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-neutral-500/20 text-neutral-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Please sign in to access memory settings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-8 h-8 text-sky-500" />
          <h1 className="text-3xl font-bold">Memory Settings</h1>
        </div>

        {/* Description */}
        <div className="bg-neutral-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">How Memory Works</h2>
          <p className="text-neutral-400 mb-3">
            When enabled, the AI will learn about you from your conversations and remember details like your preferences, relationships, work, and personality.
          </p>
          <p className="text-neutral-400">
            Memories are analyzed after each conversation to extract key information. You can review and delete individual memories at any time.
          </p>
        </div>

        {/* Toggle */}
        <div className="bg-neutral-900 rounded-lg p-6 mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Enable Memory</h3>
            <p className="text-sm text-neutral-400">Allow AI to learn and remember things about you</p>
          </div>
          <button
            onClick={handleToggleMemory}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              memoryEnabled ? 'bg-sky-500' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                memoryEnabled ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </div>

        {/* Memories List */}
        {memoryEnabled && (
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your Memories ({memories.length})</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Memory
              </button>
            </div>

            {memories.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">
                No memories yet. Start chatting and the AI will learn about you!
              </p>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="bg-neutral-800 rounded-lg p-4 flex items-start justify-between gap-4 hover:bg-neutral-750 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white mb-2">{memory.content}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(memory.category)}`}>
                          {memory.category}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {memory.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Memory Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Add Memory</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="E.g., My name is John and I work as a software engineer"
                className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 mb-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-neutral-800 text-white rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="general">General</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="relationships">Relationships</option>
                <option value="preferences">Preferences</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMemory}
                  disabled={!newMemory.trim()}
                  className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-neutral-700 disabled:text-neutral-500 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

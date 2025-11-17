import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Slider } from '../components/ui/Slider';
import { Chip } from '../components/ui/Chip';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { ExampleDialogue } from '../types';

interface PersonaCreatorProps {
  onBack: () => void;
  onSave: () => void;
}

export function PersonaCreator({ onBack, onSave }: PersonaCreatorProps) {
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('Friends');
  const [creativity, setCreativity] = useState(70);
  const [strictness, setStrictness] = useState(50);
  const [personalityStrength, setPersonalityStrength] = useState(80);
  const [exampleDialogues, setExampleDialogues] = useState<ExampleDialogue[]>([
    { id: '1', userMessage: '', personaResponse: '' },
  ]);
  const [avatarPreview] = useState('https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=200');
  const [showPreview, setShowPreview] = useState(false);

  const categories = ['Friends', 'Romance', 'Anime', 'Games', 'Horror', 'Tech', 'Fantasy', 'Comedy'];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddDialogue = () => {
    setExampleDialogues([
      ...exampleDialogues,
      { id: Date.now().toString(), userMessage: '', personaResponse: '' },
    ]);
  };

  const handleRemoveDialogue = (id: string) => {
    setExampleDialogues(exampleDialogues.filter((d) => d.id !== id));
  };

  const handleDialogueChange = (id: string, field: 'userMessage' | 'personaResponse', value: string) => {
    setExampleDialogues(
      exampleDialogues.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Create Persona
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="w-5 h-5" />
              Preview
            </Button>
            <Button onClick={onSave}>
              <Save className="w-5 h-5" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
              Basic Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar src={avatarPreview} alt="Persona" size="2xl" />
                <div className="flex-1">
                  <Button variant="secondary" size="sm">
                    Upload Avatar
                  </Button>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>
              <Input
                label="Persona Name"
                placeholder="Enter a unique name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Subtitle"
                placeholder="A short tagline (e.g., 'Your thoughtful companion')"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
              <Textarea
                label="Short Description"
                placeholder="A brief description (2-3 lines) that appears on the persona card..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Textarea
                label="Detailed Description"
                placeholder="A comprehensive description of the persona's personality, background, and traits..."
                rows={6}
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      active={category === cat}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Chip key={tag} variant="primary">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 hover:text-white/80"
                      >
                        ×
                      </button>
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
              Persona Behavior
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Adjust these settings to control how your persona responds and interacts.
                </p>
                <Slider
                  label="Creativity"
                  value={creativity}
                  onChange={(e) => setCreativity(Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Higher values make responses more creative and varied
                </p>
              </div>
              <Slider
                label="Response Strictness"
                value={strictness}
                onChange={(e) => setStrictness(Number(e.target.value))}
                min={0}
                max={100}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-4">
                Higher values keep responses more focused and on-topic
              </p>
              <Slider
                label="Personality Strength"
                value={personalityStrength}
                onChange={(e) => setPersonalityStrength(Number(e.target.value))}
                min={0}
                max={100}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-4">
                Higher values make the persona's traits more prominent
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Example Dialogues
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Provide examples of how your persona should respond
                </p>
              </div>
              <Button onClick={handleAddDialogue} size="sm">
                <Plus className="w-4 h-4" />
                Add Example
              </Button>
            </div>
            <div className="space-y-6">
              {exampleDialogues.map((dialogue, index) => (
                <Card key={dialogue.id} className="p-4 bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-neutral-900 dark:text-white">
                      Example {index + 1}
                    </h3>
                    {exampleDialogues.length > 1 && (
                      <button
                        onClick={() => handleRemoveDialogue(dialogue.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      label="User Message"
                      placeholder="What the user might say..."
                      rows={2}
                      value={dialogue.userMessage}
                      onChange={(e) =>
                        handleDialogueChange(dialogue.id, 'userMessage', e.target.value)
                      }
                    />
                    <Textarea
                      label="Persona Response"
                      placeholder="How your persona should respond..."
                      rows={3}
                      value={dialogue.personaResponse}
                      onChange={(e) =>
                        handleDialogueChange(dialogue.id, 'personaResponse', e.target.value)
                      }
                    />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {showPreview && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                Preview
              </h2>
              <div className="flex items-start gap-4 p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                <Avatar src={avatarPreview} alt={name || 'Persona'} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    {name || 'Persona Name'}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    {subtitle || 'Persona subtitle'}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
                    {description || 'Persona description will appear here...'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="outlined">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

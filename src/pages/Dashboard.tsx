import { useState } from 'react';
import { Settings, MessageCircle, Heart, User, Moon, Sun, Bell, Globe } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Input } from '../components/ui/Input';
import { useTheme } from '../context/ThemeContext';
import { Persona } from '../types';

interface DashboardProps {
  onBack: () => void;
  onPersonaSelect?: (persona: Persona) => void;
}

const mockUser = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
};

const savedPersonas: Persona[] = [
  {
    id: '1',
    name: 'Luna',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Your thoughtful companion',
    description: 'A caring AI friend',
    longDescription: '',
    tags: ['Supportive', 'Thoughtful'],
    category: 'Friends',
    messageCount: 125400,
  },
  {
    id: '3',
    name: 'Nova',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Tech enthusiast',
    description: 'A brilliant mind passionate about technology',
    longDescription: '',
    tags: ['Smart', 'Techy'],
    category: 'Tech',
    messageCount: 234500,
  },
];

const createdPersonas: Persona[] = [
  {
    id: '10',
    name: 'Phoenix',
    avatar: 'https://images.pexels.com/photos/1704488/pexels-photo-1704488.jpeg?auto=compress&cs=tinysrgb&w=200',
    subtitle: 'Wise mentor',
    description: 'A wise guide with stories from across the ages',
    longDescription: '',
    tags: ['Wise', 'Mentor', 'Guide'],
    category: 'Fantasy',
    createdBy: mockUser.id,
    messageCount: 1240,
  },
];

export function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'created' | 'settings'>('saved');
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dashboard</h1>
          <Button variant="secondary" onClick={onBack}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar src={mockUser.avatar} alt={mockUser.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                {mockUser.name}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">{mockUser.email}</p>
            </div>
            <Button variant="secondary">
              <Settings className="w-5 h-5" />
              Edit Profile
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                <MessageCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">247</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Chats</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{savedPersonas.length}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Saved Personas</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{createdPersonas.length}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Created Personas</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'saved'
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Saved Personas
              {activeTab === 'saved' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'created'
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Created Personas
              {activeTab === 'created' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'settings'
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Settings
              {activeTab === 'settings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 dark:bg-sky-400"></span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {savedPersonas.map((persona) => (
              <Card key={persona.id} hoverable className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={persona.avatar} alt={persona.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate mb-1">
                      {persona.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                      {persona.subtitle}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {persona.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} size="sm" variant="outlined">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'created' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {createdPersonas.map((persona) => (
              <Card key={persona.id} hoverable className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={persona.avatar} alt={persona.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate mb-1">
                      {persona.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                      {persona.subtitle}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {persona.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} size="sm" variant="outlined">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {persona.messageCount?.toLocaleString()} chats
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fadeIn space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Appearance
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">Theme</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {theme === 'light' ? 'Light mode' : 'Dark mode'}
                    </p>
                  </div>
                </div>
                <Button onClick={toggleTheme} variant="secondary">
                  Toggle
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Notifications
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      Push Notifications
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Receive updates about your chats
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setNotifications(!notifications)}
                  variant={notifications ? 'primary' : 'secondary'}
                >
                  {notifications ? 'On' : 'Off'}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Language
              </h3>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Account
              </h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="danger" className="w-full justify-start">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

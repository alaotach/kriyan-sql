import { useState } from 'react';
import { Home } from './pages/Home';
import { PersonaProfile } from './pages/PersonaProfile';
import { Chat } from './pages/Chat';
import { PersonaCreator } from './pages/PersonaCreator';
import { Dashboard } from './pages/Dashboard';
import { ThemeProvider } from './context/ThemeContext';
import { Persona } from './types';

type View = 'home' | 'profile' | 'chat' | 'create' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setCurrentView('profile');
  };

  const handleStartChat = () => {
    if (selectedPersona) {
      setCurrentView('chat');
    }
  };

  const handleBack = () => {
    setCurrentView('home');
    setSelectedPersona(null);
  };

  const handleBackToProfile = () => {
    setCurrentView('profile');
  };

  const handleCreatePersona = () => {
    setCurrentView('create');
  };

  const handleSavePersona = () => {
    setCurrentView('home');
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {currentView === 'home' && (
          <Home onPersonaSelect={handlePersonaSelect} onCreatePersona={handleCreatePersona} />
        )}
        {currentView === 'profile' && selectedPersona && (
          <PersonaProfile
            persona={selectedPersona}
            onBack={handleBack}
            onStartChat={handleStartChat}
          />
        )}
        {currentView === 'chat' && selectedPersona && (
          <Chat selectedPersona={selectedPersona} onBack={handleBackToProfile} />
        )}
        {currentView === 'create' && (
          <PersonaCreator onBack={handleBack} onSave={handleSavePersona} />
        )}
        {currentView === 'dashboard' && <Dashboard onBack={handleBack} />}
      </div>
    </ThemeProvider>
  );
}

export default App;

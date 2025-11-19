import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Shield, Key, LogOut, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import KeyManagement from '../components/KeyManagement';

const Profile = () => {
  const navigate = useNavigate();
  const { user, userProfile, logOut } = useAuth();
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement profile update
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      // Use Firebase auth metadata as fallback
      if (user?.metadata?.creationTime) {
        return new Date(user.metadata.creationTime).toLocaleDateString();
      }
      return 'Recently';
    }
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 sm:gap-2 text-white/70 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Profile</h1>
          <div className="w-12 sm:w-24" /> {/* Spacer for centering */}
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/10">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Profile'} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0"
              style={{ display: user?.photoURL ? 'none' : 'flex' }}
            >
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {user?.displayName || 'User'}
              </h2>
              <p className="text-white/70">{user?.email}</p>
              <p className="text-white/50 text-sm mt-1">
                Member since {formatDate(userProfile?.createdAt)}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">
                <User size={16} className="inline mr-2" />
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
              />
              <p className="text-white/40 text-xs mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">
                <Calendar size={16} className="inline mr-2" />
                Account Created
              </label>
              <input
                type="text"
                value={formatDate(userProfile?.createdAt)}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Shield size={20} className="sm:w-6 sm:h-6" />
            Security & Privacy
          </h3>

          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => setShowKeyManagement(true)}
              className="w-full p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-left transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Key className="text-purple-400 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-white font-medium">Encryption Keys</p>
                    <p className="text-white/60 text-sm">Manage your end-to-end encryption keys</p>
                  </div>
                </div>
                <ArrowLeft className="text-white/40 group-hover:text-white/60 rotate-180" size={20} />
              </div>
            </button>

            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="text-green-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-white font-medium mb-1">End-to-End Encrypted</p>
                  <p className="text-white/70 text-sm">
                    All your conversations are encrypted with AES-256-GCM. Your messages are secure and private.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8">
          <h3 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h3>
          
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors flex items-center justify-center gap-2 text-red-400 font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Key Management Modal */}
      {showKeyManagement && user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <KeyManagement userId={user.uid} onClose={() => setShowKeyManagement(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

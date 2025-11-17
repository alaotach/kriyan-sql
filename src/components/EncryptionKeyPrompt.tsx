import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Key } from 'lucide-react';
import KeyManagement from './KeyManagement';

interface EncryptionKeyPromptProps {
  userId: string;
}

const EncryptionKeyPrompt = ({ userId }: EncryptionKeyPromptProps) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showKeyManagement, setShowKeyManagement] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // DISABLED: Automatic key sync handles everything now
    // - First-time users: Key created on first chat automatically
    // - Returning users: Key restored from cloud automatically
    // - Manual restore: Available in Settings > Encryption Keys
    
    // This prompt is kept for emergency fallback only but never shows
    console.log('🔐 Encryption key prompt component loaded (disabled by default)');
  }, [userId]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem(`encryption_prompt_dismissed_${userId}`, 'true');
  };

  const handleRestoreKey = () => {
    setShowPrompt(false);
    setShowKeyManagement(true);
  };

  const handleContinueWithoutKey = () => {
    // User wants to create a new key (will lose access to old chats)
    handleDismiss();
  };

  if (dismissed || !showPrompt) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 to-yellow-900/50 rounded-2xl border-2 border-yellow-500/50 max-w-md w-full p-6 shadow-2xl">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-yellow-500/20 animate-pulse">
              <AlertTriangle className="text-yellow-400" size={48} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Automatic Key Sync Failed
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Manual key restoration required
          </p>

          {/* Explanation */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-300">
                  Automatic key sync didn't complete. This is rare and usually means:
                </p>
                <ul className="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Network connectivity issues</li>
                  <li>No cloud backup exists yet</li>
                  <li>First time logging in</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Key className="text-purple-400 mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-gray-300">
                  You can <strong className="text-white">restore your key manually</strong> using a recovery code or password, or continue with a new key.
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <button
              onClick={handleRestoreKey}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Key size={20} />
              Restore Key Manually
            </button>
            
            <button
              onClick={handleContinueWithoutKey}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Start Fresh (New Key)
            </button>
          </div>

          {/* Info */}
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
              💡 Automatic sync will continue in the background. If a backup is found later, you'll be notified.
            </p>
          </div>
        </div>
      </div>

      {/* Key Management Modal */}
      {showKeyManagement && (
        <KeyManagement
          userId={userId}
          onClose={() => {
            setShowKeyManagement(false);
            setShowPrompt(true);
          }}
        />
      )}
    </>
  );
};

export default EncryptionKeyPrompt;

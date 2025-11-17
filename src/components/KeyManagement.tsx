import { useState } from 'react';
import { Shield, Key, Download, Upload, AlertCircle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import {
  generateRecoveryCode,
  restoreFromRecoveryCode,
  exportKeyForCloudBackup,
  hasEncryptionKey,
} from '../utils/encryption';
import { updateUserProfile } from '../services/firebase';

interface KeyManagementProps {
  userId: string;
  onClose?: () => void;
}

const KeyManagement = ({ userId, onClose }: KeyManagementProps) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGenerateRecoveryCode = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const code = await generateRecoveryCode(userId);
      setRecoveryCode(code);
      setMessage({ type: 'success', text: 'Recovery code generated! Save it somewhere safe.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate recovery code' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setMessage({ type: 'success', text: 'Recovery code copied to clipboard!' });
  };

  const handleDownloadRecoveryCode = () => {
    const blob = new Blob([recoveryCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kriyan-recovery-${userId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Recovery code downloaded!' });
  };

  const handleBackupToCloud = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter a password' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const backup = await exportKeyForCloudBackup(userId, password);
      
      // Save to Firebase user profile
      await updateUserProfile(userId, {
        encryptionKeyBackup: backup.encryptedKey,
        encryptionKeySalt: backup.salt,
      } as any);
      
      setMessage({ type: 'success', text: 'Key backed up to cloud successfully!' });
      setPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to backup key to cloud' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromCode = async () => {
    if (!restoreCode) {
      setMessage({ type: 'error', text: 'Please enter a recovery code' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const success = await restoreFromRecoveryCode(userId, restoreCode);
      if (success) {
        setMessage({ type: 'success', text: 'Key restored successfully! Reload the page.' });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ type: 'error', text: 'Invalid recovery code' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to restore key' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFromCloud = async () => {
    if (!restorePassword) {
      setMessage({ type: 'error', text: 'Please enter your backup password' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // Fetch backup from Firebase (you'll need to implement this)
      setMessage({ type: 'error', text: 'Cloud restore not yet implemented. Use recovery code.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to restore from cloud' });
    } finally {
      setLoading(false);
    }
  };

  const hasKey = hasEncryptionKey(userId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900/50 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Shield className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Encryption Key Management</h2>
                <p className="text-sm text-gray-400">Backup and restore your encryption key</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="p-6 border-b border-white/10">
          {hasKey ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>Encryption key found on this device</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={20} />
              <span>No encryption key on this device. Restore from backup.</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 px-6 py-3 text-center transition-colors ${
              activeTab === 'backup'
                ? 'bg-purple-500/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Download className="inline mr-2" size={18} />
            Backup Key
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            className={`flex-1 px-6 py-3 text-center transition-colors ${
              activeTab === 'restore'
                ? 'bg-purple-500/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="inline mr-2" size={18} />
            Restore Key
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Messages */}
          {message && (
            <div
              className={`p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="flex-1">{message.text}</span>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === 'backup' && hasKey && (
            <div className="space-y-6">
              {/* Recovery Code Method */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Key size={20} className="text-purple-400" />
                  Recovery Code (Recommended)
                </h3>
                <p className="text-sm text-gray-400">
                  Generate a recovery code to access your chats on other devices. Save it securely!
                </p>
                
                {!recoveryCode ? (
                  <button
                    onClick={handleGenerateRecoveryCode}
                    disabled={loading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate Recovery Code'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-black/30 rounded-lg border border-white/10">
                      <code className="text-sm text-green-400 break-all">{recoveryCode}</code>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyRecoveryCode}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                      <button
                        onClick={handleDownloadRecoveryCode}
                        className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-400">
                        ⚠️ Save this code in a secure place! Anyone with this code can decrypt your messages.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cloud Backup Method */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield size={20} className="text-purple-400" />
                  Cloud Backup (Password Protected)
                </h3>
                <p className="text-sm text-gray-400">
                  Backup your key to Firebase encrypted with a password you choose.
                </p>
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                <button
                  onClick={handleBackupToCloud}
                  disabled={loading || !password}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Backing up...' : 'Backup to Cloud'}
                </button>
              </div>
            </div>
          )}

          {/* Restore Tab */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              {/* Restore from Recovery Code */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Key size={20} className="text-purple-400" />
                  Restore from Recovery Code
                </h3>
                <p className="text-sm text-gray-400">
                  Enter your recovery code to access your encrypted chats on this device.
                </p>
                
                <textarea
                  value={restoreCode}
                  onChange={(e) => setRestoreCode(e.target.value)}
                  placeholder="Paste your recovery code here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
                
                <button
                  onClick={handleRestoreFromCode}
                  disabled={loading || !restoreCode}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Restoring...' : 'Restore Key'}
                </button>
              </div>

              {/* Restore from Cloud */}
              <div className="space-y-3 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield size={20} className="text-purple-400" />
                  Restore from Cloud Backup
                </h3>
                <p className="text-sm text-gray-400">
                  Enter the password you used to backup your key to the cloud.
                </p>
                
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="Enter your backup password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <button
                  onClick={handleRestoreFromCloud}
                  disabled={loading || !restorePassword}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Restoring...' : 'Restore from Cloud'}
                </button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>💡 Tip:</strong> We recommend generating a recovery code and storing it in a password manager like 1Password or Bitwarden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyManagement;

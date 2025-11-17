import { Shield, Lock, Key } from 'lucide-react';

interface EncryptionBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const EncryptionBadge = ({ className = '', showDetails = false }: EncryptionBadgeProps) => {
  if (!showDetails) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs ${className}`}>
        <Lock size={12} />
        <span>Encrypted</span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-green-500/30 bg-green-500/5 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-green-500/20">
          <Shield className="text-green-400" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-green-400 font-medium mb-1 flex items-center gap-2">
            End-to-End Encrypted
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            Your conversations are encrypted using AES-256-GCM encryption. Only you can read them.
          </p>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <Lock size={12} className="text-green-400" />
              <span>Messages encrypted before sending to Firebase</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Key size={12} className="text-green-400" />
              <span>Encryption key stored locally on your device</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield size={12} className="text-green-400" />
              <span>Even we cannot read your messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionBadge;

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Globe, Clock } from 'lucide-react';
import { api } from '../services/api';

interface ShareChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<{ role: string; content: string }>;
  personaName: string;
  title: string;
  existingShareId?: string;
  onShareCreated?: (shareId: string) => void;
}

export const ShareChatModal: React.FC<ShareChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  personaName,
  title,
  existingShareId,
  onShareCreated,
}) => {
  const [shareUrl, setShareUrl] = useState<string>(existingShareId ? `http://localhost:5173/shared/${existingShareId}` : '');
  const [shareId, setShareId] = useState<string>(existingShareId || '');
  const [expiryOption, setExpiryOption] = useState<number | null>(168); // 7 days default
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Update state when existingShareId prop changes
  useEffect(() => {
    if (existingShareId) {
      setShareUrl(`http://localhost:5173/shared/${existingShareId}`);
      setShareId(existingShareId);
    }
  }, [existingShareId]);

  const expiryOptions = [
    { label: '1 hour', hours: 1 },
    { label: '24 hours', hours: 24 },
    { label: '7 days', hours: 168 },
    { label: '30 days', hours: 720 },
    { label: 'Never', hours: null },
  ];

  const handleCreateShare = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await api.shareChat(messages, personaName, title, expiryOption || undefined);
      setShareUrl(result.shareUrl);
      setShareId(result.shareId);
      // Notify parent component to save the shareId
      if (onShareCreated) {
        onShareCreated(result.shareId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShare = async () => {
    if (!shareId) return;
    try {
      setLoading(true);
      setError('');
      await api.updateSharedChat(shareId, messages);
      alert('Shared chat updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shared chat');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full p-6 border border-[#2a2a2a]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">Share Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Chat Info */}
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-sm text-gray-400 mb-1">Sharing conversation:</p>
            <p className="text-white font-medium truncate">{title}</p>
            <p className="text-xs text-gray-500 mt-1">with {personaName}</p>
          </div>

          {/* Expiry Selection - Only show if creating new share */}
          {!shareUrl && !existingShareId && (
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                Link expires in:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {expiryOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setExpiryOption(option.hours)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      expiryOption === option.hours
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#0f0f0f] text-gray-400 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Share URL Display */}
          {shareUrl && (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Share link:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!shareUrl && !existingShareId && (
              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Share Link'}
              </button>
            )}

            {(shareUrl || existingShareId) && (
              <button
                onClick={handleUpdateShare}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Updating...' : 'Update Shared Chat'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

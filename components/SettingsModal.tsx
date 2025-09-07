
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onApiKeyUpdate: (newKey: string) => void;
  onResetProgress: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentApiKey, onApiKeyUpdate, onResetProgress }) => {
  const [apiKey, setApiKey] = useState(currentApiKey);

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      onApiKeyUpdate(apiKey.trim());
      onClose();
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your progress and choose new starting images? Your discoveries will be lost.')) {
        onResetProgress();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Settings</h2>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">API Key</h3>
            <p className="text-xs text-gray-500 mb-3">Update your Gemini API Key. Changes will be saved for the current session.</p>
            <div className="flex gap-2">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your Gemini API Key"
                    className="flex-grow px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                />
                <button
                    onClick={handleApiKeySave}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md transition-colors disabled:opacity-50"
                    disabled={!apiKey.trim() || apiKey.trim() === currentApiKey}
                >
                    Save
                </button>
            </div>
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Progress</h3>
            <p className="text-xs text-gray-500 mb-3">This will clear your workspace and discoveries, allowing you to choose new starting images. Your API key will be saved.</p>
            <button
                onClick={handleReset}
                className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-md transition-colors"
            >
                Reset and Choose New Images
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;

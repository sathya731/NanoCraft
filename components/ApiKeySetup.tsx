
import React, { useState } from 'react';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySet(key.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-cyan-400">Welcome to Nano Craft</h1>
        <p className="text-center text-gray-400 mb-6">Enter your Gemini API Key to begin.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Your Gemini API Key"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md transition-colors duration-300 disabled:opacity-50"
            disabled={!key.trim()}
          >
            Start Crafting
          </button>
        </form>
         <p className="text-xs text-gray-500 mt-4 text-center">Your API key is stored only in your browser's session storage and is not sent to any server other than Google's API.</p>
      </div>
    </div>
  );
};

export default ApiKeySetup;

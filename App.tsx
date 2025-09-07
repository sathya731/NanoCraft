import React, { useState, useEffect } from 'react';
import ApiKeySetup from './components/ApiKeySetup';
import CraftingInterface from './components/CraftingInterface';
import useSessionStorage from './hooks/useSessionStorage';
import InitialImageSetup from './components/InitialImageSetup';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [craftingStarted, setCraftingStarted] = useSessionStorage<boolean>('craftingStarted', false);

  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      // @ts-ignore
      process.env = { ...process.env, API_KEY: storedApiKey };
    }
    setIsLoading(false);
  }, []);

  const handleApiKeySet = (key: string) => {
    sessionStorage.setItem('gemini-api-key', key);
    setApiKey(key);
    // @ts-ignore
    process.env = { ...process.env, API_KEY: key };
    // Reset crafting progress if a new key is set
    setCraftingStarted(false);
    // A simple reload ensures all services use the new key cleanly.
    window.location.reload();
  };
  
  const handleReset = () => {
    // This function is now responsible for resetting the crafting state managed by App.tsx
    setCraftingStarted(false);
  };

  const handleChangeApiKey = () => {
    sessionStorage.removeItem('gemini-api-key');
    setApiKey(null);
    setCraftingStarted(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-screen h-screen font-sans">
      {!apiKey ? (
        <ApiKeySetup onApiKeySet={handleApiKeySet} />
      ) : !craftingStarted ? (
        <InitialImageSetup
          apiKey={apiKey}
          onCompleted={() => setCraftingStarted(true)}
        />
      ) : (
        <CraftingInterface
          apiKey={apiKey}
          onChangeApiKey={handleChangeApiKey}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default App;

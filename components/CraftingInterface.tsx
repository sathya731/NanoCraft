import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CraftedElement, WorkspaceElement } from '../types';
import useSessionStorage from '../hooks/useSessionStorage';
import Workspace from './Workspace';
import DiscoveriesPanel from './DiscoveriesPanel';
import ElementDetailsModal from './ElementDetailsModal';
import SettingsModal from './SettingsModal';
import { combineElements } from '../services/geminiService';
import Spinner from './Spinner';
import { initDB, getAllElementsFromDB, saveElementToDB, clearAllElementsFromDB } from '../utils/db';
import { soundManager } from '../utils/soundManager';


interface CraftingInterfaceProps {
  apiKey: string;
  onChangeApiKey: () => void;
  onReset: () => void;
}

const CraftingInterface: React.FC<CraftingInterfaceProps> = ({ apiKey, onChangeApiKey, onReset }) => {
  const [discoveredElements, setDiscoveredElements] = useState<CraftedElement[]>([]);
  const [workspaceElements, setWorkspaceElements] = useSessionStorage<WorkspaceElement[]>('workspaceElements', []);
  const [combinationCache, setCombinationCache] = useSessionStorage<Record<string, string>>('combinationCache', {});
  const [selectedElement, setSelectedElement] = useState<CraftedElement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFromDb = async () => {
        try {
            await initDB();
            const elements = await getAllElementsFromDB();
            if (elements.length > 0) {
                setDiscoveredElements(elements);
            } else {
                // If DB is empty but we're in the crafting interface,
                // show an error and let the user choose to reset
                setError('No elements found. Please reset your progress to choose new starting images.');
            }
        } catch (err) {
            console.error('Failed to load from database:', err);
            setError('Failed to load saved elements. You may need to reset your progress.');
        }
        setIsDbLoading(false);
    };
    loadFromDb();
  }, []);
  
  const addElementToWorkspace = (elementId: string, clientX: number, clientY: number) => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const x = clientX - rect.left - 60; // 60 is half width
    const y = clientY - rect.top - 60; // 60 is half height
    
    // Play drop sound when element is added to workspace
    soundManager.playDropSound();
    
    setWorkspaceElements(prev => [...prev, {
      instanceId: uuidv4(),
      elementId,
      x: Math.max(0, Math.min(x, rect.width - 120)),
      y: Math.max(0, Math.min(y, rect.height - 120)),
      width: 120,
      height: 120
    }]);
  };

  const clearWorkspace = () => {
    setWorkspaceElements([]);
  };

    const handleResetProgress = async () => {
        if (window.confirm('Are you sure you want to reset your progress and choose new starting images? Your discoveries will be lost.')) {
            setIsLoading(true);
            setLoadingMessage("Resetting progress...");
            try {
                await clearAllElementsFromDB();
                setWorkspaceElements([]);
                setCombinationCache({});
                setIsLoading(false);
                onReset();
            } catch (err) {
                setError("Failed to reset progress. Please try clearing your browser's site data manually.");
                setIsLoading(false);
            }
        }
    };

    const handleApiKeyUpdate = (newApiKey: string) => {
        // Update the API key without resetting progress
        sessionStorage.setItem('gemini-api-key', newApiKey);
        // Since the API key is used globally, we need to reload the page
        // to ensure all services use the new key
        window.location.reload();
    };

    const handleOpenSettings = () => {
        setIsSettingsOpen(true);
    };

  const handleCombine = useCallback(async (elem1InstanceId: string, elem2InstanceId: string) => {
    setIsLoading(true);
    setError(null);
    
    // Play combine sound when combination starts
    soundManager.playCombineSound();

    const elem1Instance = workspaceElements.find(e => e.instanceId === elem1InstanceId);
    const elem2Instance = workspaceElements.find(e => e.instanceId === elem2InstanceId);

    if (!elem1Instance || !elem2Instance) {
        setIsLoading(false);
        return;
    }

    const element1 = discoveredElements.find(e => e.id === elem1Instance.elementId)!;
    const element2 = discoveredElements.find(e => e.id === elem2Instance.elementId)!;

    const sortedIds = [element1.id, element2.id].sort();
    const cacheKey = sortedIds.join('+');

    try {
        let newElement: CraftedElement;
        if (combinationCache[cacheKey]) {
            setLoadingMessage("Recreating known discovery...");
            newElement = discoveredElements.find(e => e.id === combinationCache[cacheKey])!;
        } else {
            setLoadingMessage(`Combining ${element1.title} and ${element2.title}...`);
            const { title, description, imageB64, mimeType } = await combineElements(apiKey, element1, element2);
            newElement = {
                id: uuidv4(),
                title,
                description,
                imageB64,
                mimeType,
                parents: sortedIds as [string, string],
            };
            await saveElementToDB(newElement);
            setDiscoveredElements(prev => {
                if(prev.find(e => e.id === newElement.id)) return prev;
                return [...prev, newElement];
            });
            setCombinationCache(prev => ({...prev, [cacheKey]: newElement.id}));
        }

        const newX = (elem1Instance.x + elem2Instance.x) / 2;
        const newY = (elem1Instance.y + elem2Instance.y) / 2;

        setWorkspaceElements(prev => [
            ...prev.filter(e => e.instanceId !== elem1InstanceId && e.instanceId !== elem2InstanceId),
            {
                instanceId: uuidv4(),
                elementId: newElement.id,
                x: newX,
                y: newY,
                width: 120,
                height: 120
            }
        ]);
    } catch (err: any) {
        console.error("Combination failed", err);
        setError(`Failed to combine: ${err.message || 'Unknown error'}`);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [apiKey, combinationCache, discoveredElements, setCombinationCache, setWorkspaceElements, workspaceElements]);

  if (isDbLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <Spinner />
            <p className="ml-4">Loading discoveries...</p>
        </div>
    );
  }
  
  const getElementById = (id: string) => discoveredElements.find(e => e.id === id);

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 overflow-hidden">
        {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
                <Spinner />
                <p className="mt-4 text-lg text-cyan-300">{loadingMessage}</p>
            </div>
        )}
        {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="absolute top-1 right-2 font-bold">X</button>
            </div>
        )}
        <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center">
             <h1 className="text-2xl font-bold text-cyan-400">Nano Craft</h1>
             <div className="flex items-center gap-2">
                <button onClick={clearWorkspace} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors">Clear Workspace</button>
                <button 
                    onClick={handleOpenSettings} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors"
                >
                    Settings
                </button>
             </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
            <Workspace
                ref={workspaceRef}
                workspaceElements={workspaceElements}
                setWorkspaceElements={setWorkspaceElements}
                onCombine={handleCombine}
                onElementClick={(id) => setSelectedElement(getElementById(id) || null)}
                getElementById={getElementById}
                onDropFromPanel={addElementToWorkspace}
            />
            <DiscoveriesPanel
                elements={discoveredElements}
                onElementClick={(id) => setSelectedElement(getElementById(id) || null)}
            />
        </div>
        {selectedElement && (
            <ElementDetailsModal
                element={selectedElement}
                onClose={() => setSelectedElement(null)}
            />
        )}
        {isSettingsOpen && (
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentApiKey={apiKey}
                onApiKeyUpdate={handleApiKeyUpdate}
                onResetProgress={handleResetProgress}
            />
        )}
    </div>
  );
};

export default CraftingInterface;

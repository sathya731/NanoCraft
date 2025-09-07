import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CraftedElement } from '../types';
import { generateInitialInfo } from '../services/geminiService';
import { fileToBase64, urlToBase64 } from '../utils/imageUtils';
import Spinner from './Spinner';
import { initDB, saveElementToDB } from '../utils/db';

interface InitialImageSetupProps {
  apiKey: string;
  onCompleted: () => void;
}

const InitialImageSetup: React.FC<InitialImageSetupProps> = ({ apiKey, onCompleted }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');

  // Fallback images as base64 (small colored squares) in case external sources fail
  const fallbackImages = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2NjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZpcmU8L3RleHQ+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjZiM2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPldhdGVyPC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGNkNDY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVhcnRoPC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZkZDY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFpcjwvdGV4dD48L3N2Zz4='
  ];

  const generateRandomImageUrls = () => {
    // Use a mix of reliable image sources with different approaches
    const timestamp = Date.now();
    return [
      `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
      `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000) + 1000}`,
      `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000) + 2000}`,
      `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000) + 3000}`
    ];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files).slice(0, 4);
      setFiles(selectedFiles);
    }
  };

  const processImages = async (imageSources: (File | string)[]) => {
    setIsLoading(true);
    setError(null);
    
    await initDB();

    for (let i = 0; i < imageSources.length; i++) {
        const source = imageSources[i];
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                setProgressMessage(`Analyzing element ${i + 1} of ${imageSources.length}${retryCount > 0 ? ` (retry ${retryCount})` : ''}...`);
                
                let imageB64: string;
                let mimeType: string;
                
                if (typeof source === 'string') {
                    // Add retry logic for URL fetching
                    try {
                        imageB64 = await urlToBase64(source);
                        mimeType = 'image/jpeg';
                    } catch (urlError) {
                        if (retryCount === maxRetries - 1) {
                            // On final retry, use fallback image
                            const fallbackIndex = i % fallbackImages.length;
                            const fallbackDataUrl = fallbackImages[fallbackIndex];
                            imageB64 = fallbackDataUrl.split(',')[1];
                            mimeType = 'image/svg+xml';
                        } else {
                            throw urlError;
                        }
                    }
                } else {
                    imageB64 = await fileToBase64(source);
                    mimeType = source.type;
                }
                
                const { title, description } = await generateInitialInfo(apiKey, imageB64, mimeType);
                
                const newElement: CraftedElement = {
                    id: uuidv4(),
                    title,
                    description,
                    imageB64,
                    mimeType,
                    parents: null,
                };
                await saveElementToDB(newElement);
                break; // Success, exit retry loop
                
            } catch (err: any) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    setError(`Failed to process image ${i + 1}: ${err.message}. Please try again or use your own images.`);
                    setIsLoading(false);
                    return;
                }
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    // Don't set isLoading to false, as the parent will unmount this component.
    onCompleted();
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
        {isLoading ? (
            <div className="text-center">
                <Spinner />
                <p className="mt-4 text-xl text-cyan-300">{progressMessage}</p>
                <p className="text-gray-400">This may take a moment...</p>
            </div>
        ) : (
            <div className="p-8 bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg text-center">
                <h2 className="text-3xl font-bold mb-4 text-cyan-400">Choose Your Starting Elements</h2>
                <p className="text-gray-400 mb-6">Upload up to 4 images to begin your crafting journey, or start with randomly selected images.</p>
                
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}

                <div className="mb-6">
                    <label htmlFor="file-upload" className="cursor-pointer bg-gray-700 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                        Select up to 4 Images
                    </label>
                    <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    {files.length > 0 && <p className="mt-2 text-sm text-gray-300">{files.length} file(s) selected.</p>}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => processImages(files)}
                        disabled={files.length === 0}
                        className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Start with My Images
                    </button>
                    <button 
                        onClick={() => processImages(generateRandomImageUrls())}
                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md transition-colors duration-300">
                        Start with Random Images
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default InitialImageSetup;


import React, { useState } from 'react';
import { CraftedElement } from '../types';

interface ElementDetailsModalProps {
  element: CraftedElement;
  onClose: () => void;
}

const ElementDetailsModal: React.FC<ElementDetailsModalProps> = ({ element, onClose }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${element.imageB64}`;
    link.download = `${element.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-lg relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">{element.title}</h2>
            <div className="w-64 h-64 mb-4 bg-gray-900/50 rounded-lg overflow-hidden border border-gray-600">
                <img
                    src={`data:image/png;base64,${element.imageB64}`}
                    alt={element.title}
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="w-full mb-6">
                <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center justify-between w-full text-left text-gray-400 hover:text-white transition-colors"
                >
                    <span className="text-sm font-medium">Description</span>
                    <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isDescriptionExpanded && (
                    <div className="mt-2 text-gray-300 text-center text-sm leading-relaxed">
                        {element.description}
                    </div>
                )}
            </div>
            <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md transition-colors"
            >
                Download Image
            </button>
        </div>
      </div>
    </div>
  );
};

export default ElementDetailsModal;


import React from 'react';
import { CraftedElement } from '../types';
import ElementCard from './ElementCard';

interface DiscoveriesPanelProps {
  elements: CraftedElement[];
  onElementClick: (elementId: string) => void;
}

const DiscoveriesPanel: React.FC<DiscoveriesPanelProps> = ({ elements, onElementClick }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, elementId: string) => {
        e.dataTransfer.setData('elementId', elementId);
    };

    return (
        <div className="w-1/4 max-w-sm bg-gray-800 p-4 flex flex-col border-l border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-center text-cyan-400">Discoveries ({elements.length})</h2>
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    {elements.map(element => (
                        <div
                            key={element.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, element.id)}
                            onClick={() => onElementClick(element.id)}
                            className="cursor-pointer"
                        >
                            <ElementCard element={element} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DiscoveriesPanel;


import React from 'react';
import { CraftedElement } from '../types';

interface ElementCardProps {
  element: CraftedElement;
  isDragging?: boolean;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, isDragging }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-2 bg-gray-700/50 rounded-lg backdrop-blur-sm border border-gray-600 aspect-square select-none transition-all duration-200 ${
        isDragging ? 'shadow-2xl shadow-cyan-500/50 scale-110 border-cyan-400' : 'hover:border-cyan-500'
      }`}
    >
      <img
        src={`data:image/png;base64,${element.imageB64}`}
        alt={element.title}
        className="w-full h-full object-contain flex-1 pointer-events-none"
        style={{ minHeight: 0 }}
      />
      <p className="text-center text-sm font-semibold mt-1 truncate w-full">{element.title}</p>
    </div>
  );
};

export default ElementCard;

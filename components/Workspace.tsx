import React, { useState, useRef, forwardRef } from 'react';
import { WorkspaceElement } from '../types';
import ElementCard from './ElementCard';

interface WorkspaceProps {
  workspaceElements: WorkspaceElement[];
  setWorkspaceElements: React.Dispatch<React.SetStateAction<WorkspaceElement[]>>;
  onCombine: (elem1Id: string, elem2Id: string) => void;
  onElementClick: (elementId: string) => void;
  getElementById: (id: string) => any;
  onDropFromPanel: (elementId: string, clientX: number, clientY: number) => void;
}

const Workspace = forwardRef<HTMLDivElement, WorkspaceProps>(({
  workspaceElements,
  setWorkspaceElements,
  onCombine,
  onElementClick,
  getElementById,
  onDropFromPanel
}, ref) => {
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('elementId');
    if (elementId) {
        onDropFromPanel(elementId, e.clientX, e.clientY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, instanceId: string) => {
    e.preventDefault();
    hasMoved.current = false;
    const element = workspaceElements.find(el => el.instanceId === instanceId);
    if (!element) return;

    setDraggingElement(instanceId);
    
    dragOffset.current = {
      x: e.clientX - element.x,
      y: e.clientY - element.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
        hasMoved.current = true;
        if (!ref || typeof ref === 'function' || !ref.current) return;
        const workspaceRect = ref.current.getBoundingClientRect();
        
        let newX = moveEvent.clientX - dragOffset.current.x;
        let newY = moveEvent.clientY - dragOffset.current.y;
        
        newX = Math.max(0, Math.min(newX, workspaceRect.width - element.width));
        newY = Math.max(0, Math.min(newY, workspaceRect.height - element.height));

        setWorkspaceElements(prev =>
            prev.map(el => el.instanceId === instanceId ? { ...el, x: newX, y: newY } : el)
        );
    };

    const handleMouseUp = () => {
      if (!hasMoved.current) {
        // This was a click, not a drag
        onElementClick(element.elementId);
      } else {
        // This was a drag, check for combination
        checkForCombination(instanceId);
      }

      setDraggingElement(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const checkForCombination = (movedInstanceId: string) => {
      const movedElement = workspaceElements.find(e => e.instanceId === movedInstanceId);
      if (!movedElement) return;

      for (const otherElement of workspaceElements) {
          if (otherElement.instanceId === movedInstanceId) continue;
          
          const overlap = !(
              movedElement.x > otherElement.x + otherElement.width ||
              movedElement.x + movedElement.width < otherElement.x ||
              movedElement.y > otherElement.y + otherElement.height ||
              movedElement.y + movedElement.height < otherElement.y
          );

          if (overlap) {
              onCombine(movedElement.instanceId, otherElement.instanceId);
              break; 
          }
      }
  };

  return (
    <div
      ref={ref}
      className="flex-1 bg-gray-800/50 m-4 rounded-lg relative overflow-hidden border border-gray-700"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '20px 20px'}}
    >
      {workspaceElements.map(wElement => {
        const element = getElementById(wElement.elementId);
        if (!element) return null;
        return (
          <div
            key={wElement.instanceId}
            onMouseDown={(e) => handleMouseDown(e, wElement.instanceId)}
            className="absolute cursor-grab"
            style={{
              left: `${wElement.x}px`,
              top: `${wElement.y}px`,
              width: `${wElement.width}px`,
              height: `${wElement.height}px`,
              zIndex: draggingElement === wElement.instanceId ? 10 : 1,
            }}
          >
            <ElementCard element={element} isDragging={draggingElement === wElement.instanceId} />
          </div>
        );
      })}
    </div>
  );
});

export default Workspace;
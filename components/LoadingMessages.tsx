import React, { useState, useEffect } from 'react';

interface LoadingMessagesProps {
  primaryMessage?: string;
  className?: string;
}

const LoadingMessages: React.FC<LoadingMessagesProps> = ({ 
  primaryMessage, 
  className = "mt-4 text-lg text-cyan-300" 
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const rotatingMessages = [
    "🎨 Mixing visual concepts...",
    "✨ Weaving magic into pixels...",
    "🔮 Generating something unique...",
    "🎭 Blending artistic elements...",
    "💫 Creating visual harmony...",
    "🌟 Crafting the unexpected...",
    "🎪 Combining creative forces...",
    "🦋 Transforming imagination...",
    "💎 Polishing your creation..."
  ];

  const combiningMessages = [
    "🔥 Fusing elements together...",
    "⚡ Channeling creative energy...",
    "🌊 Blending essences seamlessly...",
    "🎨 Painting with AI brushstrokes...",
    "🔬 Experimenting with visuals...",
    "🎭 Choreographing pixel dance...",
    "🌈 Mixing color and concept...",
    "✨ Sparking new possibilities...",
    "🎪 Creating visual symphony...",
    "🚀 Launching into creativity..."
  ];

  // Use combining messages if primary message contains "combining"
  const messages = primaryMessage?.toLowerCase().includes('combining') 
    ? combiningMessages 
    : rotatingMessages;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  // If there's a primary message, show it first, then rotate through others
  const displayMessage = primaryMessage || messages[currentMessageIndex];

  return (
    <div className={className}>
      <p className="animate-pulse">{displayMessage}</p>
      {!primaryMessage && (
        <div className="flex justify-center mt-2">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
                index === currentMessageIndex ? 'bg-cyan-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingMessages;

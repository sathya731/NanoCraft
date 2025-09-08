
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
    </div>
  );
};

export default Spinner;

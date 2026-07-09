import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick?: () => void;
}

export const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button 
      id="tour-add-btn" 
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-[#ffa116] via-[#ff9345] to-[#ff3d00] hover:scale-105 active:scale-95 text-white flex items-center justify-center cursor-pointer shadow-lg hover:shadow-orange-500/25 transition-all duration-200 border-0" 
      onClick={onClick}
      title="Add new problem"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </button>
  );
};
export default FAB;

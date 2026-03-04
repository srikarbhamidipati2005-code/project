import React from 'react';
import { Save } from 'lucide-react';

interface NavbarProps {
  onSave?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSave }) => {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 w-full shrink-0 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          G
        </div>
        <span className="font-semibold text-gray-800 text-lg tracking-tight">GenAI Stack</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
        >
          <Save size={16} />
          Save
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold cursor-pointer shrink-0">
          S
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import { ChevronUp } from 'lucide-react';
import React, { useState } from 'react'

const SidebarCollections = ({text}:{text:string}) => {
      const [isOpen, setIsOpen] = useState(false);
    
  return (
    <>
    <span className="flex flex-row gap-2 mt-2 items-center text-blue-400">
      {text}
      <ChevronUp
        size={16}
        className={`rotate-${isOpen ? 0 : 180} hover:rotate-${!isOpen ? 0 : 180} transition-transform duration-300`}
      />
    </span>
    <div className="flex items-center py-2">
      <div className="w-6 h-6 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
      </div>
      <span className="ml-2 text-sm">Work</span>
      <span className="ml-auto text-gray-400 text-xs">32</span>
    </div>

    <div className="flex items-center py-2">
      <div className="w-6 h-6 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
      </div>
      <span className="ml-2 text-sm">Team events</span>
      <span className="ml-auto text-gray-400 text-xs">42</span>
    </div>

    <div className="flex items-center py-2">
      <div className="w-6 h-6 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      </div>
      <span className="ml-2 text-sm">Applications</span>
      <span className="ml-auto text-gray-400 text-xs">12</span>
    </div>

    <div className="flex items-center py-1 text-gray-500 text-xs">
      <span>Show me 12 hidden</span>

    </div>
  </>
  )
}

export default SidebarCollections
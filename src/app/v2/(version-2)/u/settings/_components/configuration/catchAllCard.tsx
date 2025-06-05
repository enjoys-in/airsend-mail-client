import React from 'react';
 
const CatchAllCard: React.FC = () => {
  return (
    <div className="bg-black text-white py-8 px-4 w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">Catch-all address</h1>
        
        <p className="text-gray-300 mb-2 max-w-3xl">
          If you have a custom domain with Proton Mail, you can set a catch-all email address to 
          receive messages sent to your domain but to an invalid email address (e.g., because of 
          typos).
        </p>
        
        <a 
          href="#" 
          className="text-blue-400 hover:text-blue-300 inline-flex items-center mb-6 transition-colors"
        >
          Learn more
        </a>
        
        <div className="mt-4 bg-gray-900/70 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <p className="text-gray-200 mb-3 md:mb-0">
            Included with Mail Plus, Proton Unlimited, and Proton for Business.
          </p>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatchAllCard;
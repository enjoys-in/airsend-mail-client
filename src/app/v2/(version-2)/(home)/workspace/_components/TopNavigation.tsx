import { Search, User } from "lucide-react";

const TopNavigation = () => {
  return (
    <header className="h-14 bg-secondary flex items-center justify-between px-4 border-b border-gray-700">
      <div className="flex items-center">
        <img src="/placeholder.svg" alt="Logo" className="h-8 w-8 mr-4" />
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="bg-background text-sm rounded-md px-3 py-1.5 pl-8 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center">
        <button className="p-2 hover:bg-background rounded-full">
          <User className="h-5 w-5 text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;
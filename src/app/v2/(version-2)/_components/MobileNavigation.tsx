import { Server, MessageCircle, Bell, User } from "lucide-react";

const MobileNavigation = () => {
  return (
    <nav className="bottom-0 left-0 right-0 h-[50px] bg-stone-900 flex justify-around items-center px-4v">
      <button className="text-gray-300 hover:text-white">
        <Server className="h-6 w-6" />
      </button>
      <button className="text-gray-300 hover:text-white">
        <MessageCircle className="h-6 w-6" />
      </button>
      <button className="text-gray-300 hover:text-white">
        <Bell className="h-6 w-6" />
      </button>
      <button className="text-gray-300 hover:text-white">
        <User className="h-6 w-6" />
      </button>
    </nav>
  );
};

export default MobileNavigation;
import AccountSwitcher2 from "@/components/account/account-switcher2";
import { Separator } from "@/components/ui/separator";
import { Hash, Settings, Bell, LogOut, ChevronDown, Plus, Speaker, Volume, Volume2Icon } from 'lucide-react';
const ChannelList = () => {
  const isOpen = true;
  const channels = [
    { id: 1, name: 'general', icon: <Hash className="w-4 h-4 text-gray-400" />, hasNewMessages: true },
    { id: 2, name: 'announcements', icon: <Bell className="w-4 h-4 text-gray-400" />, hasNewMessages: false },
    { id: 3, name: 'frontend', icon: <Hash className="w-4 h-4 text-gray-400" />, hasNewMessages: true },
  ];
  return (
    <aside className="w-full hidden md:block">
      <div
        className={`h-full flex flex-col transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between text-white">
            <h1 className="text-xl font-semibold text-white">Workspace</h1>
            <Settings className="w-5 h-5 cursor-pointer hover:text-gray-300 transition-colors duration-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <div>
              <ChevronDown className="w-4 h-4 cursor-pointer hover:text-white transition-colors duration-500 inline-block"/>
              <span className="text-xs uppercase font-semibold">Spaces</span>
              </div>
              <Plus className="w-4 h-4 cursor-pointer hover:text-white transition-colors duration-500" />
            </div>

            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex justify-between space-x-2 py-1 px-1  rounded cursor-pointer text-gray-400 hover:bg-[#4567b7] hover:text-white group transition-all duration-500"
              >
                <div className="flex gap-2">
                  <div className={`relative ${channel.hasNewMessages ? 'text-white' : ''}`}>
                    {channel.icon}
                    {channel.hasNewMessages && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#43B581] rounded-full new-message-badge"></span>
                    )}
                  </div>
                  <span className="text-sm">{channel.name}</span>
                  <span className="bg-pink-100 text-fuchsia-600 text-xs px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                </div>
                {channel.hasNewMessages &&<span className="text-gray-300 text-xs bg-stone-900 px-2 py-0.5 rounded-full">8</span>}
              </div>
            ))}
          </div>
          <Separator className="bg-gray-700" />
          <div className="p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
              <div>
              <ChevronDown className="w-4 h-4 cursor-pointer hover:text-white transition-colors duration-500 inline-block"/>
              <span className="text-xs uppercase font-semibold">Voice Spaces</span>
              </div>
              <Plus className="w-4 h-4 cursor-pointer hover:text-white transition-colors duration-500" />
            </div>
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center space-x-2 py-1 px-1  rounded cursor-pointer text-gray-400 hover:bg-[#4567b7] hover:text-white group transition-all duration-500"
              >
                <div className={`relative ${channel.hasNewMessages ? 'text-white' : ''}`}>
                 <Volume2Icon className="w-4 h-4 text-gray-400"/>
                  {channel.hasNewMessages && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#43B581] rounded-full new-message-badge"></span>
                  )}
                </div>
                <span className="text-sm">{channel.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-gray-400">
            Change Workspace Here   
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChannelList;
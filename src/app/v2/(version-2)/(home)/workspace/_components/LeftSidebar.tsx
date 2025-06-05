import { cn } from "@/lib/utils";
import { Hash, MessageCircle, Plus } from "lucide-react";

const WorkSpaceLeftSidebar = () => {
  const isActive = false;
  return (
    <aside className="w-16 bg-left-sidebar flex-shrink-0 overflow-y-auto">
      <div className="flex flex-col items-center py-4 space-y-4">
        {/* First Icon */}
        <div className="w-full h-12 flex items-center justify-between">
          {isActive ?
            <div className="border-r-4 border-gray-400 h-10 flex items-center justify-center rounded-tr-lg rounded-br-lg" />
            : <div />}
          <div className={cn("group relative  flex items-center justify-center px-2 py-2.5 w-12 h-12 bg-stone-800 rounded-lg hover:bg-stone-900 hover:rounded-2xl mr-2",)}>
            <MessageCircle className="text-white w-6 h-6 " />
          </div>
        </div>
        {Array.from({ length: 1 }).map((_, index) => (
          <div className="w-full h-12 flex items-center justify-between" key={index}>
            {isActive ? (
              <div className="border-r-4 border-gray-400 h-10 flex items-center justify-center rounded-tr-lg rounded-br-lg" />
            ) : <div />}
            <div className={cn("group relative  flex items-center justify-center px-2 py-2.5 w-12 h-12 bg-stone-800 rounded-lg hover:bg-stone-900 hover:rounded-2xl mr-2",)}>
              <Hash className="text-white w-6 h-6 " />
            </div>
          </div>
        ))}

        <div className="group relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-300">
          <Plus className="text-black w-6 h-6" />
          <div className="hidden group-hover:block absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded">
            Add
          </div>
        </div>
      </div>
    </aside>

  );
};

export default WorkSpaceLeftSidebar;
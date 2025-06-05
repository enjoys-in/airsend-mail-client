import { X } from "lucide-react";

const RightSidebar = ({ onClose }: { onClose: () => void }) => {
  return (
    <aside className="w-64 bg-right-sidebar border-l border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Channel Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">About</h3>
            <p className="text-sm text-gray-600">
              This is a channel for general discussion.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Members</h3>
            <div className="space-y-2">
              {["User 1", "User 2", "User 3"].map((user) => (
                <div key={user} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  <span className="text-sm">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
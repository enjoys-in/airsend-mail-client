import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
  } from "@/components/ui/dropdown-menu";
  
  import {
    Archive,
    BellOff,
    CheckSquare,
    ChevronRight,
    Clock,
    ExternalLink,
    MoveRight,
    Search,
    Tag,
    Trash2,
  } from "lucide-react";
  
  export function MailDropdown({ children }: { children: React.ReactNode }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoveRight className="h-4 w-4" />
                <span>Move to tab</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {[
                { label: "Primary", color: "bg-blue-500" },
                { label: "Promotions", color: "bg-green-500" },
                { label: "Updates", color: "bg-yellow-500" },
                { label: "Forums", color: "bg-purple-500" },
              ].map(({ label, color }) => (
                <DropdownMenuItem key={label}>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 flex items-center justify-center">
                      <span className={`block h-2 w-2 rounded-full ${color}`}></span>
                    </div>
                    <span>{label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
  
          {[
            { label: "Reply", icon: <MoveRight className="h-4 w-4 rotate-180" /> },
            { label: "Reply all", icon: <MoveRight className="h-4 w-4 rotate-180" /> },
            { label: "Forward", icon: <MoveRight className="h-4 w-4" /> },
            { label: "Forward as attachment", icon: <MoveRight className="h-4 w-4" /> },
          ].map(({ label, icon }) => (
            <DropdownMenuItem key={label}>
              <div className="flex items-center gap-2">{icon}<span>{label}</span></div>
            </DropdownMenuItem>
          ))}
  
          <DropdownMenuSeparator />
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span>Archive</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 flex items-center justify-center font-bold text-xs">!</span>
              <span>Mark as unread</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Snooze</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>Add to Tasks</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoveRight className="h-4 w-4" />
                <span>Move to</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {["Inbox", "Sent", "Drafts", "Spam", "Trash"].map(label => (
                <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
  
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>Label as</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {["Important", "Work", "Personal", "To-do", "Create new"].map(label => (
                <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              <span>Mute</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Find emails from Swarup Bhise</span>
            </div>
          </DropdownMenuItem>
  
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <span>Open in new window</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
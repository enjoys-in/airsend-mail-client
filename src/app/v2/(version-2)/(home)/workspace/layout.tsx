"use client";
import { useState } from "react";
 
import RightSidebar from "./_components/RightSidebar";
 
import { useIsMobile } from "@/hooks/use-mobile";
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
           
        <main className="flex-1 flex flex-col bg-background overflow-y-auto">
          {children}
        </main>
        {!isMobile && isRightSidebarOpen && (
          <RightSidebar onClose={() => setIsRightSidebarOpen(false)} />
        )}
      </div>
     
    </div>
  );
};

export default MainLayout;
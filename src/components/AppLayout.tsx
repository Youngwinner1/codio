import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { useStockAlerts } from "@/hooks/useStockAlerts";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  useStockAlerts(); // Real-time stock monitoring for all connected users

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        collapsed ? "ml-[70px]" : "ml-[260px]"
      )}>
        <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

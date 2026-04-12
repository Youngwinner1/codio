import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Truck, BarChart3,
  Users, Settings, Bell, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUnreadNotificationCount } from "@/hooks/useData";

const menuItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/" },
  { label: "Ventes / Facturation", icon: ShoppingCart, path: "/sales" },
  { label: "Produits / Stock", icon: Package, path: "/products" },
  { label: "Fournisseurs", icon: Truck, path: "/suppliers" },
  { label: "Rapports & Statistiques", icon: BarChart3, path: "/reports" },
  { label: "Utilisateurs", icon: Users, path: "/users" },
  { label: "Paramètres", icon: Settings, path: "/settings" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { business } = useBusiness();
  const { data: alertCount = 0 } = useUnreadNotificationCount();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar flex flex-col z-50 transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "w-[70px]" : "w-[260px]"
    )}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src={business?.logo_url || "/logo-codio.png"} alt="Codio" className="w-9 h-9 rounded-lg flex-shrink-0 object-cover" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground leading-tight truncate">
              {business?.name || "Codio"}
            </h1>
            <p className="text-[11px] text-sidebar-foreground/60">Gestion Pro</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn("sidebar-link relative", isActive && "sidebar-link-active bg-sidebar-accent")}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {item.path === "/notifications" && alertCount > 0 && (
                <span className={cn(
                  "bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center",
                  collapsed ? "absolute -top-0.5 -right-0.5 w-4 h-4" : "ml-auto w-5 h-5"
                )}>
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-sidebar-border space-y-1">
        <button onClick={signOut} className="sidebar-link w-full text-destructive/80 hover:text-destructive" title="Déconnexion">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </button>
        <button onClick={onToggle} className="sidebar-link w-full justify-center" title={collapsed ? "Étendre" : "Réduire"}>
          <svg className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="text-sm">Réduire</span>}
        </button>
      </div>
    </aside>
  );
}

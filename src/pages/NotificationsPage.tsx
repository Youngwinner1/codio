import { Loader2, AlertTriangle, CheckCircle, Package, Bell, Check } from "lucide-react";
import { useNotifications } from "@/hooks/useData";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { business } = useBusiness();
  const qc = useQueryClient();

  const markAllRead = async () => {
    if (!business) return;
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications_unread"] });
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications_unread"] });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    if (type === "stock_out") return Package;
    if (type === "stock_low") return AlertTriangle;
    return Bell;
  };

  const getStyle = (type: string) => {
    if (type === "stock_out") return { container: "border-l-4 border-l-destructive", icon: "text-destructive bg-destructive/10" };
    if (type === "stock_low") return { container: "border-l-4 border-l-warning", icon: "text-warning bg-warning/10" };
    return { container: "", icon: "text-primary bg-primary/10" };
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Toutes lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <Check className="w-4 h-4" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="stat-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-success bg-success/10">
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium">Tout est en ordre ! Aucune alerte.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = getIcon(n.type);
            const style = getStyle(n.type);
            return (
              <div
                key={n.id}
                className={`stat-card flex items-start gap-3 cursor-pointer transition-opacity ${style.container} ${n.is_read ? "opacity-60" : ""}`}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

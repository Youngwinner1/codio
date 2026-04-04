import { useState } from "react";
import { Bell, Check, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { notifications as initialNotifs } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};
const colorMap = {
  warning: 'text-warning bg-warning/10',
  success: 'text-success bg-success/10',
  info: 'text-info bg-info/10',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(initialNotifs);
  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">{unread} non lue{unread > 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <Check className="w-4 h-4" /> Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.map(n => {
          const Icon = iconMap[n.type];
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`stat-card flex items-start gap-3 cursor-pointer ${!n.read ? 'border-l-4 border-l-primary' : 'opacity-60'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
              </div>
              {!n.read && <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

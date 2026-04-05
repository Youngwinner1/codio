import { Loader2, AlertTriangle, CheckCircle, Info, Package } from "lucide-react";
import { useProducts } from "@/hooks/useData";
import { useBusiness } from "@/contexts/BusinessContext";

export default function NotificationsPage() {
  const { data: products = [], isLoading } = useProducts();
  const { formatCurrency } = useBusiness();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  // Generate real notifications from data
  const notifications: { id: string; type: "warning" | "success" | "info"; message: string; icon: any }[] = [];

  // Low stock alerts
  products.filter(p => p.quantity <= p.min_stock).forEach(p => {
    notifications.push({
      id: `low-${p.id}`,
      type: "warning",
      message: `Stock faible : ${p.name} (${p.quantity} ${p.unit} restants, seuil: ${p.min_stock})`,
      icon: AlertTriangle,
    });
  });

  // Out of stock
  products.filter(p => p.quantity === 0).forEach(p => {
    notifications.push({
      id: `out-${p.id}`,
      type: "warning",
      message: `Rupture de stock : ${p.name}`,
      icon: Package,
    });
  });

  if (notifications.length === 0) {
    notifications.push({
      id: "all-good",
      type: "success",
      message: "Tout est en ordre ! Aucune alerte pour le moment.",
      icon: CheckCircle,
    });
  }

  const colorMap = {
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
    info: "text-info bg-info/10",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">{notifications.filter(n => n.type === "warning").length} alerte{notifications.filter(n => n.type === "warning").length > 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={`stat-card flex items-start gap-3 ${n.type === "warning" ? "border-l-4 border-l-warning" : ""}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{n.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

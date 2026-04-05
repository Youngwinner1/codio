import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useBusiness } from "@/contexts/BusinessContext";
import { useProducts, useInvoices } from "@/hooks/useData";

export default function Dashboard() {
  const { business, formatCurrency } = useBusiness();
  const { data: products = [], isLoading: loadingProducts } = useProducts();
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();

  if (loadingProducts || loadingInvoices) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.quantity <= p.min_stock);
  const totalStock = products.reduce((s, p) => s + (p.quantity || 0), 0);
  const paidInvoices = invoices.filter(i => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.total), 0);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyRevenue = paidInvoices.filter(i => i.date?.startsWith(thisMonth)).reduce((s, i) => s + Number(i.total), 0);

  // Monthly chart data from invoices
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const monthlyData = monthNames.map((month, idx) => {
    const monthStr = `${now.getFullYear()}-${String(idx + 1).padStart(2, "0")}`;
    const rev = paidInvoices.filter(i => i.date?.startsWith(monthStr)).reduce((s, i) => s + Number(i.total), 0);
    return { month, revenue: rev };
  });

  // Recent invoices as sales
  const recentSales = invoices.slice(0, 5);

  const stats = [
    { label: "Chiffre d'affaires total", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "bg-primary/10 text-primary" },
    { label: "Revenus du mois", value: formatCurrency(monthlyRevenue), icon: ShoppingCart, color: "bg-success/10 text-success" },
    { label: "Produits en stock", value: totalStock.toString(), icon: Package, color: "bg-info/10 text-info" },
    { label: "Alertes stock", value: lowStockProducts.length.toString(), icon: AlertTriangle, color: "bg-warning/10 text-warning" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {business?.name || "Votre entreprise"} — Vue d'ensemble
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold mt-1.5">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Chiffre d'affaires mensuel</h3>
          {invoices.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
              Créez des factures pour voir les statistiques
            </div>
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-4">Alertes stock faible</h3>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-2.5">
              {lowStockProducts.slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.quantity} {p.unit} restants</p>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Aucune alerte
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-3">Dernières factures</h3>
          {recentSales.length > 0 ? (
            <div className="space-y-2.5">
              {recentSales.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{inv.client_name}</p>
                    <p className="text-xs text-muted-foreground">{inv.invoice_number} · {new Date(inv.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span className={`text-sm font-semibold ${inv.status === "paid" ? "text-success" : "text-warning"}`}>
                    {formatCurrency(Number(inv.total))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground text-sm">Aucune facture encore</p>
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-3">Résumé des produits</h3>
          {products.length > 0 ? (
            <div className="space-y-2.5">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Total produits</span>
                <span className="text-sm font-semibold">{products.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Valeur du stock</span>
                <span className="text-sm font-semibold">{formatCurrency(products.reduce((s, p) => s + (p.selling_price * p.quantity), 0))}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Stock critique</span>
                <span className="text-sm font-semibold text-warning">{lowStockProducts.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Factures totales</span>
                <span className="text-sm font-semibold">{invoices.length}</span>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground text-sm">Ajoutez des produits pour commencer</p>
          )}
        </div>
      </div>
    </div>
  );
}
